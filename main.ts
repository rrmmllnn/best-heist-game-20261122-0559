// Gilded Vault — hand-in program.
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
};

function copyTree(name) {
  const src = join(repoRoot, name);
  const dst = join(outDir, name);
  if (!existsSync(src)) throw new Error(`main.ts: missing ${name}/ in the repository`);
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true, dereference: false });
}

mkdirSync(outDir, { recursive: true });
copyTree('game');
copyTree('screenshots');

const dossier = buildDossier(outDir, caps);
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Gilded Vault handed in: dossier.json ${dossier.length} bytes in ${outDir}`);
