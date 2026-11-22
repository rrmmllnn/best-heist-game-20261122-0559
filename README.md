# Gilded Vault — Midnight at the Maravilla Museum

A complete, original top-down heist game that runs offline in a desktop
browser from its own static files. No network requests, no libraries:
vanilla canvas JavaScript, WebAudio-synthesized sound.

## The heist

You are the thief. Three museum floors stand between you and the night's
take: the Gallery of Gems, the Hall of Kings, and the Gilded Vault itself.
On each floor, steal the treasure (the Star of Maravilla, the Crown of the
Sun Kings, the Gilded Idol), then reach the green EXIT for the getaway.

## What stands in your way

- **Guards** patrol fixed routes with visible vision cones. Step into a
  cone and the ALARM meter climbs; break line of sight behind a pedestal
  or wall and it falls again. A hot alarm sends guards hunting your last
  seen position.
- **Security cameras** sweep their arcs from the walls. An EMP burst
  freezes them.
- **Laser grids** blink on and off in front of the loot. Time your crossing
  — or EMP them.
- **The ALARM meter** (top of the screen) is the heart of the game: at
  100% you get a short grace window to vanish before you are caught.

## Routes and tools

Every floor offers three ways through: the guarded main hall, the
laser-lined side wing, and the slow vent crawl lane along the bottom
(thieves in vents cannot be seen). Gold doors are lockpick shortcuts —
hold F beside one for 2.2 seconds.

- **Q — smoke pellet** (×3 per floor): a 4-second cloud that breaks all
  line of sight.
- **E — EMP burst** (×2 per floor): freezes cameras and lasers for 5 seconds.
- **Shift — sneak**: slower, but the alarm rises half as fast while seen.
- **Click** — walk to a point. **M** — mute.

## Play

`node serve.ts`, then open http://localhost:8080. Click or press Enter
to start. R restarts a floor after being caught; Enter advances after a
clean getaway.

Staged screenshots: `?shot=cover|patrol|alarm|win` loads a fixed,
deterministic scene (see `game/src/stage.js` and `shots.json`).

## Files

- `game/index.html` — the page; `game/src/game.js` — state machine + loop
- `game/src/config.js` — tuning and palette
- `game/src/levels.js` — the three floors (maps, patrols, cameras, lasers)
- `game/src/vision.js` — line of sight, cones, laser crossings
- `game/src/patrol.js` — guard routes and camera sweeps
- `game/src/tools.js` — smoke, EMP, lockpick
- `game/src/audio.js` — synthesized WebAudio sound
- `game/src/input.js` — keyboard and mouse
- `game/src/render.js` — all canvas drawing, HUD included
- `game/src/stage.js` — deterministic screenshot staging
- `main.ts` — hands the entry in (copies game/ + screenshots/, writes dossier.json)
