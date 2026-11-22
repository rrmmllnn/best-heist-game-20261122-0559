[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/rrmmllnn/best-heist-game-20261122-0559/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/rrmmllnn/best-heist-game-20261122-0559/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

# The Velvet Chip — Heist at the Aurelia Casino

A complete top-down heist game built for the [make.fun best heist game bounty](https://make.fun/c/best-heist-game-20261122-0559). You are Nico Vale, the smoothest thief in the city. Tonight the Aurelia Casino keeps its Golden Chip — worth $5,000 — behind a vault door, four patrolling guards and three sweeping cameras. Slip past the cones, crack the vault, grab the chip, and walk out the front door to the getaway car.

## How it plays

- **Three routes to the vault** — the guard-heavy main floor past the slot banks, the camera-swept service corridor on the east side, or the high-roller lounge behind velvet ropes (ropes block your feet, not their eyes).
- **Guards with vision cones** — patrol routes you can learn, cones clipped by walls and cover by real raycasting. A guard that glimpses you turns suspicious (`?`); fill the meter and the alarm sounds (`!`) and every guard gives chase.
- **Cameras that sweep** — three wall cameras sweep the vault approach, the floor and the service corridor. An EMP kills them for 8 seconds.
- **An alarm meter that gives you a chance to recover** — break line of sight and the alarm cools. At 100% the casino locks down for 12 seconds: guards chase, and getting caught costs a life and a quarter of your loot.
- **Loot has weight** — every chip and gold bar you pocket slows you down. Grab greedily and you move slower through the cones. Bank it all by reaching the car.
- **Tools at a cost** — spend your loot on a Smoke Bomb (vanish for 5s), an EMP (cameras dead 8s), a Disguise (stroll past guards for 10s) or a Lockpick (open a door at once). Click a tool in the HUD or press 1–4.
- **Distraction** — click the floor to toss a chip; the clink draws the nearest guard over to investigate. Running is fast but loud: guards hear it and come looking.
- **Feel** — footsteps, slot jingles, guard barks, the alarm sting, a chime for every grab and a fanfare for the getaway — all synthesised live with Web Audio, no audio files.
- **Score** — loot banked + time bonus + a $1,500 ghost bonus for never being spotted. Best getaway saved locally.

## Controls

| Key | Action |
| --- | --- |
| WASD / arrows | Move |
| Shift | Run (fast, loud, easy to spot) |
| C / Ctrl | Sneak (slow, quiet, hard to spot) |
| E / Space | Grab loot, hold to open doors / crack the safe |
| Click floor | Toss a chip to distract a guard |
| 1 / 2 / 3 / 4 | Smoke Bomb / EMP / Disguise / Lockpick (costs loot) |
| P / Esc | Pause |
| M | Mute |
| Enter | Confirm on menus |

## Run it

No build step, no network: serve `game/` with any static server and open `game/index.html` in desktop Chrome.

```sh
node serve.ts
# open http://localhost:8080
```

`main.ts` (Node 22) hands the entry in: it copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real frames of the game's own code, staged by `game/src/shots.js` (`?shot=start|play|alarm|win&seed=7`).
