// VelvetShots — stage the game's own states for screenshots.
// ?shot=start|play|alarm|win&seed=7 — the frame is always the game's real
// renderer drawing real state; shots only place the thief and the guards.

function velvetShotParams() {
  const q = new URLSearchParams(window.location.search);
  return { shot: q.get('shot') || '', seed: parseInt(q.get('seed') || '7', 10) };
}

function velvetPlaceGuardOnPatrol(g, frac) {
  const wps = g.waypoints;
  const seg = Math.min(wps.length - 1, Math.floor(frac * wps.length));
  const a = wps[seg];
  const b = wps[(seg + 1) % wps.length];
  const t = (frac * wps.length) - seg;
  g.x = a[0] + (b[0] - a[0]) * t;
  g.y = a[1] + (b[1] - a[1]) * t;
  g.wp = (seg + 1) % wps.length;
  g.angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  g.state = 'patrol';
  g.suspicion = 0;
  g.pause = 0;
}

function velvetApplyShot(S) {
  const params = velvetShotParams();
  if (!params.shot) return;
  const rng = velvetMulberry32(params.seed);
  S.level.now = 2.5;
  S.screen = 'play';
  S.elapsed = 0;
  const fracs = [0.15, 0.45, 0.7, 0.3];
  S.level.guards.forEach((g, i) => velvetPlaceGuardOnPatrol(g, fracs[i % fracs.length] + rng() * 0.05));
  S.level.cameras.forEach((c) => { c.phase = rng() * 4; c.angle = c.baseAngle + Math.sin(c.phase) * c.sweep; });

  if (params.shot === 'start') {
    S.player.x = 640;
    S.player.y = 648;
    S.player.angle = -Math.PI / 2;
    S.level.alarm = 0;
  } else if (params.shot === 'play') {
    S.player.x = 640;
    S.player.y = 300;
    S.player.angle = -Math.PI / 2;
    S.player.loot = 150;
    S.player.weight = 0;
    for (const l of S.level.loot) {
      if (l.id === 'chips3' || l.id === 'chips1' || l.id === 'chips6') l.taken = true;
    }
    S.level.alarm = 28;
    S.elapsed = 74;
    const marco = S.level.guards[0];
    marco.state = 'suspicious';
    marco.suspicion = 68;
    marco.angle = Math.atan2(S.player.y - marco.y, S.player.x - marco.x);
    const vera = S.level.guards[3];
    vera.angle = Math.atan2(S.player.y - vera.y, S.player.x - vera.x);
  } else if (params.shot === 'alarm') {
    S.player.x = 640;
    S.player.y = 250;
    S.player.angle = Math.PI / 2;
    S.player.loot = 5150;
    S.player.weight = 3;
    S.player.hasGolden = true;
    for (const l of S.level.loot) {
      if (l.id === 'golden' || l.id === 'bar1' || l.id === 'chips3') l.taken = true;
    }
    S.level.doors.find((d) => d.id === 'vault').open = true;
    S.level.vaultOpened = true;
    S.level.goldenTaken = true;
    S.level.alarm = 88;
    S.level.lockdown = 9;
    S.elapsed = 121;
    S.level.smokes.push({ x: 640, y: 300, r: VELVET.smokeRadius, until: S.level.now + 4 });
    S.player.smokeUntil = S.level.now + 4;
    const bruno = S.level.guards[2];
    bruno.state = 'chase';
    bruno.chaseTime = 3;
    bruno.x = 760;
    bruno.y = 560;
    bruno.angle = Math.atan2(S.player.y - bruno.y, S.player.x - bruno.x);
    const marco = S.level.guards[0];
    marco.state = 'suspicious';
    marco.suspicion = 90;
    marco.angle = Math.atan2(S.player.y - marco.y, S.player.x - marco.x);
    S.level.cameras[0].spotted = 60;
  } else if (params.shot === 'win') {
    S.player.x = 640;
    S.player.y = 660;
    S.player.angle = Math.PI / 2;
    S.player.loot = 5450;
    S.player.weight = 3;
    S.player.hasGolden = true;
    for (const l of S.level.loot) {
      if (l.id === 'golden' || l.id === 'bar1' || l.id === 'bar2' || l.id === 'chips3') l.taken = true;
    }
    S.level.doors.find((d) => d.id === 'vault').open = true;
    S.level.alarm = 12;
    S.elapsed = 138;
    S.score = velvetScoreBreakdown(S);
    S.screen = 'win';
  }
  window.VELVET_SHOT = params.shot;
}

function velvetScoreBreakdown(S) {
  const loot = S.player.loot;
  const timeBonus = Math.max(0, Math.round((VELVET.parSeconds - S.elapsed) * VELVET.timeBonusPerSecond));
  const ghostBonus = S.everSpotted ? 0 : VELVET.ghostBonus;
  return { loot, timeBonus, ghostBonus, total: loot + timeBonus + ghostBonus };
}
