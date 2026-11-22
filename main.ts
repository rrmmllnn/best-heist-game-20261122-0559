// VelvetHandIn — hands The Velvet Chip to make.fun.
// Copies game/ and screenshots/ into the output directory and writes the
// dossier with the kit's library, so the gate sees exactly what we built.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function velvetCopyTree(name) {
  const from = join(repoRoot, name);
  const to = join(outDir, name);
  if (!existsSync(from)) throw new Error('missing ' + name + ' in repository');
  cpSync(from, to, { recursive: true });
}

function velvetHandIn() {
  mkdirSync(outDir, { recursive: true });
  rmSync(join(outDir, 'game'), { recursive: true, force: true });
  rmSync(join(outDir, 'screenshots'), { recursive: true, force: true });
  rmSync(join(outDir, 'dossier.json'), { force: true });
  velvetCopyTree('game');
  velvetCopyTree('screenshots');
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log('Velvet Chip handed in: game + screenshots + dossier.json in ' + outDir);
}

velvetHandIn();
