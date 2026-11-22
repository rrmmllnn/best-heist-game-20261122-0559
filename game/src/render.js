// VelvetRender — every pixel of the Aurelia Casino, drawn on one canvas.
// Safe cover, danger and loot are obvious at a glance: green felt, gold
// loot, red danger, green exit. No images, no fonts, no network.

function velvetDrawFloor(ctx, level) {
  ctx.fillStyle = VELVET_COLORS.carpet;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = 'rgba(212, 175, 55, 0.10)';
  for (let y = 48; y < 720; y += 96) {
    for (let x = 48; x < 1280; x += 96) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-7, -7, 14, 14);
      ctx.restore();
    }
  }
  // Vault floor: marble gold.
  ctx.fillStyle = '#4a3413';
  ctx.fillRect(536, 24, 208, 150);
  ctx.fillStyle = 'rgba(242, 193, 78, 0.16)';
  for (let x = 552; x < 744; x += 32) {
    ctx.fillRect(x, 40, 16, 118);
  }
  // Service corridor: cold tile.
  ctx.fillStyle = '#232838';
  ctx.fillRect(1080, 24, 176, 412);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let y = 40; y < 420; y += 40) ctx.fillRect(1080, y, 176, 2);
  // Red carpet from the doors to the floor.
  ctx.fillStyle = '#7a1f2b';
  ctx.fillRect(596, 560, 88, 136);
  ctx.fillStyle = VELVET_COLORS.gold;
  ctx.fillRect(596, 560, 4, 136);
  ctx.fillRect(680, 560, 4, 136);
  // Lounge carpet.
  ctx.fillStyle = '#2c1b3d';
  ctx.fillRect(390, 310, 160, 150);
}

function velvetDrawWalls(ctx, level) {
  for (const w of level.walls) {
    ctx.fillStyle = VELVET_COLORS.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = VELVET_COLORS.wallTop;
    if (w.h <= 24 && w.w > w.h) ctx.fillRect(w.x, w.y, w.w, 4);
    else if (w.w <= 24) ctx.fillRect(w.x, w.y, 4, w.h);
  }
}

