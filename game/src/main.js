// VelvetMain — the heist itself: loop, input, alarm, lockdown, getaway.
// One screen, one night: steal the Golden Chip and reach the car.

function velvetNewLevel() {
  const level = buildVelvetCasino();
  level.now = 0;
  level.alarm = 0;
  level.lockdown = 0;
  level.smokes = [];
  level.tosses = [];
  level.clinks = [];
  level.floaters = [];
  level.caughtBy = null;
  level.vaultOpened = false;
  level.goldenTaken = false;
  return level;
}

function velvetNewState() {
  const level = velvetNewLevel();
  const state = {
    level,
    player: velvetNewPlayer(level),
    screen: 'menu',
    lives: VELVET.maxLives,
    elapsed: 0,
    everSpotted: false,
    score: null,
    best: 0,
    input: { left: false, right: false, up: false, down: false, run: false, sneak: false, interact: false },
  };
  try {
    state.best = parseInt(window.localStorage.getItem('velvet-best') || '0', 10) || 0;
  } catch (e) {
    state.best = 0;
  }
  return state;
}

function velvetResetRun(S) {
  S.level = velvetNewLevel();
  S.player = velvetNewPlayer(S.level);
  S.lives = VELVET.maxLives;
  S.elapsed = 0;
  S.everSpotted = false;
  S.score = null;
  S.screen = 'play';
}

function velvetResumeAfterBust(S) {
  const level = S.level;
  level.alarm = 40;
  level.lockdown = 0;
  level.smokes = [];
  level.caughtBy = null;
  for (const g of level.guards) {
    g.state = 'patrol';
    g.suspicion = 0;
    g.investigate = null;
    g.chaseTime = 0;
    g.pause = 0;
    const start = g.waypoints[0];
    g.x = start[0];
    g.y = start[1];
    g.wp = 1 % g.waypoints.length;
  }
  for (const cam of level.cameras) cam.spotted = 0;
  S.player.x = level.playerStart.x;
  S.player.y = level.playerStart.y;
  S.player.angle = -Math.PI / 2;
  S.player.interactProgress = 0;
  S.screen = 'play';
}

function velvetTriggerLockdown(S) {
  const level = S.level;
  level.lockdown = VELVET.lockdownSeconds;
  level.alarm = 100;
  for (const g of level.guards) {
    if (g.state !== 'chase') {
      g.state = 'chase';
      g.chaseTime = 7;
    }
  }
  VelvetAudio.alarmSting();
}

function velvetUpdate(S, dt) {
  const level = S.level;
  const player = S.player;
  level.now += dt;
  S.elapsed += dt;

  velvetUpdatePlayer(player, level, S.input, dt);
  if (S.input.interact) velvetHoldInteract(player, level, dt);
  else player.interactProgress = Math.max(0, player.interactProgress - dt * 2);

  let anySeeing = false;
  let caught = false;
  for (const g of level.guards) {
    const result = velvetUpdateGuard(g, level, player, dt);
    if (result === 'caught') caught = true;
    if (g.state === 'suspicious' || g.state === 'chase') {
      anySeeing = true;
      S.everSpotted = true;
    }
  }
  for (const cam of level.cameras) {
    velvetUpdateCamera(cam, level, player, dt);
    if (cam.spotted > 40) S.everSpotted = true;
  }
  velvetUpdateTosses(level, dt);

  if (level.lockdown > 0) {
    level.lockdown -= dt;
    level.alarm = 100;
    if (level.lockdown <= 0) level.alarm = 55;
  } else if (anySeeing) {
    level.alarm = Math.min(100, level.alarm + VELVET.alarmRisePerSecond * 0.55 * dt);
  } else {
    level.alarm = Math.max(0, level.alarm - VELVET.alarmDecayPerSecond * dt);
  }
  if (level.alarm >= 100 && level.lockdown <= 0) velvetTriggerLockdown(S);

  for (let i = level.floaters.length - 1; i >= 0; i--) {
    const f = level.floaters[i];
    f.life -= dt;
    f.y -= 22 * dt;
    if (f.life <= 0) level.floaters.splice(i, 1);
  }
  for (let i = level.smokes.length - 1; i >= 0; i--) {
    if (level.now > level.smokes[i].until) level.smokes.splice(i, 1);
  }

  if (caught) {
    S.lives -= 1;
    player.loot = Math.floor(player.loot * 0.75);
    VelvetAudio.bustedSting();
    if (S.lives <= 0) {
      S.screen = 'gameover';
    } else {
      S.screen = 'busted';
    }
    return;
  }

  const z = level.exitZone;
  if (player.hasGolden && player.x > z.x - 6 && player.x < z.x + z.w + 6 && player.y > z.y - 16 && player.y < z.y + z.h + 8) {
    S.score = velvetScoreBreakdown(S);
    if (S.score.total > S.best) {
      S.best = S.score.total;
      try { window.localStorage.setItem('velvet-best', String(S.best)); } catch (e) {}
    }
    S.screen = 'win';
    VelvetAudio.getawayFanfare();
  }
}

