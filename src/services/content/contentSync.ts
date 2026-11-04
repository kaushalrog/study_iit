import type { z } from 'zod';
import { contentRepo } from '../../database/repositories/content';
import type { SqlDb } from '../../database/sqlite/types';
import { parseImport } from '../../features/syllabus/importBundle';
import { roadmapPayloadSchema, validateRoadmap } from '../../features/roadmap/roadmap';
import { friendlyError } from '../updates/policy';
import { packHash } from './sha256';

export interface PackMeta { id: string; kind: 'bundle' | 'roadmap'; version: number; sha256: string; title: string; updatedAt: string; deleted: boolean; minAppVersion: string | null }
export interface Pack extends PackMeta { payload: unknown; retired: unknown[] }
/** Where packs come from. Supabase in the app; a fake in tests. */
export interface ContentRemote { manifest(): Promise<PackMeta[]>; pack(id: string): Promise<Pack> }

export interface AppliedPack { id: string; title: string; version: number; added: number; updated: number; withdrawn: number; warnings: string[] }
export interface ContentSyncResult {
  status: 'ok' | 'partial' | 'offline' | 'failed';
  applied: AppliedPack[]; failed: { id: string; reason: string }[]; skipped: { id: string; reason: string }[];
  upToDate: number; withdrawnByPublisher: string[]; message: string | null; at: string;
}

interface State { packs: Record<string, { version: number; sha256: string; appliedAt: string; withdrawn?: boolean }>; lastSuccessAt: string | null; lastAttemptAt: string | null }
const STATE_KEY = 'content_packs_state';
const ROADMAP_KEY = 'roadmap_override';

export async function loadState(db: SqlDb): Promise<State> {
  const r = await db.first<{ value: string }>('SELECT value FROM app_meta WHERE key = ?', [STATE_KEY]);
  try { return r ? { packs: {}, lastSuccessAt: null, lastAttemptAt: null, ...(JSON.parse(r.value) as Partial<State>) } : { packs: {}, lastSuccessAt: null, lastAttemptAt: null }; } catch { return { packs: {}, lastSuccessAt: null, lastAttemptAt: null }; }
}
const saveState = (db: SqlDb, s: State) => db.run('INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [STATE_KEY, JSON.stringify(s)]);

/** "1.2.0" style comparison; unparseable parts count as 0. */
export const versionAtLeast = (have: string, need: string) => {
  const a = have.split('.').map((x) => parseInt(x, 10) || 0), b = need.split('.').map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) { if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0); }
  return true;
};