function velvetDrawCover(ctx, level) {
  for (const c of level.cover) {
    if (c.kind === 'slots') {
      ctx.fillStyle = '#3d2b5c';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = '#241a33';
      ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
      for (let i = 0; i < 3; i++) {
        const sx = c.x + 10 + i * 28;
        ctx.fillStyle = i % 2 ? '#ff5d8f' : '#ffd166';
        ctx.fillRect(sx, c.y + 8, 20, 18);
      }
      ctx.fillStyle = VELVET_COLORS.gold;
      ctx.font = 'bold 9px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h - 4);
    } else if (c.kind === 'blackjack') {
      ctx.fillStyle = '#0d2b1a';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = VELVET_COLORS.gold;
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4);
      ctx.fillStyle = VELVET_COLORS.felt;
      ctx.beginPath();
      ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 - 8, c.h / 2 - 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = VELVET_COLORS.cream;
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 3);
    } else if (c.kind === 'roulette') {
      ctx.fillStyle = '#3d2b5c';
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = VELVET_COLORS.felt;
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 - 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = VELVET_COLORS.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 - 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f5ead1';
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = VELVET_COLORS.gold;
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h + 14);
    } else if (c.kind === 'bar') {
      ctx.fillStyle = '#5a3a1e';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(c.x, c.y, c.w, 10);
      ctx.fillStyle = VELVET_COLORS.cream;
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h - 8);
    } else if (c.kind === 'planter') {
      ctx.fillStyle = '#1e4d2b';
      ctx.beginPath();
      ctx.arc(c.x + 17, c.y + 17, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2f7a44';
      ctx.beginPath();
      ctx.arc(c.x + 17, c.y + 17, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.kind === 'sofa') {
      ctx.fillStyle = '#6d1f2e';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = '#8e2a3d';
      ctx.fillRect(c.x + 6, c.y + 6, c.w - 12, c.h - 12);
      ctx.fillStyle = VELVET_COLORS.gold;
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
    }
  }
  // Velvet ropes: red cord, gold posts.
  for (const r of level.ropes) {
    ctx.fillStyle = '#a31621';
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  ctx.fillStyle = VELVET_COLORS.gold;
  const posts = [[380, 300], [560, 300], [380, 470], [450, 470], [500, 470], [560, 470]];
  for (const p of posts) {
    ctx.beginPath();
    ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function velvetDrawDoors(ctx, level) {
  for (const d of level.doors) {
    if (d.open) {
      ctx.fillStyle = '#0a0616';
      ctx.fillRect(d.x, d.y, d.w, d.h);
      continue;
    }
    ctx.fillStyle = '#4a3413';
    ctx.fillRect(d.x, d.y, d.w, d.h);
    ctx.strokeStyle = VELVET_COLORS.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(d.x + 1, d.y + 1, d.w - 2, d.h - 2);
    ctx.fillStyle = VELVET_COLORS.gold;
    ctx.beginPath();
    ctx.arc(d.x + d.w / 2, d.y + d.h / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = VELVET_COLORS.cream;
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.textAlign = 'center';
    const ly = d.w > d.h ? d.y - 6 : d.y + d.h / 2 + 3;
    const lx = d.w > d.h ? d.x + d.w / 2 : d.x - 4;
    ctx.fillText('🔒', lx, ly);
  }
}

function velvetDrawLoot(ctx, level) {
  for (const l of level.loot) {
    if (l.taken) continue;
    if (l.kind === 'chips') {
      const cols = ['#ff5d8f', '#ffd166', '#4ecdc4'];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = cols[i % 3];
        ctx.beginPath();
        ctx.arc(l.x + (i - 1) * 8, l.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (l.kind === 'gold') {
      ctx.fillStyle = VELVET_COLORS.gold;
      ctx.fillRect(l.x - 14, l.y - 7, 28, 14);
      ctx.fillStyle = '#ffe9a8';
      ctx.fillRect(l.x - 14, l.y - 7, 28, 5);
      ctx.strokeStyle = VELVET_COLORS.goldDark;
      ctx.lineWidth = 1;
      ctx.strokeRect(l.x - 14, l.y - 7, 28, 14);
    } else if (l.kind === 'golden') {
      const pulse = 0.6 + 0.4 * Math.sin(level.now * 3);
      ctx.fillStyle = 'rgba(242, 193, 78,' + (0.25 * pulse) + ')';
      ctx.beginPath();
      ctx.arc(l.x, l.y, 30 + 6 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = VELVET_COLORS.gold;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#7a5c00';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', l.x, l.y + 5);
      ctx.fillStyle = VELVET_COLORS.gold;
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.fillText('GOLDEN CHIP', l.x, l.y - 26);
    } else if (l.kind === 'safe') {
      ctx.fillStyle = '#2b2f3a';
      ctx.fillRect(l.x - 18, l.y - 14, 36, 28);
      ctx.strokeStyle = VELVET_COLORS.gold;
      ctx.lineWidth = 2;
      ctx.strokeRect(l.x - 18, l.y - 14, 36, 28);
      ctx.fillStyle = VELVET_COLORS.gold;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = VELVET_COLORS.cream;
      ctx.font = 'bold 9px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SAFE $1000', l.x, l.y - 20);
    }
  }
  // Pedestal under the Golden Chip.
  ctx.fillStyle = '#241a33';
  ctx.fillRect(level.vaultPedestal.x - 22, level.vaultPedestal.y + 12, 44, 10);
}

function velvetDrawCone(ctx, poly, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
  ctx.fill();
}

function velvetDrawGuards(ctx, level) {
  const blockers = velvetSightBlockers(level);
  for (const g of level.guards) {
    let color = VELVET_COLORS.conePatrol;
    if (g.state === 'suspicious' || g.state === 'investigate') color = VELVET_COLORS.coneSuspicious;
    if (g.state === 'chase') color = VELVET_COLORS.coneAlert;
    const poly = velvetConePolygon(g.x, g.y, g.angle, VELVET.guardSightHalfAngle, VELVET.guardSightRange, blockers, 16);
    velvetDrawCone(ctx, poly, color);
  }
  for (const cam of level.cameras) {
    if (level.now < cam.disabledUntil) continue;
    const poly = velvetConePolygon(cam.x, cam.y, cam.angle, VELVET.cameraSightHalfAngle, VELVET.cameraSightRange, blockers, 14);
    velvetDrawCone(ctx, poly, VELVET_COLORS.cameraCone);
  }
  for (const cam of level.cameras) {
    ctx.fillStyle = level.now < cam.disabledUntil ? '#555' : '#ffd640';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d1530';
    ctx.beginPath();
    ctx.arc(cam.x + Math.cos(cam.angle) * 4, cam.y + Math.sin(cam.angle) * 4, 4, 0, Math.PI * 2);
    ctx.fill();
    if (level.now < cam.disabledUntil) {
      ctx.fillStyle = '#888';
      ctx.font = 'bold 9px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OFF', cam.x, cam.y + 20);
    }
  }
  for (const g of level.guards) {
    ctx.fillStyle = VELVET_COLORS.guard;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = VELVET_COLORS.guardTrim;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = VELVET_COLORS.guardTrim;
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.angle) * 8, g.y + Math.sin(g.angle) * 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.name[0], g.x, g.y - 18);
    if (g.state === 'suspicious' || g.state === 'investigate') {
      ctx.fillStyle = VELVET_COLORS.warn;
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('?', g.x, g.y - 26);
    }
    if (g.state === 'chase') {
      ctx.fillStyle = VELVET_COLORS.danger;
      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.fillText('!', g.x, g.y - 26);
    }
    if (g.suspicion > 1 && g.state !== 'chase') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(g.x - 14, g.y + 16, 28, 4);
      ctx.fillStyle = g.suspicion > 55 ? VELVET_COLORS.warn : VELVET_COLORS.safe;
      ctx.fillRect(g.x - 14, g.y + 16, 28 * (g.suspicion / 100), 4);
    }
  }
}

function velvetDrawPlayer(ctx, level, player) {
  for (const s of level.smokes) {
    if (level.now > s.until) continue;
    ctx.fillStyle = VELVET_COLORS.smoke;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(s.x - 30, s.y - 12, s.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s.x + 28, s.y + 14, s.r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  const disguised = level.now < player.disguisedUntil;
  ctx.strokeStyle = VELVET_COLORS.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(player.x, player.y, VELVET.playerRadius + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = disguised ? '#f5f5f5' : VELVET_COLORS.thiefCoat;
  ctx.beginPath();
  ctx.arc(player.x, player.y, VELVET.playerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = disguised ? VELVET_COLORS.gold : '#e8e4da';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = VELVET_COLORS.thief;
  ctx.beginPath();
  ctx.arc(player.x + Math.cos(player.angle) * 5, player.y + Math.sin(player.angle) * 5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1f2a44';
  ctx.beginPath();
  ctx.arc(player.x + Math.cos(player.angle) * 5 - 4, player.y + Math.sin(player.angle) * 5 - 2, 2, 0, Math.PI * 2);
  ctx.arc(player.x + Math.cos(player.angle) * 5 + 3, player.y + Math.sin(player.angle) * 5 - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  if (player.hasGolden) {
    ctx.fillStyle = VELVET_COLORS.gold;
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', player.x, player.y - 20);
  }
  if (player.weight > 0) {
    ctx.fillStyle = VELVET_COLORS.gold;
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$' + player.loot, player.x, player.y + 26);
  }
  for (const t of level.tosses) {
    const p = t.t / t.dur;
    const x = t.x + (t.tx - t.x) * p;
    const y = t.y + (t.ty - t.y) * p - Math.sin(p * Math.PI) * 26;
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const c of level.clinks) {
    ctx.strokeStyle = 'rgba(255, 209, 102,' + (c.life) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 10 + (0.8 - c.life) * 30, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function velvetDrawExit(ctx, level, player) {
  const z = level.exitZone;
  const glow = player.hasGolden ? 0.5 + 0.4 * Math.sin(level.now * 4) : 0.3;
  ctx.fillStyle = 'rgba(57, 217, 138,' + glow + ')';
  ctx.fillRect(z.x - 6, z.y - 10, z.w + 12, z.h + 16);
  ctx.fillStyle = VELVET_COLORS.safe;
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(player.hasGolden ? 'GETAWAY →' : 'EXIT', z.x + z.w / 2, z.y - 16);
}

function velvetDrawFloaters(ctx, level) {
  ctx.textAlign = 'center';
  for (const f of level.floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    ctx.fillStyle = f.color;
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}

function velvetDrawHud(ctx, S) {
  const level = S.level;
  const player = S.player;
  ctx.fillStyle = VELVET_COLORS.hudBg;
  ctx.fillRect(0, 0, 1280, 46);
  // Alarm meter.
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', 16, 19);
  const ax = 78;
  const aw = 220;
  ctx.fillStyle = '#222';
  ctx.fillRect(ax, 8, aw, 16);
  const alarmColor = level.alarm > 66 ? VELVET_COLORS.danger : level.alarm > 33 ? VELVET_COLORS.warn : VELVET_COLORS.safe;
  ctx.fillStyle = alarmColor;
  ctx.fillRect(ax, 8, aw * (level.alarm / 100), 16);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(ax, 8, aw, 16);
  if (level.lockdown > 0) {
    ctx.fillStyle = VELVET_COLORS.danger;
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText('LOCKDOWN ' + Math.ceil(level.lockdown) + 's', ax + aw + 12, 20);
  }
  // Loot, lives, time.
  ctx.fillStyle = VELVET_COLORS.gold;
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText('💰 $' + player.loot, 470, 21);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial, sans-serif';
  let hearts = '';
  for (let i = 0; i < S.lives; i++) hearts += '♥ ';
  ctx.fillStyle = '#ff5d8f';
  ctx.fillText(hearts, 600, 21);
  ctx.fillStyle = '#fff';
  const t = Math.floor(S.elapsed);
  ctx.fillText('⏱ ' + Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'), 700, 21);
  // Objective.
  ctx.fillStyle = player.hasGolden ? VELVET_COLORS.safe : VELVET_COLORS.warn;
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(player.hasGolden ? '★ Reach the getaway car!' : '★ Steal the Golden Chip', 1264, 20);
  // Tool bar.
  ctx.textAlign = 'left';
  ctx.fillStyle = VELVET_COLORS.hudBg;
  ctx.fillRect(0, 674, 1280, 46);
  let tx = 16;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('TOOLS:', tx, 694);
  tx += 62;
  for (const tool of VELVET_TOOLS) {
    const afford = player.loot >= tool.cost;
    ctx.fillStyle = afford ? '#2c2a4a' : '#1a1826';
    ctx.fillRect(tx, 680, 150, 34);
    ctx.strokeStyle = afford ? VELVET_COLORS.gold : '#444';
    ctx.strokeRect(tx, 680, 150, 34);
    ctx.fillStyle = afford ? '#fff' : '#777';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.fillText('[' + tool.num + '] ' + tool.name + ' $' + tool.cost, tx + 6, 701);
    tx += 158;
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('🪙 Toss: ' + player.tossesLeft + ' (click floor)', tx + 8, 701);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#bbb';
  ctx.fillText('WASD move · Shift run · C sneak · E grab/open · P pause · M mute', 1264, 701);
  // Interact prompt.
  if (player.interactTarget && S.screen === 'play') {
    const it = player.interactTarget;
    let label = '';
    if (it.kind === 'chips' || it.kind === 'gold' || it.kind === 'golden') label = 'E — GRAB $' + it.value;
    else if (it.kind === 'safe') label = 'Hold E — CRACK SAFE ($1000)';
    else if (it.id) label = 'Hold E — OPEN ' + it.label + (player.interactProgress > 0 ? ' ' + Math.round((player.interactProgress / VELVET.doorOpenSeconds) * 100) + '%' : '');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    const w = ctx.measureText(label).width + 24;
    ctx.fillRect(640 - w / 2, 600, w, 30);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 640, 620);
    if (player.interactProgress > 0) {
      ctx.fillStyle = VELVET_COLORS.gold;
      ctx.fillRect(640 - w / 2, 630, w * (player.interactProgress / VELVET.doorOpenSeconds), 4);
    }
  }
  // Alarm vignette.
  if (level.alarm > 55) {
    const pulse = 0.10 + 0.10 * Math.sin(level.now * 6);
    ctx.strokeStyle = 'rgba(255, 59, 48,' + (pulse + level.alarm / 400) + ')';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 1270, 710);
  }
}

function velvetDrawMenu(ctx, S) {
  ctx.fillStyle = 'rgba(8, 4, 18, 0.78)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  ctx.fillStyle = VELVET_COLORS.gold;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('THE VELVET CHIP', 640, 170);
  ctx.fillStyle = '#fff';
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillText('One night. One casino. One Golden Chip.', 640, 212);
  ctx.font = '16px Arial, sans-serif';
  ctx.fillStyle = '#e8e4da';
  const lines = [
    'You are Nico Vale, the smoothest thief in the city. Tonight the Aurelia Casino',
    'keeps its Golden Chip — worth $5,000 — behind a vault door, four guards and',
    'three sweeping cameras. Slip past the cones, crack the vault, grab the chip,',
    'and walk out the front door to the getaway car. Every chip you pocket buys',
    'a tool: smoke to vanish, an EMP to blind the cameras, a disguise to stroll',
    'past the guards — but every ounce of loot slows you down. Choose well.',
    '',
    'WASD / arrows — move      Shift — run (loud!)      C — sneak (quiet)',
    'E — grab loot / hold to open doors      Click floor — toss a chip to distract',
    '1-4 — buy a tool      P — pause      M — mute',
  ];
  lines.forEach((ln, i) => ctx.fillText(ln, 640, 268 + i * 26));
  const best = S.best || 0;
  if (best > 0) {
    ctx.fillStyle = VELVET_COLORS.gold;
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('Best getaway so far: $' + best, 640, 268 + lines.length * 26 + 8);
  }
  ctx.fillStyle = VELVET_COLORS.safe;
  ctx.font = 'bold 22px Arial, sans-serif';
  const blink = 0.6 + 0.4 * Math.sin(S.level.now * 3);
  ctx.globalAlpha = blink;
  ctx.fillText('— Press ENTER or click to begin the heist —', 640, 620);
  ctx.globalAlpha = 1;
}

function velvetDrawEndScreen(ctx, S, kind) {
  ctx.fillStyle = 'rgba(8, 4, 18, 0.82)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  if (kind === 'win') {
    ctx.fillStyle = VELVET_COLORS.gold;
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText('GETAWAY!', 640, 180);
    ctx.fillStyle = '#fff';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillText('Nico Vale slips into the night with the Golden Chip.', 640, 220);
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = VELVET_COLORS.cream;
    const rows = [
      'Loot banked: $' + S.score.loot,
      'Time bonus: $' + S.score.timeBonus,
      S.score.ghostBonus > 0 ? 'Ghost bonus (never spotted): $' + S.score.ghostBonus : 'Ghost bonus: $0 (you were spotted)',
      'TOTAL SCORE: $' + S.score.total,
    ];
    rows.forEach((r, i) => ctx.fillText(r, 640, 300 + i * 34));
    ctx.fillStyle = VELVET_COLORS.safe;
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Press ENTER to run it again', 640, 520);
  } else if (kind === 'busted') {
    ctx.fillStyle = VELVET_COLORS.danger;
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText('BUSTED!', 640, 180);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('Guard ' + (S.level.caughtBy || '') + ' caught you in the act.', 640, 230);
    ctx.fillText('You dropped a quarter of your unbanked loot and slipped back to the door.', 640, 262);
    ctx.fillStyle = VELVET_COLORS.warn;
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('Lives left: ' + S.lives + ' — press ENTER to keep going', 640, 330);
  } else if (kind === 'gameover') {
    ctx.fillStyle = VELVET_COLORS.danger;
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText('THE HOUSE WINS', 640, 180);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('Three busts. Security walks you out. The Golden Chip stays in the vault.', 640, 230);
    ctx.fillStyle = VELVET_COLORS.gold;
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('Final loot: $' + S.player.loot + ' — press ENTER to try again', 640, 300);
  } else if (kind === 'paused') {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillText('PAUSED', 640, 300);
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('P or Esc to resume', 640, 350);
  }
}

function velvetRender(ctx, S) {
  ctx.clearRect(0, 0, 1280, 720);
  velvetDrawFloor(ctx, S.level);
  velvetDrawExit(ctx, S.level, S.player);
  velvetDrawLoot(ctx, S.level);
  velvetDrawCover(ctx, S.level);
  velvetDrawDoors(ctx, S.level);
  velvetDrawGuards(ctx, S.level);
  velvetDrawPlayer(ctx, S.level, S.player);
  velvetDrawFloaters(ctx, S.level);
  velvetDrawWalls(ctx, S.level);
  velvetDrawHud(ctx, S);
  if (S.screen === 'menu') velvetDrawMenu(ctx, S);
  else if (S.screen === 'busted') velvetDrawEndScreen(ctx, S, 'busted');
  else if (S.screen === 'win') velvetDrawEndScreen(ctx, S, 'win');
  else if (S.screen === 'gameover') velvetDrawEndScreen(ctx, S, 'gameover');
  else if (S.screen === 'paused') velvetDrawEndScreen(ctx, S, 'paused');
}
