// Gilded Vault — the thief's tools.
// One job: smoke pellets, EMP bursts and the lockpick, with their costs.

import { TUNING } from './config.js';

export function makeTools() {
  return {
    smoke: 3,
    emp: 2,
    smokeClouds: [],
    empTimer: 0,
    lockpick: { active: false, target: null, progress: 0 },
  };
}

export function resetToolsForLevel(tools) {
  tools.smoke = 3;
  tools.emp = 2;
  tools.smokeClouds = [];
  tools.empTimer = 0;
  tools.lockpick = { active: false, target: null, progress: 0 };
}

export function throwSmoke(tools, x, y, time) {
  if (tools.smoke <= 0) return false;
  tools.smoke -= 1;
  tools.smokeClouds.push({ x, y, until: time + TUNING.smokeSeconds });
  return true;
}

export function fireEmp(tools, time) {
  if (tools.emp <= 0) return false;
  tools.emp -= 1;
  tools.empTimer = TUNING.empSeconds;
  return true;
}

export function empActive(tools) {
  return tools.empTimer > 0;
}

export function insideSmoke(tools, x, y, time) {
  return tools.smokeClouds.some(
    (c) => c.until > time && Math.hypot(x - c.x, y - c.y) < 95,
  );
}

export function updateTools(tools, dt, time) {
  if (tools.empTimer > 0) tools.empTimer -= dt;
  tools.smokeClouds = tools.smokeClouds.filter((c) => c.until > time);
  if (tools.lockpick.active && tools.lockpick.target) {
    tools.lockpick.progress += dt;
    if (tools.lockpick.progress >= TUNING.lockpickSeconds) {
      tools.lockpick.target.open = true;
      tools.lockpick.active = false;
      tools.lockpick.target = null;
      tools.lockpick.progress = 0;
      return 'picked';
    }
  }
  return null;
}

export function nearestDoor(parsed, x, y) {
  let best = null;
  let bestDist = 62;
  for (const door of parsed.doors) {
    if (door.open) continue;
    const dx = (door.col + 0.5) * 40 - x;
    const dy = (door.row + 0.5) * 40 - y;
    const d = Math.hypot(dx, dy);
    if (d < bestDist) {
      bestDist = d;
      best = door;
    }
  }
  return best;
}