export async function storedRoadmap(db: SqlDb): Promise<z.infer<typeof roadmapPayloadSchema>['nodes'] | null> {
  const r = await db.first<{ value: string }>('SELECT value FROM app_meta WHERE key = ?', [ROADMAP_KEY]);
  if (!r) return null;
  try { const p = roadmapPayloadSchema.safeParse(JSON.parse(r.value)); return p.success && validateRoadmap(p.data.nodes).length === 0 ? p.data.nodes : null; } catch { return null; }
}
async function applyPack(db: SqlDb, pack: Pack): Promise<AppliedPack> {
  const out: AppliedPack = { id: pack.id, title: pack.title, version: pack.version, added: 0, updated: 0, withdrawn: 0, warnings: [] };
  if (pack.kind === 'roadmap') {
    const p = roadmapPayloadSchema.safeParse(pack.payload);
    if (!p.success) throw new Error(`Roadmap is not valid: ${p.error.issues[0]?.message ?? 'unknown'}`);
    const problems = validateRoadmap(p.data.nodes);
    if (problems.length) throw new Error(`Roadmap is not safe to use: ${problems[0]}`);
    await db.run('INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [ROADMAP_KEY, JSON.stringify(p.data)]);
    out.updated = p.data.nodes.length;
    return out;
  }
  const parsed = parseImport(JSON.stringify(pack.payload));
  if (parsed.unreadable || parsed.bundles.length !== 1) throw new Error('The pack is not a single readable chapter bundle.');
  out.warnings = parsed.issues.map((i) => `${i.where}: ${i.message}`);
  const bundle = parsed.bundles[0];
  const ch = await contentRepo.resolveChapter(db, bundle.chapter);
  if (!ch) throw new Error(`Chapter "${bundle.chapter}" is not in this library.`);
  // Everything arrives as "needs review": publishing does not verify anything. Academic approval is a separate step.
  const rep = await contentRepo.importBundle(db, ch.id, bundle, false);
  out.added = rep.added.lessons + rep.added.formulas + rep.added.questions + rep.added.videos + rep.added.topics;
  out.updated = rep.updated;
  for (const r of pack.retired as { kind?: string; topic?: string | null; section?: string; level?: string; language?: string; body?: string; reason?: string }[]) {
    if (r?.kind === 'lesson' && r.section && r.level && r.language && r.body && (await contentRepo.retireLesson(db, ch.id, { topic: r.topic, section: r.section, level: r.level, language: r.language, body: r.body, reason: r.reason ?? 'Replaced by a newer version' }))) out.withdrawn++;
  }
  return out;
}

/**
 * Bring published content up to date. Cheap manifest first; only packs whose version moved are downloaded, checked against their
 * hash, validated, and applied with the same idempotent importer the app already uses. Local material is never deleted just because
 * a pack disappeared: a withdrawn pack is reported and the local copy stays.
 */
export async function syncContent(db: SqlDb, remote: ContentRemote, appVersion = '1.0.0', now: () => Date = () => new Date()): Promise<ContentSyncResult> {
  const at = now().toISOString();
  const res: ContentSyncResult = { status: 'ok', applied: [], failed: [], skipped: [], upToDate: 0, withdrawnByPublisher: [], message: null, at };
  const state = await loadState(db);
  state.lastAttemptAt = at;
  let manifest: PackMeta[];
  try { manifest = await remote.manifest(); } catch (e) {
    const f = friendlyError(e);
    res.status = f.offline ? 'offline' : 'failed'; res.message = f.offline ? 'No internet connection. Your downloaded content is unchanged.' : f.text;
    await saveState(db, state); return res;
  }
  for (const m of manifest) {
    const have = state.packs[m.id];
    if (m.deleted) { if (have && !have.withdrawn) { state.packs[m.id] = { ...have, withdrawn: true }; res.withdrawnByPublisher.push(m.id); } continue; }
    if (have && !have.withdrawn && have.version >= m.version) { res.upToDate++; continue; }
    if (m.minAppVersion && !versionAtLeast(appVersion, m.minAppVersion)) { res.skipped.push({ id: m.id, reason: `needs ORBIT ${m.minAppVersion} or newer` }); continue; }
    try {
      const pack = await remote.pack(m.id);
      if (packHash(pack.payload) !== pack.sha256 || pack.sha256 !== m.sha256) throw new Error('The downloaded pack does not match its checksum, so it was not used.');
      const applied = await applyPack(db, pack);
      state.packs[m.id] = { version: pack.version, sha256: pack.sha256, appliedAt: at };
      await saveState(db, state);
      res.applied.push(applied);
    } catch (e) {
      const f = friendlyError(e);
      if (f.offline) { res.status = 'offline'; res.message = 'The connection dropped part-way. Packs already applied are kept.'; break; }
      res.failed.push({ id: m.id, reason: f.text });
    }
  }
  if (res.failed.length && res.status === 'ok') res.status = res.applied.length || res.upToDate ? 'partial' : 'failed';
  if (res.status === 'ok' || res.status === 'partial') state.lastSuccessAt = at;
  await saveState(db, state);
  return res;
}

/** What is waiting: packs on the server newer than what this device applied (needs a manifest). */
export function pendingPacks(manifest: PackMeta[], state: State): PackMeta[] {
  return manifest.filter((m) => !m.deleted && !(state.packs[m.id] && !state.packs[m.id].withdrawn && state.packs[m.id].version >= m.version));
}
