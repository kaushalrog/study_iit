#!/usr/bin/env node
/**
 * Publish academic content to Supabase as versioned content packs (never needs a new APK).
 *
 *   npm run content:validate          # rebuild, audit and import-test the JSON first
 *   npm run content:publish:dry       # show what would change
 *   CONTENT_PUBLISHER_EMAIL=... CONTENT_PUBLISHER_PASSWORD=... npm run content:publish
 *
 * Needs EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (public values, from .env) and the sign-in of an account listed in
 * the content_publishers table. No service-role key is ever used or needed. A pack is only re-published when its content changed.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dry = process.argv.includes('--dry-run');
const printHashes = process.argv.includes('--print-hashes');
const root = new URL('..', import.meta.url).pathname;
const dirArg = process.argv.indexOf('--dir');
const contentDir = dirArg > 0 ? process.argv[dirArg + 1] : join(root, 'content');

/** Same canonical form as src/services/content/sha256.ts: keys sorted at every level. */
const canon = (v) => Array.isArray(v) ? `[${v.map(canon).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}` : JSON.stringify(v);
export const hashOf = (payload) => createHash('sha256').update(canon(payload), 'utf8').digest('hex');

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const retiredAll = existsSync(join(contentDir, 'retired.json')) ? JSON.parse(readFileSync(join(contentDir, 'retired.json'), 'utf8')).retired : [];

const packs = [];
for (const f of readdirSync(contentDir).filter((x) => x.endsWith('.json') && !['retired.json', 'roadmap.json'].includes(x))) {
  const payload = JSON.parse(readFileSync(join(contentDir, f), 'utf8'));
  if (typeof payload.chapter !== 'string') { console.error(`${f}: not a chapter bundle (no "chapter")`); process.exit(2); }
  packs.push({ id: `chapter:${slug(payload.chapter)}`, kind: 'bundle', title: payload.chapter, payload, retired: retiredAll.filter((r) => r.chapter === payload.chapter) });
}
if (existsSync(join(contentDir, 'roadmap.json'))) packs.push({ id: 'roadmap', kind: 'roadmap', title: 'IIT roadmap', payload: JSON.parse(readFileSync(join(contentDir, 'roadmap.json'), 'utf8')), retired: [] });

if (printHashes) { for (const p of packs) console.log(`${p.id} ${hashOf(p.payload)}`); process.exit(0); }

const env = (n) => process.env[n] ?? '';
const url = env('EXPO_PUBLIC_SUPABASE_URL'), anon = env('EXPO_PUBLIC_SUPABASE_ANON_KEY');
if (!url || !anon) { console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (load .env).'); process.exit(2); }
const { createClient } = await import('@supabase/supabase-js');
const sb = createClient(url, anon, { auth: { persistSession: false } });
if (!dry) {
  const { error } = await sb.auth.signInWithPassword({ email: env('CONTENT_PUBLISHER_EMAIL'), password: env('CONTENT_PUBLISHER_PASSWORD') });
  if (error) { console.error(`Sign-in failed: ${error.message}`); process.exit(2); }
}
const { data: existing, error: e1 } = dry ? { data: [], error: null } : await sb.from('content_packs').select('id, version, sha256');
if (e1) { console.error(e1.message); process.exit(1); }
const have = new Map((existing ?? []).map((r) => [r.id, r]));
let changed = 0;
for (const p of packs) {
  const sha256 = hashOf(p.payload); const cur = have.get(p.id);
  if (cur && cur.sha256 === sha256) { console.log(`= ${p.id} v${cur.version} unchanged`); continue; }
  const version = (cur?.version ?? 0) + 1;
  console.log(`${dry ? '(dry run) would publish' : 'publishing'} ${p.id} v${version}${cur ? ` (was v${cur.version})` : ' (new)'}`);
  changed++;
  if (dry) continue;
  const row = { id: p.id, kind: p.kind, version, title: p.title, payload: p.payload, sha256, retired: p.retired };
  const { error } = cur ? await sb.from('content_packs').update(row).eq('id', p.id) : await sb.from('content_packs').insert(row);
  if (error) { console.error(`  failed: ${error.message}`); process.exit(1); }
}
console.log(`${changed} pack${changed === 1 ? '' : 's'} ${dry ? 'would change' : 'published'}. Devices pick them up when ORBIT next opens (Settings > Software updates > Refresh content).`);
