// Gilded Vault — shared tuning and palette.
// One job: every number and colour the rest of the game agrees on.

export const TILE = 40;
export const COLS = 32;
export const ROWS = 20;
export const VIEW_W = COLS * TILE;
export const VIEW_H = ROWS * TILE;

export const PALETTE = {
  floorDark: '#122b33',
  floorLight: '#173842',
  marbleVein: '#1d4550',
  wall: '#0a1a20',
  wallTop: '#274b57',
  gold: '#f2c14e',
  goldDim: '#a8842f',
  velvet: '#7e1f2e',
  velvetDark: '#5c1420',
  laser: '#ff2e4d',
  laserDim: '#7d1226',
  cone: 'rgba(242, 193, 78, 0.20)',
  coneHot: 'rgba(255, 46, 77, 0.30)',
  cameraCone: 'rgba(94, 234, 212, 0.16)',
  thief: '#f5efe0',
  thiefCoat: '#232a3a',
  guard: '#31435c',
  guardTrim: '#f2c14e',
  hud: '#0b1c22',
  hudText: '#f5efe0',
  alarmLow: '#3fce7c',
  alarmMid: '#f2c14e',
  alarmHigh: '#ff2e4d',
  exit: '#3fce7c',
  smoke: 'rgba(200, 210, 215, 0.55)',
};

export const TUNING = {
  thiefSpeed: 168,
  sneakSpeed: 96,
  ventSpeed: 70,
  guardSpeed: 62,
  guardChaseSpeed: 118,
  guardSight: 185,
  guardConeHalf: 0.62,
  cameraSight: 235,
  cameraConeHalf: 0.5,
  alarmRiseGuard: 42,
  alarmRiseCamera: 30,
  alarmRiseLaser: 55,
  alarmFall: 14,
  alarmWarnAt: 55,
  spotGraceSeconds: 0.9,
  smokeSeconds: 4,
  empSeconds: 5,
  lockpickSeconds: 2.2,
  lootScore: 1000,
  levelTimeBonus: 500,
};

export const TOOL_DEFS = [
  { key: 'smoke', label: 'SMOKE', hint: 'Q — smoke pellet', start: 3 },
  { key: 'emp', label: 'EMP', hint: 'E — EMP burst', start: 2 },
];

export const LEVEL_NAMES = [
  'I — Gallery of Gems',
  'II — Hall of Kings',
  'III — The Gilded Vault',
];

export const LOOT_NAMES = ['Star of Maravilla', 'Crown of the Sun Kings', 'The Gilded Idol'];
