// VelvetPlayer — the thief. Walk, sneak, run; grab loot; spend it on tools.
// Loot has weight: the richer you get, the slower you move. Choose.

// Tool slots, in HUD order. Mouse click or keys 1-4.
const VELVET_TOOLS = [
  { key: 'smoke', num: '1', name: 'Smoke Bomb', cost: 150, desc: 'Blind every eye for 5s' },
  { key: 'emp', num: '2', name: 'EMP', cost: 200, desc: 'Cameras dead for 8s' },
  { key: 'disguise', num: '3', name: 'Disguise', cost: 250, desc: 'Look like staff for 10s' },
  { key: 'lockpick', num: '4', name: 'Lockpick', cost: 100, desc: 'Open a door at once' },
];

function velvetNewPlayer(level) {
  return {
    x: level.playerStart.x,
    y: level.playerStart.y,
    angle: -Math.PI / 2,
    stance: 'walk',
    moving: false,
    loot: 0,
    weight: 0,
    hasGolden: false,
    tossesLeft: VELVET.chipTossCount,
    tossCooldown: 0,
    smokeUntil: 0,
    disguisedUntil: 0,
    lockpicks: 0,
    stepTimer: 0,
    interactTarget: null,
    interactProgress: 0,
  };
}

function velvetPlayerSolids(level) {
  const solids = level.walls.concat(level.cover, level.ropes);
  for (const d of level.doors) if (!d.open) solids.push(d);
  return solids;
}

function velvetUpdatePlayer(player, level, input, dt) {
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  const len = Math.hypot(mx, my);
  player.moving = len > 0;
  player.stance = input.run ? 'run' : input.sneak ? 'sneak' : 'walk';
  if (len > 0) {
    mx /= len;
    my /= len;
    player.angle = Math.atan2(my, mx);
    let speed = player.stance === 'run' ? VELVET.runSpeed : player.stance === 'sneak' ? VELVET.sneakSpeed : VELVET.walkSpeed;
    speed *= Math.max(0.55, 1 - player.weight * VELVET.lootSlowPerKilo);
    const solids = velvetPlayerSolids(level);
    velvetMoveWithCollision(player, mx * speed * dt, my * speed * dt, solids);
    player.stepTimer -= dt;
    if (player.stepTimer <= 0) {
      player.stepTimer = player.stance === 'run' ? 0.26 : player.stance === 'sneak' ? 0.6 : 0.38;
      VelvetAudio.footstep(player.stance === 'run');
      if (player.stance === 'run') {
        for (const g of level.guards) {
          const d = Math.hypot(g.x - player.x, g.y - player.y);
          if (d < 170 && g.state === 'patrol') velvetSendGuardToInvestigate(level, player.x, player.y);
        }
      }
    }
  }
  player.tossCooldown = Math.max(0, player.tossCooldown - dt);
}

function velvetNearestInteractable(player, level) {
  let best = null;
  let bestD = 46;
  for (const d of level.doors) {
    if (d.open) continue;
    const cx = d.x + d.w / 2;
    const cy = d.y + d.h / 2;
    const dist = Math.hypot(player.x - cx, player.y - cy);
    if (dist < bestD) { best = d; bestD = dist; }
  }
  for (const l of level.loot) {
    if (l.taken || l.kind === 'chips' || l.kind === 'gold' || l.kind === 'golden') {
      if (l.taken) continue;
      const dist = Math.hypot(player.x - l.x, player.y - l.y);
      if (dist < bestD) { best = l; bestD = dist; }
    }
  }
  const safe = level.loot.find((l) => l.kind === 'safe' && !l.taken);
  if (safe) {
    const dist = Math.hypot(player.x - safe.x, player.y - safe.y);
    if (dist < bestD) { best = safe; bestD = dist; }
  }
  return best;
}

