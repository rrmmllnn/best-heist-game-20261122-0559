// Gilded Vault — the heist itself.
// One job: own the state machine, the alarm, the loot and the getaway,
// and drive the loop that ties input, patrols, tools and rendering together.

import { TILE, TUNING } from './config.js';
import { LEVELS as LEVEL_DEFS, parseMap } from './levels.js';
import { hasLineOfSight, insideCone, distanceToLaserSegment, laserIsLive, pointBlocked } from './vision.js';
import { makeGuard, makeCamera, updateGuard, updateCamera } from './patrol.js';
import { makeTools, resetToolsForLevel, throwSmoke, fireEmp, insideSmoke, updateTools, nearestDoor, empActive } from './tools.js';
import { makeInput, moveVector, consumePress } from './input.js';
import { drawGame } from './render.js';
import { setupShot } from './stage.js';
import {
  makeAudio, playStep, playPickup, playSmoke, playEmp, playPick,
  playUnlock, playLaserZap, playWin, playCaught, startAlarmLoop, stopAlarmLoop,
} from './audio.js';

export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  const game = {
    canvas,
    ctx,
    screen: 'title',
    levelIndex: 0,
    level: LEVEL_DEFS[0],
    parsed: null,
    player: { x: 60, y: 60, sneaking: false, inVent: false, seenRecently: false },
    guards: [],
    cameras: [],
    lasers: [],
    tools: makeTools(),
    input: makeInput(canvas),
    audio: makeAudio(),
    alarm: 0,
    time: 0,
    levelTime: 0,
    score: 0,
    levelScore: 0,
    lootTaken: false,
    spottedFlash: 0,
    caughtTimer: 0,
    laserZapAt: -10,
    stepAt: 0,
    staged: false,
    stagedTime: 0,
  };
  game.loadLevel = (i) => loadLevel(game, i);
  game.loadLevel(0);
  game.screen = 'title';
  return game;
}

function loadLevel(game, i) {
  game.levelIndex = i;
  game.level = LEVEL_DEFS[i];
  game.parsed = parseMap(game.level.map);
  game.guards = game.level.guards.map(makeGuard);
  game.cameras = game.level.cameras.map(makeCamera);
  game.lasers = game.level.lasers.map((l) => ({ ...l }));
  resetToolsForLevel(game.tools);
  game.player.x = game.parsed.start.x;
  game.player.y = game.parsed.start.y;
  game.player.sneaking = false;
  game.player.inVent = false;
  game.player.seenRecently = false;
  game.alarm = 0;
  game.levelTime = 0;
  game.lootTaken = false;
  game.spottedFlash = 0;
  game.caughtTimer = 0;
  game.levelScore = 0;
  game.screen = 'play';
  stopAlarmLoop(game.audio);
}

function collides(game, x, y) {
  const r = 13;
  const pts = [
    [x - r, y - r], [x + r, y - r], [x - r, y + r], [x + r, y + r],
    [x, y - r], [x, y + r], [x - r, y], [x + r, y],
  ];
  return pts.some(([px, py]) => pointBlocked(game.parsed, game.level.map, px, py));
}

function tryMove(game, dx, dy) {
  const p = game.player;
  if (dx !== 0 && !collides(game, p.x + dx, p.y)) p.x += dx;
  if (dy !== 0 && !collides(game, p.x, p.y + dy)) p.y += dy;
}

function playerTile(game) {
  return {
    col: Math.floor(game.player.x / TILE),
    row: Math.floor(game.player.y / TILE),
  };
}

