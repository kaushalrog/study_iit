#!/usr/bin/env node
/**
 * A stand-in for Supabase's content_packs table, for testing content delivery on a real device without a cloud project.
 * Serves every pack file in a directory: {base}/manifest and {base}/pack/{id}. Edit or add files while it runs to "publish".
 *
 *   mkdir content-feed && cp my-pack.json content-feed/ && node scripts/content-feed-test-server.mjs --dir content-feed --port 4001
 *
 * A pack file is {"id","kind","version","title","payload","retired"?,"minAppVersion"?}. The checksum is computed here, as the publisher does.
 */
import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1]]] : a), []));
const dir = resolve(args.dir ?? 'content-feed'); const port = Number(args.port ?? 4001);
const canon = (v) => Array.isArray(v) ? `[${v.map(canon).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}` : JSON.stringify(v);
const log = (m) => { const l = `${new Date().toISOString()} ${m}`; console.log(l); appendFileSync(args.log ?? 'content-feed.log', l + '\n'); };
const packs = () => readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
  .map((p) => ({ ...p, sha256: createHash('sha256').update(canon(p.payload), 'utf8').digest('hex'), updatedAt: p.updatedAt ?? new Date().toISOString(), deleted: !!p.deleted, minAppVersion: p.minAppVersion ?? null, retired: p.retired ?? [] }));

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'no-store');
  if (url.pathname === '/manifest') { const m = packs().map(({ payload, retired, ...meta }) => meta); log(`GET /manifest -> ${m.map((p) => `${p.id}@v${p.version}`).join(', ')}`); return res.end(JSON.stringify(m)); }
  const m = /^\/pack\/(.+)$/.exec(url.pathname);
  if (m) { const p = packs().find((x) => x.id === decodeURIComponent(m[1])); if (!p) { res.writeHead(404); return res.end('{}'); } log(`GET /pack/${p.id} v${p.version}`); return res.end(JSON.stringify(p)); }
  res.writeHead(404); res.end('{}');
}).listen(port, '0.0.0.0', () => log(`content feed on :${port} serving ${dir}`));
