// VelvetCasino — the Aurelia Casino floor: walls, cover, doors, loot, patrols.
// Three routes to the vault: the guard-heavy main floor, the camera-swept
// service corridor, and the high-roller lounge behind velvet ropes (ropes
// block your feet, not their eyes).

function velvetSegHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx;
    let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (Math.abs(dy) < 1e-9) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy;
    let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

function velvetRayDistance(ox, oy, dx, dy, maxDist, blockers) {
  let best = maxDist;
  for (const r of blockers) {
    const t = velvetRayRectT(ox, oy, dx, dy, r);
    if (t !== null && t < best) best = t;
  }
  return best;
}

function velvetRayRectT(ox, oy, dx, dy, r) {
  let tmin = 0;
  let tmax = Infinity;
  if (Math.abs(dx) < 1e-9) {
    if (ox < r.x || ox > r.x + r.w) return null;
  } else {
    let t1 = (r.x - ox) / dx;
    let t2 = (r.x + r.w - ox) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }
  if (Math.abs(dy) < 1e-9) {
    if (oy < r.y || oy > r.y + r.h) return null;
  } else {
    let t1 = (r.y - oy) / dy;
    let t2 = (r.y + r.h - oy) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }
  return tmin;
}

function velvetLosClear(x1, y1, x2, y2, blockers) {
  for (const r of blockers) {
    if (velvetSegHitsRect(x1, y1, x2, y2, r)) return false;
  }
  return true;
}

function velvetConePolygon(ox, oy, angle, halfAngle, range, blockers, steps) {
  const pts = [{ x: ox, y: oy }];
  const n = steps || 18;
  for (let i = 0; i <= n; i++) {
    const a = angle - halfAngle + (2 * halfAngle * i) / n;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const d = velvetRayDistance(ox, oy, dx, dy, range, blockers);
    pts.push({ x: ox + dx * d, y: oy + dy * d });
  }
  return pts;
}

function velvetPointInCone(px, py, ox, oy, angle, halfAngle, range, blockers) {
  const dx = px - ox;
  const dy = py - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range || dist < 1) return false;
  let diff = Math.atan2(dy, dx) - angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) > halfAngle) return false;
  return velvetLosClear(ox, oy, px, py, blockers);
}