function updatePlay(game, dt) {
  const p = game.player;
  const input = game.input;
  game.time += dt;
  game.levelTime += dt;

  // Tools on key press.
  if (consumePress(input, 'KeyQ')) {
    if (throwSmoke(game.tools, p.x, p.y, game.time)) playSmoke(game.audio);
  }
  if (consumePress(input, 'KeyE')) {
    if (fireEmp(game.tools, game.time)) {
      playEmp(game.audio);
      for (const cam of game.cameras) cam.frozen = TUNING.empSeconds;
    }
  }
  if (consumePress(input, 'KeyM')) game.audio.muted = !game.audio.muted;

  // Lockpick: hold F beside a shut gold door.
  const door = nearestDoor(game.parsed, p.x, p.y);
  if (input.lockpickHeld && door) {
    if (!game.tools.lockpick.active) {
      game.tools.lockpick.active = true;
      game.tools.lockpick.target = door;
      game.tools.lockpick.progress = 0;
    }
    if (Math.random() < dt * 6) playPick(game.audio);
  } else if (game.tools.lockpick.active) {
    game.tools.lockpick.active = false;
    game.tools.lockpick.target = null;
    game.tools.lockpick.progress = 0;
  }
  const picked = updateTools(game.tools, dt, game.time);
  if (picked === 'picked') playUnlock(game.audio);
  if (game.tools.lockpick.active && game.tools.lockpick.target) {
    game.tools.lockpick.target.progress = game.tools.lockpick.progress;
  }

  // Movement: keyboard wins, otherwise walk to the mouse click.
  const vec = moveVector(input);
  const tile = playerTile(game);
  const tileCh = game.level.map[tile.row][tile.col];
  p.inVent = tileCh === 'v';
  p.sneaking = input.sneak;
  const speed = p.inVent ? TUNING.ventSpeed : p.sneaking ? TUNING.sneakSpeed : TUNING.thiefSpeed;
  if (vec.x !== 0 || vec.y !== 0) {
    game.input.clickTarget = null;
    tryMove(game, vec.x * speed * dt, vec.y * speed * dt);
  } else if (input.clickTarget) {
    const dx = input.clickTarget.x - p.x;
    const dy = input.clickTarget.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 9) {
      input.clickTarget = null;
    } else {
      tryMove(game, (dx / dist) * speed * dt, (dy / dist) * speed * dt);
    }
  }
  if ((vec.x !== 0 || vec.y !== 0) && game.time - game.stepAt > 0.34) {
    game.stepAt = game.time;
    playStep(game.audio);
  }

  // Patrols and cameras.
  for (const guard of game.guards) updateGuard(guard, dt, game.time, game.alarm, p);
  for (const camera of game.cameras) updateCamera(camera, dt, game.time);

  // Being seen: cones, then lasers.
  const hidden = p.inVent || insideSmoke(game.tools, p.x, p.y, game.time);
  let seen = false;
  const frozen = empActive(game.tools);
  if (!hidden) {
    for (const guard of game.guards) {
      const res = insideCone(game.parsed, game.level.map, guard, p, TUNING.guardSight, TUNING.guardConeHalf);
      if (res.seen) {
        const rate = TUNING.alarmRiseGuard * (1.35 - (res.dist / TUNING.guardSight) * 0.6) * (p.sneaking ? 0.55 : 1);
        game.alarm += rate * dt;
        seen = true;
      }
    }
    if (!frozen) {
      for (const camera of game.cameras) {
        const res = insideCone(game.parsed, game.level.map, camera, p, TUNING.cameraSight, TUNING.cameraConeHalf);
        if (res.seen) {
          game.alarm += TUNING.alarmRiseCamera * (p.sneaking ? 0.6 : 1) * dt;
          seen = true;
        }
      }
    }
    if (!frozen) {
      for (const laser of game.lasers) {
        if (laserIsLive(laser, game.time) && distanceToLaserSegment(laser, p.x, p.y) < 15) {
          game.alarm += TUNING.alarmRiseLaser * dt;
          seen = true;
          if (game.time - game.laserZapAt > 0.5) {
            game.laserZapAt = game.time;
            playLaserZap(game.audio);
          }
        }
      }
    }
  }
  p.seenRecently = seen;
  if (!seen) game.alarm = Math.max(0, game.alarm - TUNING.alarmFall * dt);
  game.alarm = Math.min(100, game.alarm);
  game.spottedFlash = seen && game.alarm >= TUNING.alarmWarnAt ? 1 : Math.max(0, game.spottedFlash - dt * 2);

  // Alarm siren loop while hot.
  if (game.alarm >= TUNING.alarmWarnAt) startAlarmLoop(game.audio);
  else if (game.alarm < 40) stopAlarmLoop(game.audio);

  // Caught: a fair grace window to break line of sight first.
  if (game.alarm >= 100) {
    game.caughtTimer += dt;
    if (game.caughtTimer >= TUNING.spotGraceSeconds) {
      game.screen = 'caught';
      stopAlarmLoop(game.audio);
      playCaught(game.audio);
      return;
    }
  } else {
    game.caughtTimer = 0;
  }

  // Loot, then the getaway.
  if (!game.lootTaken) {
    const d = Math.hypot(p.x - game.parsed.loot.x, p.y - game.parsed.loot.y);
    if (d < 30) {
      game.lootTaken = true;
      game.score += TUNING.lootScore;
      game.levelScore += TUNING.lootScore;
      playPickup(game.audio);
    }
  } else {
    const d = Math.hypot(p.x - game.parsed.exit.x, p.y - game.parsed.exit.y);
    if (d < 30) {
      const bonus = Math.max(100, TUNING.levelTimeBonus - Math.floor(game.levelTime) * 5);
      game.score += bonus;
      game.levelScore += bonus;
      stopAlarmLoop(game.audio);
      if (game.levelIndex >= LEVEL_DEFS.length - 1) {
        game.screen = 'win';
        playWin(game.audio);
      } else {
        game.screen = 'levelDone';
        playWin(game.audio);
      }
      return;
    }
  }
}

function update(game, dt) {
  const input = game.input;
  if (game.staged) return;
  if (game.screen === 'title') {
    if (consumePress(input, 'Enter') || consumePress(input, 'Mouse') || consumePress(input, 'Space')) {
      game.score = 0;
      game.loadLevel(0);
    }
    return;
  }
  if (game.screen === 'play') {
    updatePlay(game, dt);
    return;
  }
  if (game.screen === 'caught') {
    if (consumePress(input, 'KeyR') || consumePress(input, 'Enter')) game.loadLevel(game.levelIndex);
    return;
  }
  if (game.screen === 'levelDone') {
    if (consumePress(input, 'Enter') || consumePress(input, 'Mouse')) {
      game.loadLevel(game.levelIndex + 1);
    }
    return;
  }
  if (game.screen === 'win') {
    if (consumePress(input, 'KeyR') || consumePress(input, 'Enter')) {
      game.score = 0;
      game.loadLevel(0);
    }
  }
}

function boot() {
  const canvas = document.getElementById('game');
  const game = createGame(canvas);
  window.__gildedVault = game;
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) setupShot(game, shot);
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(game, dt);
    drawGame(game.ctx, game);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
