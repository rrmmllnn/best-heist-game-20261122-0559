// Gilded Vault — seeing and being seen.
// One job: line of sight, vision cones, and laser crossings.

import { TILE } from './config.js';

export function tileSolidAt(parsed, col, row, rows) {
  const ch = rows[row] && rows[row][col];
  if (ch === '#') return true;
  if (ch === 'o') return true;
  if (ch === 'D') {
    const door = parsed.doors.find((d) => d.col === col && d.row === row);
    return !(door && door.open);
  }
  return false;
}

export function pointBlocked(parsed, rows, x, y) {
  const col = Math.floor(x / TILE);
  const row = Math.floor(y / TILE);
  return tileSolidAt(parsed, col, row, rows);
}

// True when a straight line between two points crosses no wall, pedestal
// or shut door. Sampled finely enough that no thin wall is skipped.
export function hasLineOfSight(parsed, rows, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 6));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (pointBlocked(parsed, rows, ax + dx * t, ay + dy * t)) return false;
  }
  return true;
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Is the target inside a watcher's cone and visible to them?
export function insideCone(parsed, rows, watcher, target, range, halfAngle) {
  const dx = target.x - watcher.x;
  const dy = target.y - watcher.y;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return { seen: false, dist };
  const facing = watcher.angle;
  const toTarget = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(toTarget, facing)) > halfAngle) return { seen: false, dist };
  if (!hasLineOfSight(parsed, rows, watcher.x, watcher.y, target.x, target.y)) {
    return { seen: false, dist };
  }
  return { seen: true, dist };
}

export function distanceToLaserSegment(laser, x, y) {
  const dx = laser.x2 - laser.x1;
  const dy = laser.y2 - laser.y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((x - laser.x1) * dx + (y - laser.y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = laser.x1 + dx * t;
  const cy = laser.y1 + dy * t;
  return Math.hypot(x - cx, y - cy);
}

export function laserIsLive(laser, time) {
  const phase = ((time + laser.phase) % laser.period) / laser.period;
  return phase < laser.on;
}