function velvetCircleHitsRect(cx, cy, radius, r) {
  const nx = Math.max(r.x, Math.min(cx, r.x + r.w));
  const ny = Math.max(r.y, Math.min(cy, r.y + r.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < radius * radius;
}

function buildVelvetCasino() {
  const walls = [
    { x: 0, y: 0, w: 1280, h: 24 },
    { x: 0, y: 0, w: 24, h: 720 },
    { x: 1256, y: 0, w: 24, h: 720 },
    { x: 0, y: 696, w: 600, h: 24 },
    { x: 680, y: 696, w: 600, h: 24 },
    { x: 520, y: 24, w: 16, h: 166 },
    { x: 744, y: 24, w: 16, h: 66 },
    { x: 744, y: 150, w: 16, h: 40 },
    { x: 520, y: 174, w: 80, h: 16 },
    { x: 680, y: 174, w: 80, h: 16 },
    { x: 1064, y: 150, w: 16, h: 150 },
    { x: 1064, y: 360, w: 16, h: 60 },
    { x: 760, y: 150, w: 304, h: 16 },
    { x: 1064, y: 420, w: 192, h: 16 },
  ];
  // Velvet ropes: block movement, never block sight.
  const ropes = [
    { x: 380, y: 300, w: 180, h: 10 },
    { x: 380, y: 300, w: 10, h: 170 },
    { x: 550, y: 300, w: 10, h: 170 },
    { x: 380, y: 460, w: 70, h: 10 },
    { x: 500, y: 460, w: 60, h: 10 },
  ];
  // Cover: blocks movement and sight. Readable at a glance: gold-trimmed.
  const cover = [
    { x: 270, y: 250, w: 96, h: 34, kind: 'slots', label: 'SLOTS' },
    { x: 270, y: 300, w: 96, h: 34, kind: 'slots', label: 'SLOTS' },
    { x: 914, y: 250, w: 96, h: 34, kind: 'slots', label: 'SLOTS' },
    { x: 914, y: 300, w: 96, h: 34, kind: 'slots', label: 'SLOTS' },
    { x: 420, y: 400, w: 110, h: 62, kind: 'blackjack', label: 'BLACKJACK' },
    { x: 780, y: 400, w: 110, h: 62, kind: 'blackjack', label: 'BLACKJACK' },
    { x: 585, y: 470, w: 110, h: 110, kind: 'roulette', label: 'ROULETTE' },
    { x: 40, y: 480, w: 170, h: 46, kind: 'bar', label: 'BAR' },
    { x: 240, y: 600, w: 34, h: 34, kind: 'planter', label: '' },
    { x: 1006, y: 600, w: 34, h: 34, kind: 'planter', label: '' },
    { x: 420, y: 330, w: 90, h: 50, kind: 'sofa', label: 'VIP' },
  ];
  const doors = [
    { id: 'vault', x: 600, y: 174, w: 80, h: 16, open: false, progress: 0, label: 'VAULT DOOR' },
    { id: 'service', x: 1064, y: 300, w: 16, h: 60, open: false, progress: 0, label: 'SERVICE DOOR' },
    { id: 'east', x: 744, y: 90, w: 16, h: 60, open: false, progress: 0, label: 'VAULT SIDE DOOR' },
  ];
  const loot = [
    { id: 'golden', x: 640, y: 100, kind: 'golden', value: 5000, taken: false, weight: 3 },
    { id: 'bar1', x: 575, y: 82, kind: 'gold', value: 500, taken: false, weight: 1 },
    { id: 'bar2', x: 705, y: 82, kind: 'gold', value: 500, taken: false, weight: 1 },
    { id: 'bar3', x: 640, y: 152, kind: 'gold', value: 500, taken: false, weight: 1 },
    { id: 'safe', x: 470, y: 385, kind: 'safe', value: 1000, taken: false, weight: 2, needsOpen: true, progress: 0 },
    { id: 'chips1', x: 475, y: 392, kind: 'chips', value: 50, taken: false, weight: 0 },
    { id: 'chips2', x: 835, y: 392, kind: 'chips', value: 50, taken: false, weight: 0 },
    { id: 'chips3', x: 318, y: 240, kind: 'chips', value: 50, taken: false, weight: 0 },
    { id: 'chips4', x: 962, y: 240, kind: 'chips', value: 50, taken: false, weight: 0 },
    { id: 'chips5', x: 125, y: 470, kind: 'chips', value: 50, taken: false, weight: 0 },
    { id: 'chips6', x: 640, y: 560, kind: 'chips', value: 50, taken: false, weight: 0 },
  ];
  const guards = [
    { name: 'Marco', x: 250, y: 250, waypoints: [[250, 250], [250, 550], [450, 550], [450, 250]], wp: 0, angle: 0, state: 'patrol', suspicion: 0, pause: 0, investigate: null, chaseTime: 0, stuck: 0 },
    { name: 'Sofia', x: 950, y: 250, waypoints: [[950, 250], [1050, 250], [1050, 550], [900, 550]], wp: 0, angle: 0, state: 'patrol', suspicion: 0, pause: 0, investigate: null, chaseTime: 0, stuck: 0 },
    { name: 'Bruno', x: 580, y: 300, waypoints: [[580, 300], [780, 300], [780, 560], [580, 560]], wp: 0, angle: 0, state: 'patrol', suspicion: 0, pause: 0, investigate: null, chaseTime: 0, stuck: 0 },
    { name: 'Vera', x: 560, y: 240, waypoints: [[560, 240], [720, 240]], wp: 0, angle: 0, state: 'patrol', suspicion: 0, pause: 0, investigate: null, chaseTime: 0, stuck: 0 },
  ];
  const cameras = [
    { x: 640, y: 30, baseAngle: Math.PI / 2, angle: Math.PI / 2, sweep: 1.1, speed: 0.55, phase: 0, disabledUntil: 0, spotted: 0 },
    { x: 1250, y: 300, baseAngle: Math.PI, angle: Math.PI, sweep: 0.9, speed: 0.45, phase: 1.3, disabledUntil: 0, spotted: 0 },
    { x: 1140, y: 426, baseAngle: -Math.PI / 2, angle: -Math.PI / 2, sweep: 0.7, speed: 0.6, phase: 2.1, disabledUntil: 0, spotted: 0 },
  ];
  return {
    walls, ropes, cover, doors, loot, guards, cameras,
    exitZone: { x: 600, y: 672, w: 80, h: 24 },
    playerStart: { x: 640, y: 648 },
    vaultPedestal: { x: 640, y: 100 },
  };
}