function velvetHoldInteract(player, level, dt) {
  const target = velvetNearestInteractable(player, level);
  player.interactTarget = target;
  if (!target) { player.interactProgress = 0; return; }
  if (target.kind === 'chips' || target.kind === 'gold' || target.kind === 'golden') {
    velvetTakeLoot(player, level, target);
    player.interactProgress = 0;
    return;
  }
  player.interactProgress += dt;
  const need = VELVET.doorOpenSeconds;
  if (player.interactProgress >= need) {
    if (target.id) {
      target.open = true;
      VelvetAudio.vaultClunk();
      if (target.id === 'vault') level.vaultOpened = true;
    } else if (target.kind === 'safe') {
      velvetTakeLoot(player, level, target);
    }
    player.interactProgress = 0;
    player.interactTarget = null;
  }
}

function velvetTakeLoot(player, level, item) {
  item.taken = true;
  player.loot += item.value;
  player.weight += item.weight;
  if (item.kind === 'golden') {
    player.hasGolden = true;
    level.goldenTaken = true;
  }
  VelvetAudio.lootChime(item.value);
  level.floaters.push({ x: item.x, y: item.y - 14, text: '+$' + item.value, life: 1.2, color: VELVET_COLORS.gold });
}

function velvetUseTool(player, level, key) {
  const tool = VELVET_TOOLS.find((t) => t.key === key);
  if (!tool) return false;
  if (key === 'lockpick') {
    if (player.loot < tool.cost) return false;
    const target = velvetNearestInteractable(player, level);
    if (!target || (!target.id && target.kind !== 'safe')) return false;
    player.loot -= tool.cost;
    player.lockpicks += 1;
    if (target.id) {
      target.open = true;
      VelvetAudio.vaultClunk();
      if (target.id === 'vault') level.vaultOpened = true;
    } else {
      velvetTakeLoot(player, level, target);
    }
    level.floaters.push({ x: player.x, y: player.y - 24, text: 'LOCKPICK -$' + tool.cost, life: 1.2, color: VELVET_COLORS.cream });
    return true;
  }
  if (player.loot < tool.cost) return false;
  if (key === 'smoke') {
    player.loot -= tool.cost;
    level.smokes.push({ x: player.x, y: player.y, r: VELVET.smokeRadius, until: level.now + VELVET.smokeSeconds });
    player.smokeUntil = level.now + VELVET.smokeSeconds;
    VelvetAudio.smokePuff();
    return true;
  }
  if (key === 'emp') {
    player.loot -= tool.cost;
    for (const cam of level.cameras) cam.disabledUntil = level.now + VELVET.empSeconds;
    VelvetAudio.empBuzz();
    level.floaters.push({ x: player.x, y: player.y - 24, text: 'CAMERAS DOWN', life: 1.4, color: VELVET_COLORS.warn });
    return true;
  }
  if (key === 'disguise') {
    player.loot -= tool.cost;
    player.disguisedUntil = level.now + VELVET.disguiseSeconds;
    VelvetAudio.clickUi();
    level.floaters.push({ x: player.x, y: player.y - 24, text: 'DISGUISED', life: 1.4, color: VELVET_COLORS.safe });
    return true;
  }
  return false;
}

function velvetTossChip(player, level, tx, ty) {
  if (player.tossesLeft <= 0 || player.tossCooldown > 0) return false;
  player.tossesLeft -= 1;
  player.tossCooldown = VELVET.chipTossCooldown;
  level.tosses.push({ x: player.x, y: player.y, tx, ty, t: 0, dur: 0.45 });
  VelvetAudio.tossClink();
  return true;
}

function velvetUpdateTosses(level, dt) {
  for (let i = level.tosses.length - 1; i >= 0; i--) {
    const toss = level.tosses[i];
    toss.t += dt;
    if (toss.t >= toss.dur) {
      level.tosses.splice(i, 1);
      level.clinks.push({ x: toss.tx, y: toss.ty, life: 0.8 });
      velvetSendGuardToInvestigate(level, toss.tx, toss.ty);
      VelvetAudio.chipClink();
    }
  }
  for (let i = level.clinks.length - 1; i >= 0; i--) {
    level.clinks[i].life -= dt;
    if (level.clinks[i].life <= 0) level.clinks.splice(i, 1);
  }
}
