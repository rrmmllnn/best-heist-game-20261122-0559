// Gilded Vault — everything you see.
// One job: paint the museum, its people, its cones, and the HUD on canvas.

import { TILE, COLS, ROWS, VIEW_W, VIEW_H, PALETTE, TUNING, LEVEL_NAMES, LOOT_NAMES } from './config.js';
import { laserIsLive } from './vision.js';

function conePath(ctx, x, y, angle, range, half) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
}

function drawCone(ctx, x, y, angle, range, half, fill) {
  conePath(ctx, x, y, angle, range, half);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawFloor(ctx, parsed, rows) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = rows[r][c];
      const x = c * TILE;
      const y = r * TILE;
      if (ch === '#') continue;
      ctx.fillStyle = (c + r) % 2 === 0 ? PALETTE.floorDark : PALETTE.floorLight;
      ctx.fillRect(x, y, TILE, TILE);
      if (ch === 'v') {
        ctx.fillStyle = '#0d2126';
        ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
        ctx.strokeStyle = '#3a6a76';
        ctx.lineWidth = 2;
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(x + 6, y + i * 10);
          ctx.lineTo(x + TILE - 6, y + i * 10);
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = PALETTE.marbleVein;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 30);
        ctx.lineTo(x + 26, y + 10);
        ctx.stroke();
      }
    }
  }
}

