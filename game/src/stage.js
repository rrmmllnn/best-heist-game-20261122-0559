// Gilded Vault — staged shots for screenshots.
// One job: put the game in one fixed, reproducible pose per ?shot= name,
// so every screenshot is a real render of the game's own code, deterministic.

import { TILE } from './config.js';

function place(game, xTile, yTile) {
  game.player.x = (xTile + 0.5) * TILE;
  game.player.y = (yTile + 0.5) * TILE;
}

export function setupShot(game, name) {
  game.staged = true;
  game.time = 1.7;
  if (name === 'cover') {
    game.loadLevel(0);
    place(game, 9, 10);
    game.player.sneaking = true;
    game.guards[0].x = 14.5 * TILE;
    game.guards[0].y = 6.5 * TILE;
    game.guards[0].angle = 0.5;
    game.guards[1].x = 20.5 * TILE;
    game.guards[1].y = 3.5 * TILE;
    game.guards[1].angle = -0.4;
    game.cameras[0].angle = Math.PI / 2 + 0.45;
    game.cameras[1].angle = -Math.PI / 2 - 0.3;
    game.alarm = 34;
    game.score = 0;
    game.screen = 'play';
  } else if (name === 'patrol') {
    game.loadLevel(1);
    place(game, 13, 12);
    game.player.sneaking = true;
    game.guards[0].x = 10.5 * TILE;
    game.guards[0].y = 6.5 * TILE;
    game.guards[0].angle = 0;
    game.guards[1].x = 20.5 * TILE;
    game.guards[1].y = 3.5 * TILE;
    game.guards[1].angle = 2.6;
    game.guards[2].x = 27.5 * TILE;
    game.guards[2].y = 14.5 * TILE;
    game.guards[2].angle = Math.PI;
    game.cameras[0].angle = Math.PI / 2 - 0.5;
    game.cameras[1].angle = -Math.PI / 2 + 0.4;
    game.alarm = 12;
    game.score = 1000;
    game.screen = 'play';
  } else if (name === 'alarm') {
    game.loadLevel(0);
    place(game, 19, 6);
    game.guards[0].x = 16.5 * TILE;
    game.guards[0].y = 6.5 * TILE;
    game.guards[0].angle = 0;
    game.guards[0].state = 'chase';
    game.guards[1].x = 21.5 * TILE;
    game.guards[1].y = 3.5 * TILE;
    game.guards[1].angle = 1.2;
    game.cameras[0].angle = Math.PI / 2 + 0.2;
    game.alarm = 82;
    game.spottedFlash = 1;
    game.score = 1000;
    game.screen = 'play';
  } else if (name === 'win') {
    game.loadLevel(2);
    game.lootTaken = true;
    place(game, 28, 16);
    game.guards[0].x = 12.5 * TILE;
    game.guards[0].y = 6.5 * TILE;
    game.guards[0].angle = Math.PI;
    game.guards[1].x = 20.5 * TILE;
    game.guards[1].y = 3.5 * TILE;
    game.guards[1].angle = 2.2;
    game.guards[2].x = 27.5 * TILE;
    game.guards[2].y = 12.5 * TILE;
    game.guards[2].angle = -1.2;
    game.cameras[0].angle = Math.PI / 2 - 0.6;
    game.cameras[2].angle = Math.PI / 2 + 0.3;
    game.alarm = 8;
    game.score = 3450;
    game.screen = 'win';
  } else {
    game.loadLevel(0);
    game.screen = 'play';
  }
  game.stagedTime = game.time;
}
