#!/usr/bin/env node
/**
 * A minimal Expo Updates server (protocol v1) for proving over-the-air delivery on a real installed build WITHOUT an Expo account.
 * It serves one exported JavaScript bundle (npx expo export) to builds whose runtime version matches, and tells every other build
 * "no update available". It is a test tool: production updates go through EAS Update (docs/UPDATES.md).
 *
 *   npx expo export --platform android --output-dir dist-ota
 *   node scripts/ota-test-server.mjs --dir dist-ota --runtime <runtime version> [--port 4000] [--channel preview]
 */
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1]]] : a), []));
const dir = resolve(args.dir ?? 'dist-ota');
const port = Number(args.port ?? 4000);
const channel = args.channel ?? 'preview';
const logFile = args.log ?? 'ota-server.log';
if (!args.runtime) { console.error('Pass --runtime <runtime version of the build that may receive this update>'); process.exit(2); }
const runtime = args.runtime;
const host = args.host ?? '10.0.2.2';          // how the Android emulator reaches this computer

const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const sha = (buf) => b64url(createHash('sha256').update(buf).digest());
const log = (m) => { const line = `${new Date().toISOString()} ${m}`; console.log(line); appendFileSync(logFile, line + '\n'); };
const MIME = { '.hbc': 'application/javascript', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.otf': 'font/otf', '.json': 'application/json', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' };

const meta = JSON.parse(readFileSync(join(dir, 'metadata.json'), 'utf8')).fileMetadata.android;
const expoClient = JSON.parse(execFileSync('npx', ['expo', 'config', '--json', '--type', 'public'], { encoding: 'utf8', env: { ...process.env, ORBIT_UPDATES_TEST: '1' } }));
const bundlePath = meta.bundle;
const bundle = readFileSync(join(dir, bundlePath));
const bundleHash = sha(bundle);
const hex = createHash('sha256').update(bundle).digest('hex');
const updateId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
const base = `http://${host}:${port}`;
const assetUrl = (p) => `${base}/assets?asset=${encodeURIComponent(p)}`;

function manifest() {
  return {
    id: updateId, createdAt: new Date(statSync(join(dir, bundlePath)).mtimeMs).toISOString(), runtimeVersion: runtime,
    launchAsset: { hash: bundleHash, key: `bundle-${hex.slice(0, 32)}`, contentType: 'application/javascript', url: assetUrl(bundlePath) },
    assets: meta.assets.map((a) => { const buf = readFileSync(join(dir, a.path)); return { hash: sha(buf), key: createHash('md5').update(buf).digest('hex'), fileExtension: `.${a.ext}`, contentType: MIME[`.${a.ext}`] ?? 'application/octet-stream', url: assetUrl(a.path) }; }),
    metadata: {}, extra: { expoClient },
  };
}

const multipart = (parts) => {
  const boundary = `orbit${randomUUID().replace(/-/g, '')}`;
  const body = parts.map((p) => `--${boundary}\r\ncontent-disposition: form-data; name="${p.name}"\r\ncontent-type: application/json; charset=utf-8\r\n\r\n${JSON.stringify(p.json)}\r\n`).join('') + `--${boundary}--\r\n`;
  return { boundary, body };
};

createServer((req, res) => {
  const url = new URL(req.url, base);
  const h = (n) => req.headers[n] ?? '';
  if (url.pathname === '/manifest') {
    const rt = String(h('expo-runtime-version')), cur = String(h('expo-current-update-id')), platform = String(h('expo-platform')), ch = String(h('expo-channel-name'));
    let outcome;
    if (platform !== 'android') outcome = 'noUpdateAvailable (platform)';
    else if (rt !== runtime) outcome = 'noUpdateAvailable (runtime mismatch)';
    else if (ch && ch !== channel) outcome = `noUpdateAvailable (channel ${ch} != ${channel})`;
    else if (cur === updateId) outcome = 'noUpdateAvailable (already running this update)';
    else outcome = 'manifest';
    log(`GET /manifest runtime=${rt} channel=${ch} current=${cur || '-'} -> ${outcome}${outcome === 'manifest' ? ` ${updateId}` : ''} (server runtime ${runtime})`);
    const m = multipart(outcome === 'manifest' ? [{ name: 'manifest', json: manifest() }, { name: 'extensions', json: { assetRequestHeaders: {} } }] : [{ name: 'directive', json: { type: 'noUpdateAvailable' } }]);
    res.writeHead(200, { 'expo-protocol-version': '1', 'expo-sfv-version': '0', 'cache-control': 'private, max-age=0', 'content-type': `multipart/mixed; boundary=${m.boundary}` });
    return res.end(m.body);
  }
  if (url.pathname === '/assets') {
    const p = join(dir, url.searchParams.get('asset') ?? '');
    if (!p.startsWith(dir) || !existsSync(p)) { res.writeHead(404); return res.end('not found'); }
    log(`GET /assets ${url.searchParams.get('asset')}`);
    res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream', 'cache-control': 'public, max-age=31536000' });
    return res.end(readFileSync(p));
  }
  res.writeHead(404); res.end('not found');
}).listen(port, '0.0.0.0', () => log(`OTA test server on :${port} serving update ${updateId} for runtime ${runtime}, channel ${channel}`));