function velvetToolButtonAt(mx, my) {
  let tx = 16 + 62;
  for (const tool of VELVET_TOOLS) {
    if (mx >= tx && mx <= tx + 150 && my >= 680 && my <= 714) return tool.key;
    tx += 158;
  }
  return null;
}

function velvetBindInput(S, canvas) {
  const keyMap = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
    ShiftLeft: 'run', ShiftRight: 'run',
    KeyC: 'sneak', ControlLeft: 'sneak', ControlRight: 'sneak',
    KeyE: 'interact', Space: 'interact',
  };
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    const mapped = keyMap[e.code];
    if (mapped) S.input[mapped] = true;
    if ((e.code === 'KeyE' || e.code === 'Space') && S.screen === 'play') {
      velvetHoldInteract(S.player, S.level, 0.05);
    }
    if (e.code === 'Digit1') velvetUseTool(S.player, S.level, 'smoke');
    if (e.code === 'Digit2') velvetUseTool(S.player, S.level, 'emp');
    if (e.code === 'Digit3') velvetUseTool(S.player, S.level, 'disguise');
    if (e.code === 'Digit4') velvetUseTool(S.player, S.level, 'lockpick');
    if (e.code === 'KeyM') VelvetAudio.toggleMute();
    if (e.code === 'KeyP' || e.code === 'Escape') {
      if (S.screen === 'play') S.screen = 'paused';
      else if (S.screen === 'paused') S.screen = 'play';
    }
    if (e.code === 'Enter') {
      VelvetAudio.ensure();
      if (S.screen === 'menu') S.screen = 'play';
      else if (S.screen === 'busted') velvetResumeAfterBust(S);
      else if (S.screen === 'win' || S.screen === 'gameover') velvetResetRun(S);
    }
  });
  window.addEventListener('keyup', (e) => {
    const mapped = keyMap[e.code];
    if (mapped) S.input[mapped] = false;
  });
  canvas.addEventListener('mousedown', (e) => {
    VelvetAudio.ensure();
    if (S.screen === 'menu') { S.screen = 'play'; return; }
    if (S.screen === 'busted') { velvetResumeAfterBust(S); return; }
    if (S.screen === 'win' || S.screen === 'gameover') { velvetResetRun(S); return; }
    if (S.screen !== 'play') return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (1280 / rect.width);
    const my = (e.clientY - rect.top) * (720 / rect.height);
    const tool = velvetToolButtonAt(mx, my);
    if (tool) {
      velvetUseTool(S.player, S.level, tool);
      return;
    }
    velvetTossChip(S.player, S.level, mx, my);
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

function velvetStart() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const S = velvetNewState();
  window.VELVET = S;
  velvetBindInput(S, canvas);
  velvetApplyShot(S);
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (S.screen === 'play') velvetUpdate(S, dt);
    velvetRender(ctx, S);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

document.addEventListener('DOMContentLoaded', velvetStart);
