// Gilded Vault — patrols and sweeps.
// One job: move guards along their routes and swing cameras on their arcs.

import { TILE, TUNING } from './config.js';
import { angleTo } from './vision.js';

export function makeGuard(def) {
  const path = def.path.map(([c, r]) => ({ x: (c + 0.5) * TILE, y: (r + 0.5) * TILE }));
  return {
    x: path[0].x,
    y: path[0].y,
    path,
    leg: 0,
    forward: true,
    angle: 0,
    speed: TUNING.guardSpeed * def.speed,
    state: 'patrol',
    chaseX: 0,
    chaseY: 0,
    pause: 0,
  };
}

export function makeCamera(def) {
  return {
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    speed: def.speed,
    angle: def.baseAngle,
    frozen: 0,
  };
}

function moveToward(guard, tx, ty, dt) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return true;
  const step = Math.min(dist, guard.speed * dt);
  guard.x += (dx / dist) * step;
  guard.y += (dy / dist) * step;
  guard.angle = angleTo(guard.x, guard.y, tx, ty);
  return dist - step < 2;
}

export function updateGuard(guard, dt, time, alarm, player) {
  // A hot alarm sends a guard hunting the last place the thief was seen.
  if (alarm > 50 && player.seenRecently) {
    guard.state = 'chase';
    guard.chaseX = player.x;
    guard.chaseY = player.y;
  } else if (guard.state === 'chase' && alarm < 25) {
    guard.state = 'patrol';
  }
  const speed = guard.state === 'chase' ? TUNING.guardChaseSpeed : guard.speed;
  const saved = guard.speed;
  guard.speed = speed;
  if (guard.state === 'chase') {
    const arrived = moveToward(guard, guard.chaseX, guard.chaseY, dt);
    if (arrived) guard.state = 'patrol';
  } else {
    if (guard.pause > 0) {
      guard.pause -= dt;
    } else {
      const target = guard.path[guard.forward ? guard.leg + 1 : guard.leg - 1];
      const dest = target || guard.path[guard.forward ? 0 : guard.path.length - 1];
      const arrived = moveToward(guard, dest.x, dest.y, dt);
      if (arrived) {
        guard.pause = 0.7;
        if (guard.forward) {
          guard.leg += 1;
          if (guard.leg >= guard.path.length - 1) guard.forward = false;
        } else {
          guard.leg -= 1;
          if (guard.leg <= 0) guard.forward = true;
        }
      }
    }
  }
  guard.speed = saved;
}

export function updateCamera(camera, dt, time) {
  if (camera.frozen > 0) {
    camera.frozen -= dt;
    return;
  }
  camera.angle =
    camera.baseAngle + Math.sin(time * camera.speed) * camera.sweep;
}
