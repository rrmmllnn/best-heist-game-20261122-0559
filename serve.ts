// Gilded Vault — local play-test server.
// Serves game/ on http://localhost:8080 with no other dependencies.

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const root = resolve(import.meta.dirname ?? '.', 'game');
const port = Number(process.env.PORT || 8080);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  let path = decodeURIComponent(url.pathname);
  if (path === '/') path = '/index.html';
  const file = join(root, path);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found\n');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`Gilded Vault serving game/ at http://localhost:${port}`);
});
