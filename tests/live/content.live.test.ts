/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { seedInitialData } from '../../src/database/seed';
import { ContentRemote, Pack, PackMeta, syncContent } from '../../src/services/content/contentSync';
import { packHash } from '../../src/services/content/sha256';
import { memoryDb } from '../unit/sqlite-harness';
import { as, ensureUser, exec, LIVE, reset, select } from './pg';

jest.setTimeout(120_000);
const STUDENT = '33333333-3333-4333-8333-333333333333';
const PUBLISHER = '66666666-6666-4666-8666-666666666666';
const d = LIVE ? describe : describe.skip;

/** Reads packs the way the app does, as a signed-in student, under row-level security. */
const pgContentRemote = (user: string): ContentRemote => ({
  async manifest(): Promise<PackMeta[]> {
    return select<{ id: string; kind: 'bundle' | 'roadmap'; version: number; sha256: string; title: string; updated_at: string; deleted_at: string | null; min_app_version: string | null }>(as('authenticated', user),
      'select id, kind, version, sha256, title, updated_at, deleted_at, min_app_version from content_packs order by updated_at').map((r) => ({ id: r.id, kind: r.kind, version: r.version, sha256: r.sha256, title: r.title, updatedAt: r.updated_at, deleted: !!r.deleted_at, minAppVersion: r.min_app_version }));
  },
  async pack(id: string): Promise<Pack> {
    const r = select<{ id: string; kind: 'bundle' | 'roadmap'; version: number; sha256: string; title: string; updated_at: string; deleted_at: string | null; min_app_version: string | null; payload: unknown; retired: unknown[] }>(as('authenticated', user), `select * from content_packs where id = '${id}'`)[0];
    return { id: r.id, kind: r.kind, version: r.version, sha256: r.sha256, title: r.title, updatedAt: r.updated_at, deleted: !!r.deleted_at, minAppVersion: r.min_app_version, payload: r.payload, retired: r.retired ?? [] };
  },
});

const bundle = (extra: object[] = []) => ({ chapter: 'Gravitation', topics: ['Escape velocity'], lessons: [{ topic: 'Escape velocity', section: 'explanation', level: 'main', language: 'en', body: 'Published lesson one.', source: 'live test' }, ...extra], formulas: [], questions: [], videos: [] });
const publish = (who: string, id: string, version: number, payload: unknown, update = false) => {
  const json = JSON.stringify(payload).replace(/\$/g, '');
  const sha = packHash(JSON.parse(json));
  const t = '$pk$';
  return update
    ? exec(as('authenticated', who), `update content_packs set version = ${version}, payload = ${t}${json}${t}::jsonb, sha256 = '${sha}' where id = '${id}'`)
    : exec(as('authenticated', who), `insert into content_packs (id, kind, version, title, payload, sha256) values ('${id}', 'bundle', ${version}, '${id}', ${t}${json}${t}::jsonb, '${sha}')`);
};

d('LIVE: remotely published content against real Postgres', () => {
  beforeAll(() => { ensureUser(STUDENT, 'student@example.test'); ensureUser(PUBLISHER, 'publisher@example.test'); });
  beforeEach(() => { reset(); exec(as('postgres'), `insert into content_publishers (user_id, display_name) values ('${PUBLISHER}', 'Publisher')`); });

  it('only a listed publisher can publish; students can read but not write; anonymous users see nothing', () => {
    expect(publish(STUDENT, 'chapter:gravitation', 1, bundle()).ok).toBe(false);
    expect(publish(PUBLISHER, 'chapter:gravitation', 1, bundle()).ok).toBe(true);
    expect(select(as('authenticated', STUDENT), 'select id from content_packs')).toHaveLength(1);
    expect(exec(as('authenticated', STUDENT), "update content_packs set title = 'x' where id = 'chapter:gravitation'").count).toBe(0);
    expect(exec(as('authenticated', STUDENT), "delete from content_packs").ok).toBe(false);
    expect(exec(as('anon'), 'select 1 from content_packs').ok).toBe(false);
    expect(exec(as('authenticated', STUDENT), `insert into content_publishers (user_id, display_name) values ('${STUDENT}', 'me')`).ok).toBe(false);
  });

  it('versions only move forward, and a bad id or hash is refused', () => {
    publish(PUBLISHER, 'chapter:gravitation', 3, bundle());
    expect(publish(PUBLISHER, 'chapter:gravitation', 3, bundle(), true).ok).toBe(false);
    expect(publish(PUBLISHER, 'chapter:gravitation', 2, bundle(), true).ok).toBe(false);
    expect(publish(PUBLISHER, 'chapter:gravitation', 4, bundle(), true).ok).toBe(true);
    expect(exec(as('authenticated', PUBLISHER), `insert into content_packs (id, kind, version, title, payload, sha256) values ('Bad Id!', 'bundle', 1, 't', '{}', '${'a'.repeat(64)}')`).ok).toBe(false);
    expect(exec(as('authenticated', PUBLISHER), `insert into content_packs (id, kind, version, title, payload, sha256) values ('okay', 'bundle', 1, 't', '{}', 'nothex')`).ok).toBe(false);
  });

  it('publish -> sync -> publish an update -> sync, with no app change in between; then offline keeps the content', async () => {
    const device = memoryDb(); await migrate(device); await seedInitialData(device);
    const remote = pgContentRemote(STUDENT);
    publish(PUBLISHER, 'chapter:gravitation', 1, bundle());
    const first = await syncContent(device, remote);
    expect(first).toMatchObject({ status: 'ok' }); expect(first.applied[0]).toMatchObject({ version: 1 });
    expect((await device.first<{ n: number }>('SELECT COUNT(*) n FROM learning_content'))!.n).toBe(1);

    publish(PUBLISHER, 'chapter:gravitation', 2, bundle([{ topic: 'Escape velocity', section: 'tips', level: 'main', language: 'en', body: 'Lesson two, published later.', source: 'live test' }]), true);
    const second = await syncContent(device, remote);
    expect(second.applied[0]).toMatchObject({ version: 2, added: 1 });
    expect((await device.all<{ body: string }>('SELECT body FROM learning_content ORDER BY created_at')).map((r) => r.body)).toEqual(['Published lesson one.', 'Lesson two, published later.']);

    const offline: ContentRemote = { manifest: async () => { throw new Error('Network request failed'); }, pack: async () => { throw new Error('Network request failed'); } };
    expect((await syncContent(device, offline)).status).toBe('offline');
    expect((await device.first<{ n: number }>('SELECT COUNT(*) n FROM learning_content'))!.n).toBe(2);
  });

  it('a payload altered after publishing is rejected by the checksum', async () => {
    publish(PUBLISHER, 'chapter:gravitation', 1, bundle());
    // The version guard blocks edits that keep the same version (even by an admin), so switch it off just to simulate tampering.
    exec(as('postgres'), `alter table content_packs disable trigger content_packs_version_guard; update content_packs set payload = jsonb_set(payload, '{lessons,0,body}', '"Tampered text"'); alter table content_packs enable trigger content_packs_version_guard`);
    const device = memoryDb(); await migrate(device); await seedInitialData(device);
    const res = await syncContent(device, pgContentRemote(STUDENT));
    expect(res.failed[0].reason).toMatch(/checksum/); expect((await device.first<{ n: number }>('SELECT COUNT(*) n FROM learning_content'))!.n).toBe(0);
  });
});
