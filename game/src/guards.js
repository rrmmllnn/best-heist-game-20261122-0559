// VelvetGuards — patrols, suspicion, investigation and chase.
// A guard that glimpses you turns suspicious (?); fill the meter and the
// alarm sounds (!) and every guard gives chase. Break line of sight and
// the alarm cools — a caught moment that is fair, never instant.

function velvetMoveWithCollision(body, dx, dy, solids) {
  const r = VELVET.playerRadius;
  let nx = body.x + dx;
  for (const s of solids) {
    if (velvetCircleHitsRect(nx, body.y, r, s)) {
      nx = dx > 0 ? s.x - r : s.x + s.w + r;
      if (velvetCircleHitsRect(nx, body.y, r, s)) nx = body.x;
    }
  }
  body.x = nx;
  let ny = body.y + dy;
  for (const s of solids) {
    if (velvetCircleHitsRect(body.x, ny, r, s)) {
      ny = dy > 0 ? s.y - r : s.y + s.h + r;
      if (velvetCircleHitsRect(body.x, ny, r, s)) ny = body.y;
    }
  }
  body.y = ny;
}

function velvetGuardSolids(level) {
  const solids = level.walls.concat(level.cover, level.ropes);
  for (const d of level.doors) if (!d.open) solids.push(d);
  return solids;
}

function velvetSightBlockers(level) {
  const blockers = level.walls.concat(level.cover);
  for (const d of level.doors) if (!d.open) blockers.push(d);
  return blockers;
}

function velvetPlayerSeenBy(level, eyeX, eyeY, angle, halfAngle, range, player, dt, rateScale) {
  if (player.smokeUntil > level.now) return 0;
  const inSmoke = level.smokes.some((s) => Math.hypot(player.x - s.x, player.y - s.y) < s.r);
  if (inSmoke) return 0;
  const blockers = velvetSightBlockers(level);
  if (!velvetPointInCone(player.x, player.y, eyeX, eyeY, angle, halfAngle, range, blockers)) return 0;
  const dist = Math.hypot(player.x - eyeX, player.y - eyeY);
  const closeness = 1.35 - dist / range;
  let stance = 1;
  if (player.stance === 'sneak') stance = 0.5;
  if (player.stance === 'run') stance = 1.8;
  if (player.disguisedUntil > level.now) {
    if (dist < VELVET.disguiseSeeThrough) stance *= 1.6;
    else stance *= 0.12;
  }
  return VELVET.suspicionPerSecond * closeness * stance * (rateScale || 1) * dt;
}

function velvetUpdateGuard(g, level, player, dt) {
  const solids = velvetGuardSolids(level);
  const seen = velvetPlayerSeenBy(level, g.x, g.y, g.angle, VELVET.guardSightHalfAngle, VELVET.guardSightRange, player, dt, 1);
  if (seen > 0) {
    g.suspicion = Math.min(100, g.suspicion + seen);
    if (g.suspicion >= 55 && g.state === 'patrol') {
      g.state = 'suspicious';
      VelvetAudio.guardBark();
    }
    if (g.suspicion >= 100 && g.state !== 'chase') {
      g.state = 'chase';
      g.chaseTime = 6;
      level.alarm = Math.min(100, level.alarm + 35);
      VelvetAudio.alarmSting();
    }
  } else if (g.state !== 'chase') {
    g.suspicion = Math.max(0, g.suspicion - VELVET.suspicionDecayPerSecond * dt);
    if (g.suspicion < 30 && g.state === 'suspicious') g.state = 'patrol';
  }

  if (g.state === 'chase') {
    g.chaseTime -= dt;
    const dx = player.x - g.x;
    const dy = player.y - g.y;
    const d = Math.hypot(dx, dy) || 1;
    g.angle = Math.atan2(dy, dx);
    velvetMoveWithCollision(g, (dx / d) * VELVET.guardChaseSpeed * dt, (dy / d) * VELVET.guardChaseSpeed * dt, solids);
    if (d < 30) {
      level.caughtBy = g.name;
      return 'caught';
    }
    if (g.chaseTime <= 0) {
      g.state = 'patrol';
      g.suspicion = 45;
    }
    return 'ok';
  }

  if (g.state === 'investigate' && g.investigate) {
    const tx = g.investigate.x;
    const ty = g.investigate.y;
    const dx = tx - g.x;
    const dy = ty - g.y;
    const d = Math.hypot(dx, dy);
    if (d < 14) {
      g.pause -= dt;
      g.angle += dt * 1.4;
      if (g.pause <= 0) {
        g.state = 'patrol';
        g.investigate = null;
      }
      return 'ok';
    }
    g.angle = Math.atan2(dy, dx);
    velvetMoveWithCollision(g, (dx / d) * VELVET.guardSpeed * 1.25 * dt, (dy / d) * VELVET.guardSpeed * 1.25 * dt, solids);
    return 'ok';
  }

  // Patrol: walk the waypoints, pause and look around at each one.
  if (g.pause > 0) {
    g.pause -= dt;
    g.angle += dt * 0.9;
    return 'ok';
  }
  const wp = g.waypoints[g.wp];
  const dx = wp[0] - g.x;
  const dy = wp[1] - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 10) {
    g.wp = (g.wp + 1) % g.waypoints.length;
    g.pause = 1.1;
    return 'ok';
  }
  g.angle = Math.atan2(dy, dx);
  velvetMoveWithCollision(g, (dx / d) * VELVET.guardSpeed * dt, (dy / d) * VELVET.guardSpeed * dt, solids);
  return 'ok';
}

function velvetSendGuardToInvestigate(level, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const g of level.guards) {
    if (g.state === 'chase') continue;
    const d = Math.hypot(g.x - x, g.y - y);
    if (d < bestD && d < 420) { best = g; bestD = d; }
  }
  if (best) {
    best.state = 'investigate';
    best.investigate = { x, y };
    best.pause = 2.2;
    best.suspicion = Math.max(best.suspicion, 25);
  }
}

function velvetUpdateCamera(cam, level, player, dt) {
  cam.phase += dt * cam.speed;
  cam.angle = cam.baseAngle + Math.sin(cam.phase) * cam.sweep;
  if (level.now < cam.disabledUntil) return;
  const seen = velvetPlayerSeenBy(level, cam.x, cam.y, cam.angle, VELVET.cameraSightHalfAngle, VELVET.cameraSightRange, player, dt, 0.8);
  if (seen > 0) {
    cam.spotted += seen;
    level.alarm = Math.min(100, level.alarm + VELVET.alarmRisePerSecond * 0.8 * dt);
    if (cam.spotted > 40 && !cam.zapped) {
      cam.zapped = true;
      VelvetAudio.cameraZap();
    }
  } else {
    cam.spotted = Math.max(0, cam.spotted - 20 * dt);
    cam.zapped = false;
  }
}
