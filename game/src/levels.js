// Gilded Vault — the three museum floors.
// One job: the map text and the patrols, cameras and lasers on each floor.
// Legend: # wall  . floor  o pedestal (cover, blocks sight)  v vent lane
//         D locked door (lockpick shortcut)  P start  T loot  E getaway exit

import { TILE } from './config.js';

const L1_MAP = [
  '################################',
  '#P......#.......#.......#......#',
  '#.......#...o...#...o...#..T...#',
  '#..o....#.......#.......#......#',
  '#.......#.......#.......#......#',
  '#.......D.......D.......D......#',
  '#..............................#',
  '#..o........o........o......o..#',
  '#..............................#',
  '#####.#######.#######.#######.##',
  '#..............................#',
  '#..o........o........o......o..#',
  '#..............................#',
  '#.......#.......#.......#......#',
  '#..o....#...o...#...o...#......#',
  '#.......#.......#.......#......#',
  '#.......#.......#.......#...E..#',
  '#..............................#',
  '#.vvvvvvvvvvvvvvvvvvvvvvvvvvvv.#',
  '################################',
];

const L2_MAP = [
  '################################',
  '#......#........#.......#......#',
  '#.P....#...o....#...o...#..T...#',
  '#......#........#.......#......#',
  '#..o...D....o...D...o...D......#',
  '#......#........#.......#......#',
  '#..............................#',
  '#...o.......o........o......o..#',
  '#..............................#',
  '####.########.########.######.##',
  '#..............................#',
  '#..o........o........o......o..#',
  '#..............................#',
  '#......#........#.......#......#',
  '#.o....#....o...#...o...#......#',
  '#......#........#.......#......#',
  '#......#........#.......#..E...#',
  '#..............................#',
  '#.vvvvvvvvvvvvvvvvvvvvvvvvvvvv.#',
  '################################',
];

const L3_MAP = [
  '################################',
  '#......#........#.......#..T...#',
  '#.P....#...o....#...o...#......#',
  '#......#........#.......#......#',
  '#..o...D....o...D...o...D..o...#',
  '#......#........#.......#......#',
  '#..............................#',
  '#...o.......o........o......o..#',
  '#..............................#',
  '#####.#######.#######.#######.##',
  '#..............................#',
  '#..o........o........o......o..#',
  '#..............................#',
  '#......#........#.......#......#',
  '#.o....#....o...#...o...#..o...#',
  '#......#........#.......#......#',
  '#......#........#.......#...E..#',
  '#..............................#',
  '#.vvvvvvvvvvvvvvvvvvvvvvvvvvvv.#',
  '################################',
];

function px(tile) {
  return (tile + 0.5) * TILE;
}

export const LEVELS = [
  {
    name: 'Gallery of Gems',
    map: L1_MAP,
    guards: [
      { path: [[5, 6], [26, 6]], speed: 1.0 },
      { path: [[18, 3], [22, 3]], speed: 1.0 },
    ],
    cameras: [
      { x: px(26), y: 14, baseAngle: Math.PI / 2, sweep: 0.9, speed: 0.55 },
      { x: px(10), y: 19 * TILE - 14, baseAngle: -Math.PI / 2, sweep: 0.9, speed: 0.45 },
    ],
    lasers: [
      { x1: 26.5 * TILE, y1: 1 * TILE, x2: 26.5 * TILE, y2: 5 * TILE, period: 3.4, on: 0.65, phase: 0 },
    ],
  },
  {
    name: 'Hall of Kings',
    map: L2_MAP,
    guards: [
      { path: [[5, 6], [26, 6]], speed: 1.15 },
      { path: [[18, 3], [22, 3]], speed: 1.15 },
      { path: [[26, 14], [29, 14]], speed: 1.05 },
    ],
    cameras: [
      { x: px(10), y: 14, baseAngle: Math.PI / 2, sweep: 1.0, speed: 0.7 },
      { x: px(22), y: 19 * TILE - 14, baseAngle: -Math.PI / 2, sweep: 1.0, speed: 0.6 },
    ],
    lasers: [
      { x1: 26.5 * TILE, y1: 1 * TILE, x2: 26.5 * TILE, y2: 5 * TILE, period: 3.0, on: 0.7, phase: 0 },
      { x1: 8 * TILE, y1: 10.5 * TILE, x2: 16 * TILE, y2: 10.5 * TILE, period: 2.6, on: 0.6, phase: 1.1 },
    ],
  },
  {
    name: 'The Gilded Vault',
    map: L3_MAP,
    guards: [
      { path: [[5, 6], [26, 6]], speed: 1.3 },
      { path: [[18, 3], [22, 3]], speed: 1.3 },
      { path: [[26, 14], [29, 14]], speed: 1.25 },
    ],
    cameras: [
      { x: px(10), y: 14, baseAngle: Math.PI / 2, sweep: 1.1, speed: 0.85 },
      { x: px(22), y: 19 * TILE - 14, baseAngle: -Math.PI / 2, sweep: 1.1, speed: 0.75 },
      { x: px(28), y: 14, baseAngle: Math.PI / 2, sweep: 0.8, speed: 0.9 },
    ],
    lasers: [
      { x1: 26.5 * TILE, y1: 1 * TILE, x2: 26.5 * TILE, y2: 5 * TILE, period: 2.6, on: 0.75, phase: 0 },
      { x1: 8 * TILE, y1: 10.5 * TILE, x2: 16 * TILE, y2: 10.5 * TILE, period: 2.4, on: 0.65, phase: 0.8 },
      { x1: 2 * TILE, y1: 6.5 * TILE, x2: 14 * TILE, y2: 6.5 * TILE, period: 3.2, on: 0.6, phase: 1.6 },
    ],
  },
];

export function parseMap(rows) {
  const walls = new Set();
  const pedestals = new Set();
  const vents = new Set();
  const doors = [];
  let start = { x: px(1), y: px(1) };
  let loot = { x: px(27), y: px(2) };
  let exit = { x: px(28), y: px(16) };
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      const key = c + ',' + r;
      if (ch === '#') walls.add(key);
      else if (ch === 'o') pedestals.add(key);
      else if (ch === 'v') vents.add(key);
      else if (ch === 'D') doors.push({ col: c, row: r, open: false, progress: 0 });
      else if (ch === 'P') start = { x: px(c), y: px(r) };
      else if (ch === 'T') loot = { x: px(c), y: px(r) };
      else if (ch === 'E') exit = { x: px(c), y: px(r) };
    }
  });
  return { walls, pedestals, vents, doors, start, loot, exit };
}

export function tileAt(rows, col, row) {
  if (row < 0 || row >= rows.length || col < 0 || col >= rows[0].length) return '#';
  return rows[row][col];
}