function drawWalls(ctx, parsed, rows) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (rows[r][c] !== '#') continue;
      const x = c * TILE;
      const y = r * TILE;
      ctx.fillStyle = PALETTE.wall;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = PALETTE.wallTop;
      ctx.fillRect(x, y, TILE, 6);
      ctx.strokeStyle = 'rgba(242,193,78,0.16)';
      ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
    }
  }
  // Gilded paintings on the top wall, between the guards' patrols.
  const frames = [4, 12, 20, 29];
  for (const c of frames) {
    const x = c * TILE + 4;
    const y = 6;
    ctx.fillStyle = PALETTE.goldDim;
    ctx.fillRect(x, y, 32, 24);
    ctx.fillStyle = '#274b57';
    ctx.fillRect(x + 3, y + 3, 26, 18);
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(x + 16, y + 12, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPedestals(ctx, parsed) {
  for (const key of parsed.pedestals) {
    const [c, r] = key.split(',').map(Number);
    const x = c * TILE;
    const y = r * TILE;
    ctx.fillStyle = '#1c3038';
    ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
    ctx.fillStyle = '#e8ddc0';
    ctx.fillRect(x + 9, y + 9, TILE - 18, TILE - 18);
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(x + TILE / 2, y + TILE / 2 - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7e1f2e';
    ctx.fillRect(x + 4, y + TILE - 8, TILE - 8, 4);
  }
}

function drawDoors(ctx, parsed) {
  for (const door of parsed.doors) {
    const x = door.col * TILE;
    const y = door.row * TILE;
    if (door.open) {
      ctx.fillStyle = '#0d2126';
      ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
      return;
    }
    ctx.fillStyle = '#3a2a12';
    ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 5, y + 5, TILE - 10, TILE - 10);
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(x + TILE / 2, y + TILE / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    if (door.progress > 0) {
      ctx.fillStyle = '#0b1c22';
      ctx.fillRect(x + 2, y - 8, TILE - 4, 6);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(x + 2, y - 8, (TILE - 4) * (door.progress / TUNING.lockpickSeconds), 6);
    }
  }
}

function drawLasers(ctx, lasers, time, empFrozen) {
  for (const laser of lasers) {
    const live = !empFrozen && laserIsLive(laser, time);
    ctx.strokeStyle = live ? PALETTE.laser : PALETTE.laserDim;
    ctx.lineWidth = live ? 3 : 1.5;
    ctx.setLineDash(live ? [] : [6, 6]);
    ctx.beginPath();
    ctx.moveTo(laser.x1, laser.y1);
    ctx.lineTo(laser.x2, laser.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (live) {
      ctx.fillStyle = PALETTE.laser;
      ctx.beginPath();
      ctx.arc(laser.x1, laser.y1, 5, 0, Math.PI * 2);
      ctx.arc(laser.x2, laser.y2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = live ? '#ff8fa0' : '#5c2430';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    const mx = (laser.x1 + laser.x2) / 2;
    const my = (laser.y1 + laser.y2) / 2;
    ctx.fillText(live ? 'LASER' : 'laser off', mx, my - 8);
  }
}

function drawLoot(ctx, loot, taken, time, levelIndex) {
  if (taken) return;
  const pulse = 1 + Math.sin(time * 3) * 0.12;
  ctx.save();
  ctx.translate(loot.x, loot.y);
  ctx.scale(pulse, pulse);
  const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 46);
  grad.addColorStop(0, 'rgba(242,193,78,0.55)');
  grad.addColorStop(1, 'rgba(242,193,78,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(10, 2);
  ctx.lineTo(6, 12);
  ctx.lineTo(-6, 12);
  ctx.lineTo(-10, 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LOOT: ' + LOOT_NAMES[levelIndex], loot.x, loot.y + 30);
}

function drawExit(ctx, exit, lootTaken, time) {
  const glow = lootTaken ? 0.9 : 0.35;
  ctx.save();
  ctx.globalAlpha = glow;
  ctx.fillStyle = PALETTE.exit;
  ctx.fillRect(exit.x - 18, exit.y - 18, 36, 36);
  ctx.restore();
  ctx.strokeStyle = PALETTE.exit;
  ctx.lineWidth = 3;
  ctx.strokeRect(exit.x - 18, exit.y - 18, 36, 36);
  ctx.fillStyle = '#0b1c22';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x, exit.y + 4);
  if (lootTaken) {
    ctx.fillStyle = PALETTE.exit;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('GETAWAY OPEN — RUN!', exit.x, exit.y - 26);
  } else {
    ctx.fillStyle = '#cfe8d8';
    ctx.font = '11px sans-serif';
    ctx.fillText('locked until loot', exit.x, exit.y - 26);
  }
}

function drawGuard(ctx, guard, time) {
  const hot = guard.state === 'chase';
  drawCone(ctx, guard.x, guard.y, guard.angle, TUNING.guardSight, TUNING.guardConeHalf,
    hot ? PALETTE.coneHot : PALETTE.cone);
  ctx.fillStyle = PALETTE.guard;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.guardTrim;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#0b1c22';
  ctx.beginPath();
  ctx.arc(guard.x + Math.cos(guard.angle) * 6, guard.y + Math.sin(guard.angle) * 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.guardTrim;
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(hot ? '!' : 'GUARD', guard.x, guard.y - 20);
}

function drawCamera(ctx, camera, time) {
  const frozen = camera.frozen > 0;
  drawCone(ctx, camera.x, camera.y, camera.angle, TUNING.cameraSight, TUNING.cameraConeHalf,
    frozen ? 'rgba(120,130,140,0.10)' : PALETTE.cameraCone);
  ctx.fillStyle = frozen ? '#5a6a72' : '#1f7a6e';
  ctx.fillRect(camera.x - 9, camera.y - 7, 18, 14);
  ctx.fillStyle = frozen ? '#9fb2ba' : '#ff2e4d';
  ctx.beginPath();
  ctx.arc(camera.x + Math.cos(camera.angle) * 12, camera.y + Math.sin(camera.angle) * 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cfe8e2';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(frozen ? 'CAM OFF' : 'CAMERA', camera.x, camera.y - 14);
}

function drawThief(ctx, player, time) {
  ctx.save();
  ctx.translate(player.x, player.y);
  if (player.inVent) {
    ctx.globalAlpha = 0.75;
  }
  ctx.fillStyle = PALETTE.thiefCoat;
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#232a3a';
  ctx.fillRect(-7, -2, 14, 3);
  ctx.restore();
  ctx.fillStyle = PALETTE.thief;
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(player.sneaking ? 'YOU · sneaking' : 'YOU', player.x, player.y - 20);
}

function drawSmoke(ctx, tools, time) {
  for (const cloud of tools.smokeClouds) {
    if (cloud.until <= time) continue;
    ctx.fillStyle = PALETTE.smoke;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cloud.x - 30, cloud.y + 12, 34, 0, Math.PI * 2);
    ctx.arc(cloud.x + 32, cloud.y - 10, 36, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(ctx, s) {
  ctx.fillStyle = 'rgba(7, 20, 25, 0.88)';
  ctx.fillRect(0, 0, VIEW_W, 58);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 58, VIEW_W, 2);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('GILDED VAULT', 14, 26);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '13px sans-serif';
  ctx.fillText(LEVEL_NAMES[s.levelIndex] + '  ·  ' + LOOT_NAMES[s.levelIndex], 14, 46);
  // Alarm meter — big, labelled, impossible to miss.
  const ax = 560;
  const aw = 300;
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', ax, 24);
  ctx.fillStyle = '#0b1c22';
  ctx.fillRect(ax, 30, aw, 16);
  const frac = Math.max(0, Math.min(1, s.alarm / 100));
  ctx.fillStyle = s.alarm >= TUNING.alarmWarnAt ? PALETTE.alarmHigh : s.alarm >= 30 ? PALETTE.alarmMid : PALETTE.alarmLow;
  ctx.fillRect(ax, 30, aw * frac, 16);
  ctx.strokeStyle = PALETTE.hudText;
  ctx.lineWidth = 1;
  ctx.strokeRect(ax, 30, aw, 16);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(Math.round(s.alarm) + '%', ax + aw + 8, 44);
  if (s.alarm >= TUNING.alarmWarnAt) {
    ctx.fillStyle = PALETTE.alarmHigh;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('SPOTTED!', ax, 56 + 0);
  }
  // Tools and loot on the right.
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '13px sans-serif';
  ctx.fillText('SMOKE [Q] ×' + s.tools.smoke + '    EMP [E] ×' + s.tools.emp, VIEW_W - 14, 26);
  ctx.fillText((s.lootTaken ? '★ LOOT SECURED  ' : '○ loot not taken  ') + '  SCORE ' + s.score + '  ·  ' + Math.floor(s.time) + 's', VIEW_W - 14, 46);
  // Objective line under the bar.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffe9a8';
  ctx.font = '13px sans-serif';
  ctx.fillText(s.lootTaken ? 'Objective: reach the green EXIT — the getaway!' : 'Objective: steal the ' + LOOT_NAMES[s.levelIndex] + ', then reach the EXIT.  WASD move · Shift sneak · Q smoke · E EMP · hold F to lockpick', 14, 76);
}

function drawBanner(ctx, title, sub, color) {
  ctx.fillStyle = 'rgba(7, 20, 25, 0.82)';
  ctx.fillRect(0, VIEW_H / 2 - 70, VIEW_W, 140);
  ctx.fillStyle = color;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW_W / 2, VIEW_H / 2 - 8);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '17px sans-serif';
  ctx.fillText(sub, VIEW_W / 2, VIEW_H / 2 + 30);
}

function drawTitle(ctx, time) {
  ctx.fillStyle = '#0a1a20';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GILDED VAULT', VIEW_W / 2, 220);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '22px sans-serif';
  ctx.fillText('Midnight at the Maravilla Museum — steal the gold, dodge the cones, vanish.', VIEW_W / 2, 268);
  ctx.font = '17px sans-serif';
  ctx.fillStyle = '#ffe9a8';
  const lines = [
    'WASD / arrows — move    ·    Shift — sneak (slower, harder to spot)',
    'Q — smoke pellet (×3)  ·  E — EMP burst, freezes cameras + lasers (×2)',
    'Hold F by a gold door — lockpick a shortcut    ·    Click — walk there',
    'Guards patrol with vision cones. Cameras sweep. Lasers blink on and off.',
    'The ALARM meter rises when you are seen and falls when you hide.',
    'Grab the LOOT, then reach the green EXIT. Three floors. One clean getaway.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 330 + i * 30));
  ctx.fillStyle = Math.sin(time * 4) > 0 ? PALETTE.gold : PALETTE.hudText;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('CLICK OR PRESS ENTER TO START THE HEIST', VIEW_W / 2, 560);
}

export function drawGame(ctx, s) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (s.screen === 'title') {
    drawTitle(ctx, s.time);
    return;
  }
  const rows = s.level.map;
  drawFloor(ctx, s.parsed, rows);
  drawLoot(ctx, s.parsed.loot, s.lootTaken, s.time, s.levelIndex);
  drawExit(ctx, s.parsed.exit, s.lootTaken, s.time);
  drawLasers(ctx, s.lasers, s.time, s.tools.empTimer > 0);
  for (const camera of s.cameras) drawCamera(ctx, camera, s.time);
  for (const guard of s.guards) drawGuard(ctx, guard, s.time);
  drawPedestals(ctx, s.parsed);
  drawDoors(ctx, s.parsed);
  drawSmoke(ctx, s.tools, s.time);
  drawThief(ctx, s.player, s.time);
  drawHud(ctx, s);
  if (s.screen === 'caught') {
    drawBanner(ctx, 'CAUGHT!', 'The alarm hit 100%. The guards closed in. Press R to try this floor again.', PALETTE.alarmHigh);
  } else if (s.screen === 'levelDone') {
    drawBanner(ctx, 'CLEAN GETAWAY!', 'Floor cleared — ' + s.levelScore + ' points. Press Enter for the next floor.', PALETTE.exit);
  } else if (s.screen === 'win') {
    drawBanner(ctx, 'THE PERFECT HEIST!', 'All three treasures stolen. Final score ' + s.score + '. Press R to run it again.', PALETTE.gold);
  } else if (s.spottedFlash > 0) {
    ctx.fillStyle = 'rgba(255,46,77,0.10)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = PALETTE.alarmHigh;
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED — BREAK LINE OF SIGHT!', VIEW_W / 2, 120);
  }
}
