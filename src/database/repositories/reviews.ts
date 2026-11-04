import { parseCsv, toCsv } from '../../features/review/csv';
import { academicStatus, CHECKS, CHECKS_FOR, Checks, CheckValue, Decision, DECISIONS, normName, Review, ReviewKind, Role, ROLES, StatusResult } from '../../features/review/rules';
import { seedId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { updateRow, upsertRow } from './base';

const TABLE: Record<ReviewKind, string> = { lesson: 'learning_content', formula: 'formulas', question: 'questions', video: 'video_resources' };
const REVIEWERS_KEY = 'academic_reviewers';

type Row = Record<string, string | number | null>;
const s = (v: unknown) => (v == null ? '' : String(v));

export interface AddReview {
  kind: ReviewKind; recordId: string; decision: Decision; reviewerName: string; role: Role;
  checks?: Checks; feedback?: string; evidence?: string; reviewedAt?: string; contentHash?: string;
}
export interface ImportReport { added: number; duplicates: number; rejected: { line: number; reason: string }[] }

/** Review workflow. Academic status never comes from student actions; see features/review/rules.ts. */
export const reviewsRepo = {
  /** Fingerprint of the exact content a reviewer looks at. Changing the content changes the fingerprint. */
  async recordHash(db: SqlDb, kind: ReviewKind, id: string): Promise<string | null> {
    let canon: string | null = null;
    if (kind === 'lesson') {
      const r = await db.first<Row>('SELECT section, level, language, topic_id, body FROM learning_content WHERE id = ?', [id]);
      if (r) canon = ['L', r.section, r.level, r.language, r.topic_id, r.body].map(s).join('|');
    } else if (kind === 'formula') {
      const r = await db.first<Row>('SELECT name, latex, variables_json, units, conditions, explanation, example FROM formulas WHERE id = ?', [id]);
      if (r) canon = ['F', r.name, r.latex, r.variables_json, r.units, r.conditions, r.explanation, r.example].map(s).join('|');
    } else if (kind === 'question') {
      const r = await db.first<Row>('SELECT q.type, q.stem, q.options_json, q.difficulty, qs.answer_json, qs.explanation FROM questions q LEFT JOIN question_solutions qs ON qs.question_id = q.id WHERE q.id = ?', [id]);
      if (r) canon = ['Q', r.type, r.stem, r.options_json, r.difficulty, r.answer_json, r.explanation].map(s).join('|');
    } else {
      const r = await db.first<Row>('SELECT url, title, channel, purpose, level FROM video_resources WHERE id = ?', [id]);
      if (r) canon = ['V', r.url, r.title, r.channel, r.purpose, r.level].map(s).join('|');
    }
    return canon === null ? null : seedId(`review-hash:${canon}`);
  },

  async reviewers(db: SqlDb): Promise<string[]> {
    const r = await db.first<{ value: string }>('SELECT value FROM app_meta WHERE key = ?', [REVIEWERS_KEY]);
    try { return r ? (JSON.parse(r.value) as string[]) : []; } catch { return []; }
  },
  /** The account owner lists who counts as an academic reviewer. Nobody is authorised until this is set. */
  async setReviewers(db: SqlDb, names: string[]): Promise<void> {
    const clean = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
    await db.run('INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [REVIEWERS_KEY, JSON.stringify(clean)]);
  },
  async authorised(db: SqlDb): Promise<Set<string>> { return new Set((await this.reviewers(db)).map(normName)); },

  /** Record one review. Idempotent: the same reviewer, record, date and decision never creates a second row. */
  async add(db: SqlDb, a: AddReview): Promise<{ id: string; created: boolean }> {
    if (!DECISIONS.includes(a.decision)) throw new Error(`Unknown decision "${a.decision}".`);
    if (!ROLES.includes(a.role)) throw new Error(`Unknown reviewer role "${a.role}".`);
    if (!a.reviewerName.trim()) throw new Error('Name the reviewer.');
    if (a.role === 'academic_reviewer' && !(await this.authorised(db)).has(normName(a.reviewerName))) {
      throw new Error(`${a.reviewerName.trim()} is not on the list of authorised academic reviewers.`);
    }
    const rec = await db.first<{ chapter_id: string }>(`SELECT chapter_id FROM ${TABLE[a.kind]} WHERE id = ?`, [a.recordId]);
    if (!rec) throw new Error('That record does not exist.');
    const hash = a.contentHash ?? (await this.recordHash(db, a.kind, a.recordId))!;
    const at = a.reviewedAt ?? new Date().toISOString();
    const id = seedId(`review:${a.kind}:${a.recordId}:${a.role}:${normName(a.reviewerName)}:${at}:${a.decision}`);
    if (await db.first('SELECT 1 AS x FROM content_reviews WHERE id = ?', [id])) return { id, created: false };
    await db.tx(async () => {
      await upsertRow(db, 'content_reviews', {
        id, record_kind: a.kind, record_id: a.recordId, chapter_id: rec.chapter_id, decision: a.decision, reviewer_name: a.reviewerName.trim(), reviewer_role: a.role,
        checks_json: JSON.stringify(a.checks ?? {}), feedback: a.feedback?.trim() || null, evidence: a.evidence?.trim() || null, content_hash: hash, reviewed_at: at,
      });
      // A reviewer's rejection removes the record from view. The history row above keeps the reason.
      if (a.role === 'academic_reviewer' && a.decision === 'rejected') await updateRow(db, TABLE[a.kind], a.recordId, { deleted_at: new Date().toISOString() });
    });
    return { id, created: true };
  },

  async history(db: SqlDb, kind: ReviewKind, recordId: string): Promise<Review[]> {
    const rows = await db.all<Row>('SELECT * FROM content_reviews WHERE record_kind = ? AND record_id = ? AND deleted_at IS NULL ORDER BY reviewed_at, id', [kind, recordId]);
    return rows.map(toReview);
  },

  async status(db: SqlDb, kind: ReviewKind, recordId: string): Promise<StatusResult> {
    const hash = (await this.recordHash(db, kind, recordId)) ?? '';
    return academicStatus(await this.history(db, kind, recordId), hash, await this.authorised(db));
  },

  /** Status for every record of a chapter at once, including records a reviewer rejected (they are soft-deleted). */
  async statusMap(db: SqlDb, chapterId: string): Promise<Map<string, StatusResult>> {
    const auth = await this.authorised(db);
    const reviews = (await db.all<Row>('SELECT * FROM content_reviews WHERE chapter_id = ? AND deleted_at IS NULL', [chapterId])).map(toReview);
    const byRecord = new Map<string, Review[]>();
    for (const r of reviews) { const k = `${r.recordKind}:${r.recordId}`; byRecord.set(k, [...(byRecord.get(k) ?? []), r]); }
    const out = new Map<string, StatusResult>();
    for (const kind of Object.keys(TABLE) as ReviewKind[]) {
      for (const rec of await db.all<{ id: string; deleted_at: string | null }>(`SELECT id, deleted_at FROM ${TABLE[kind]} WHERE chapter_id = ?`, [chapterId])) {
        const k = `${kind}:${rec.id}`;
        const st = academicStatus(byRecord.get(k) ?? [], (await this.recordHash(db, kind, rec.id)) ?? '', auth);
        // Withdrawn or deleted records are not part of the library, unless a reviewer rejected them (those are counted as rejected).
        if (rec.deleted_at && st.status !== 'rejected') continue;
        out.set(k, st);
      }
    }
    return out;
  },

  /** Totals for the quality report. Counts every record, including rejected ones (which are soft-deleted). */
  async totals(db: SqlDb, chapterId?: string): Promise<Record<ReviewKind, Record<string, number>>> {
    const out = {} as Record<ReviewKind, Record<string, number>>;
    const chapters = chapterId ? [chapterId] : (await db.all<{ id: string }>('SELECT id FROM chapters')).map((c) => c.id);
    for (const kind of Object.keys(TABLE) as ReviewKind[]) out[kind] = { total: 0, approved: 0, rejected: 0, needs_research: 0, stale: 0, unreviewed: 0, student_checked: 0 };
    for (const cid of chapters) {
      const map = await this.statusMap(db, cid);
      for (const [k, v] of map) {
        const kind = k.split(':')[0] as ReviewKind;
        out[kind].total++; out[kind][v.status]++;
      }
      for (const kind of Object.keys(TABLE) as ReviewKind[]) {
        out[kind].student_checked += (await db.first<{ n: number }>(`SELECT COUNT(*) n FROM ${TABLE[kind]} WHERE chapter_id = ? AND deleted_at IS NULL AND verification_status IN ('verified','published')`, [cid]))!.n;
      }
    }
    return out;
  },

  /** Markdown for reading plus a CSV for decisions. The CSV carries each record's id and content hash, so decisions import exactly. */
  async buildPacket(db: SqlDb, chapterId: string, today = new Date().toISOString().slice(0, 10)): Promise<{ markdown: string; csv: string; counts: Record<ReviewKind, number> }> {
    const ch = await db.first<{ title: string; subject: string }>('SELECT c.title, s.key AS subject FROM chapters c JOIN subjects s ON s.id = c.subject_id WHERE c.id = ?', [chapterId]);
    if (!ch) throw new Error('Chapter not found.');
    const topics = await db.all<{ id: string; title: string }>('SELECT id, title FROM topics WHERE chapter_id = ? AND deleted_at IS NULL ORDER BY sort_order, created_at', [chapterId]);
    const topicName = new Map(topics.map((t) => [t.id, t.title]));
    const csvRows: string[][] = [['record_id', 'kind', 'code', 'topic', 'preview', 'content_hash', 'decision', ...CHECKS, 'feedback', 'reviewer', 'reviewed_at']];
    const counts = { lesson: 0, formula: 0, question: 0, video: 0 } as Record<ReviewKind, number>;
    const md: string[] = [];
    const code = (k: ReviewKind, id: string) => `${k[0].toUpperCase()}-${id.slice(0, 8)}`;
    const add = async (k: ReviewKind, id: string, topic: string | null, preview: string) => {
      counts[k]++;
      csvRows.push([id, k, code(k, id), topic ?? '(chapter overview)', preview.replace(/\s+/g, ' ').slice(0, 90), (await this.recordHash(db, k, id)) ?? '', '', ...CHECKS.map(() => ''), '', '', '']);
    };
    const tid = (id: string | null) => (id ? topicName.get(id) ?? '' : '');

    md.push(`# Academic review packet: ${ch.title}`, '', `Generated ${today}. Subject: ${ch.subject}.`, '',
      '**What this is.** Original explanations, formulas, practice questions and video links written for ORBIT. None of it has been academically reviewed. Please read each item, solve each question yourself before looking at the key, and record a decision in the companion CSV (one row per item, identified by the code shown in each heading).', '',
      '**Decisions:** `approved` · `rejected` · `needs_research` · `edited` (you changed it elsewhere) · `comment`. For each check use `pass`, `fail` or `na`. Add feedback for anything that is not a plain pass.', '',
      '**Please also judge:** whether the explanation skips reasoning, whether prerequisites are right, whether each topic and question is inside the intended syllabus, and whether the difficulty label reflects the reasoning needed.', '',
      '**Scope caution.** The topic list is ORBIT\'s provisional crosswalk to the JEE syllabus, not the Chaitanya IPL scheme.', '');

    const lessons = await db.all<Row>('SELECT id, topic_id, section, level, body FROM learning_content WHERE chapter_id = ? AND deleted_at IS NULL ORDER BY sort_order, created_at', [chapterId]);
    const formulas = await db.all<Row>('SELECT id, topic_id, name, latex, variables_json, units, conditions, explanation FROM formulas WHERE chapter_id = ? AND deleted_at IS NULL ORDER BY name', [chapterId]);
    const questions = await db.all<Row>(`SELECT q.id, q.topic_id, q.type, q.stem, q.options_json, q.difficulty, q.origin, qs.answer_json, qs.explanation
      FROM questions q LEFT JOIN question_solutions qs ON qs.question_id = q.id WHERE q.chapter_id = ? AND q.deleted_at IS NULL ORDER BY q.created_at`, [chapterId]);
    const videos = await db.all<Row>('SELECT id, topic_id, title, channel, url, purpose, level, why FROM video_resources WHERE chapter_id = ? AND deleted_at IS NULL ORDER BY title', [chapterId]);

    const groups: (string | null)[] = [null, ...topics.map((t) => t.id)];
    for (const g of groups) {
      md.push(`## ${g ? topicName.get(g) : 'Chapter overview'}`, '');
      for (const l of lessons.filter((x) => (x.topic_id ?? null) === g)) {
        await add('lesson', s(l.id), g ? tid(g) : null, `${l.section}: ${l.body}`);
        md.push(`### [${code('lesson', s(l.id))}] ${s(l.section).replace(/_/g, ' ')} (${s(l.level)})`, '', s(l.body), '');
      }
      for (const f of formulas.filter((x) => (x.topic_id ?? null) === g)) {
        await add('formula', s(f.id), g ? tid(g) : null, s(f.name));
        const vars = (JSON.parse(s(f.variables_json) || '[]') as { symbol: string; meaning: string; unit?: string }[]).map((v) => `${v.symbol}: ${v.meaning}${v.unit ? ` (${v.unit})` : ''}`).join('; ');
        md.push(`### [${code('formula', s(f.id))}] Formula: ${s(f.name)}`, '', `$$${s(f.latex)}$$`, '', vars ? `Variables: ${vars}` : '', f.conditions ? `Conditions: ${s(f.conditions)}` : '', f.units ? `Units: ${s(f.units)}` : '', f.explanation ? `Note: ${s(f.explanation)}` : '', '');
      }
      for (const q of questions.filter((x) => (x.topic_id ?? null) === g)) {
        await add('question', s(q.id), g ? tid(g) : null, s(q.stem));
        const opts = (JSON.parse(s(q.options_json) || '[]') as string[]).map((o, i) => `   ${'ABCDEF'[i]}. ${o}`).join('\n');
        const key = JSON.parse(s(q.answer_json) || '{}') as { correct?: string[]; numeric?: number };
        md.push(`### [${code('question', s(q.id))}] Question (${s(q.type)}, ${s(q.difficulty)}, origin: ${s(q.origin)})`, '', s(q.stem), '', opts, '', `**Key:** ${key.numeric !== undefined ? key.numeric : (key.correct ?? []).join(', ')}`, q.explanation ? `**Solution:** ${s(q.explanation)}` : '', '');
      }
      for (const v of videos.filter((x) => (x.topic_id ?? null) === g)) {
        await add('video', s(v.id), g ? tid(g) : null, s(v.title));
        md.push(`### [${code('video', s(v.id))}] Video: ${s(v.title)}`, '', `Channel: ${s(v.channel)}  \nLink: ${s(v.url)}  \nPurpose: ${s(v.purpose)}, level ${s(v.level)}`, v.why ? `Why recommended: ${s(v.why)}` : '', '', '*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*', '');
      }
    }
    return { markdown: md.filter((x, i, a) => !(x === '' && a[i - 1] === '')).join('\n'), csv: toCsv(csvRows), counts };
  },

  /** Import a filled-in decision sheet. Rows with no decision are skipped; each row is validated on its own. */
  async importDecisions(db: SqlDb, csvText: string, defaultRole: Role = 'academic_reviewer'): Promise<ImportReport> {
    const rows = parseCsv(csvText);
    const report: ImportReport = { added: 0, duplicates: 0, rejected: [] };
    if (rows.length === 0) { report.rejected.push({ line: 1, reason: 'The file is empty.' }); return report; }
    const head = rows[0].map((h) => h.trim());
    const col = (n: string) => head.indexOf(n);
    for (const need of ['record_id', 'kind', 'content_hash', 'decision', 'reviewer', 'reviewed_at']) if (col(need) < 0) { report.rejected.push({ line: 1, reason: `Missing column "${need}".` }); return report; }
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]; const get = (n: string) => (col(n) < 0 ? '' : (r[col(n)] ?? '').trim());
      const decision = get('decision').toLowerCase();
      if (!decision) continue;
      const line = i + 1;
      try {
        const kind = get('kind') as ReviewKind;
        if (!(kind in TABLE)) throw new Error(`Unknown kind "${kind}".`);
        if (!DECISIONS.includes(decision as Decision)) throw new Error(`Unknown decision "${decision}".`);
        const at = get('reviewed_at');
        if (!/^\d{4}-\d{2}-\d{2}/.test(at) || Number.isNaN(Date.parse(at))) throw new Error('reviewed_at must be a date like 2026-11-20.');
        const id = get('record_id');
        const current = await this.recordHash(db, kind, id);
        if (current === null) throw new Error('That record is not in this library (it may have been rejected or never imported).');
        if (current !== get('content_hash')) throw new Error('The content changed after this packet was made. Export a new packet and review again.');
        const checks: Checks = {};
        for (const c of CHECKS) { const v = get(c).toLowerCase(); if (v) { if (!['pass', 'fail', 'na'].includes(v)) throw new Error(`${c} must be pass, fail or na.`); if (CHECKS_FOR[kind].includes(c)) checks[c] = v as CheckValue; } }
        if (decision === 'approved' && Object.values(checks).includes('fail')) throw new Error('A record with a failed check cannot be approved.');
        if ((decision === 'rejected' || decision === 'needs_research') && !get('feedback')) throw new Error(`Say why in the feedback column when the decision is ${decision}.`);
        const res = await this.add(db, { kind, recordId: id, decision: decision as Decision, reviewerName: get('reviewer'), role: defaultRole, checks, feedback: get('feedback'), reviewedAt: at, contentHash: current });
        res.created ? report.added++ : report.duplicates++;
      } catch (e) { report.rejected.push({ line, reason: e instanceof Error ? e.message : 'Invalid row' }); }
    }
    return report;
  },
};

function toReview(r: Row): Review {
  let checks: Checks = {};
  try { checks = JSON.parse(s(r.checks_json) || '{}'); } catch { /* ignore */ }
  return {
    id: s(r.id), recordKind: s(r.record_kind) as ReviewKind, recordId: s(r.record_id), decision: s(r.decision) as Decision, reviewerName: s(r.reviewer_name), reviewerRole: s(r.reviewer_role) as Role,
    checks, feedback: r.feedback == null ? null : s(r.feedback), evidence: r.evidence == null ? null : s(r.evidence), contentHash: s(r.content_hash), reviewedAt: s(r.reviewed_at),
  };
}
