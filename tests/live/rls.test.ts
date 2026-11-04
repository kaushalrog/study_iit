/** @jest-environment node */
import { as, ensureUser, exec, LIVE, newUuid, reset, select, sqlStr } from './pg';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const GRAV = '__GRAV__';
const d = LIVE ? describe : describe.skip;

d('live Postgres: schema and row-level security', () => {
  let chapterId = '';
  beforeAll(() => { ensureUser(A, 'a@example.test'); ensureUser(B, 'b@example.test'); chapterId = select(as('postgres'), "select id from chapters where title='Gravitation'")[0].id as string; });
  beforeEach(() => reset());

  const mistake = (id: string, owner?: string) =>
    `insert into mistake_entries (id, ${owner ? 'owner_id, ' : ''}subject_key, chapter_id, question_text, category) values ('${id}', ${owner ? `'${owner}', ` : ''}'physics', '${chapterId}', 'q?', 'careless')`;
  const question = (id: string, status: string, origin = 'student') =>
    `insert into questions (id, chapter_id, type, stem, verification_status, origin) values ('${id}', '${chapterId}', 'single', 'stem?', '${status}', '${origin}')`;

  describe('anonymous visitors', () => {
    it.each(['mistake_entries', 'question_attempts', 'exams', 'notes', 'chapters', 'subjects', 'question_solutions', 'mock_attempts'])('cannot read %s', (t) => {
      expect(() => select(as('anon'), `select * from ${t}`)).toThrow(/permission denied/i);
    });
    it('cannot write or truncate anything', () => {
      expect(exec(as('anon'), mistake(newUuid(), A)).ok).toBe(false);
      for (const t of ['mock_attempts', 'mistake_entries', 'chapters']) expect(exec(as('anon'), `truncate ${t} cascade`, { rollback: true }).ok).toBe(false);
    });
  });

  describe('students cannot destroy data with TRUNCATE (which RLS does not cover)', () => {
    it.each(['mistake_entries', 'mock_attempts', 'question_attempts', 'chapters', 'subjects'])('authenticated cannot truncate %s', (t) => {
      expect(exec(as('authenticated', A), `truncate ${t} cascade`, { rollback: true }).ok).toBe(false);
    });
  });

  describe('student isolation', () => {
    const idA = newUuid();
    beforeEach(() => { expect(exec(as('authenticated', A), mistake(idA)).ok).toBe(true); });

    it('stamps owner_id from the signed-in user', () => {
      expect(select(as('postgres'), `select owner_id from mistake_entries where id='${idA}'`)[0].owner_id).toBe(A);
    });
    it("B cannot see, change, delete or steal A's rows", () => {
      expect(select(as('authenticated', B), 'select * from mistake_entries')).toHaveLength(0);
      expect(exec(as('authenticated', B), `update mistake_entries set question_text='hacked' where id='${idA}'`).count).toBe(0);
      expect(exec(as('authenticated', B), `delete from mistake_entries where id='${idA}'`).count).toBe(0);
      expect(select(as('postgres'), 'select question_text from mistake_entries')[0].question_text).toBe('q?');
    });
    it('B cannot create a row owned by A', () => {
      const r = exec(as('authenticated', B), mistake(newUuid(), A));
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/row-level security/i);
    });
    it('B cannot hand a row to someone else by changing owner_id', () => {
      expect(exec(as('authenticated', A), `update mistake_entries set owner_id='${B}' where id='${idA}'`).ok).toBe(false);
    });
    it('exam sections and scoring rules follow their template owner', () => {
      const t = newUuid(), s = newUuid();
      expect(exec(as('authenticated', A), `insert into exam_templates (id, name, style) values ('${t}', 'T', 'main')`).ok).toBe(true);
      expect(exec(as('authenticated', A), `insert into exam_sections (id, template_id, section_key, name, subject_key, question_type, question_count) values ('${s}', '${t}', 'k', 'S', 'math', 'single', 4)`).ok).toBe(true);
      expect(exec(as('authenticated', A), `insert into scoring_rules (id, section_id, correct, incorrect) values ('${newUuid()}', '${s}', 4, -1)`).ok).toBe(true);
      expect(select(as('authenticated', B), 'select * from exam_sections')).toHaveLength(0);
      expect(select(as('authenticated', B), 'select * from scoring_rules')).toHaveLength(0);
      expect(exec(as('authenticated', B), `insert into exam_sections (id, template_id, section_key, name, subject_key, question_type, question_count) values ('${newUuid()}', '${t}', 'k2', 'S', 'math', 'single', 4)`).ok).toBe(false);
    });
  });

  describe('shared reference data', () => {
    it('signed-in students can read chapters but not edit them', () => {
      expect(select(as('authenticated', A), 'select title from chapters')).toHaveLength(4);
      expect(exec(as('authenticated', A), `update chapters set title='x'`, { rollback: true }).count).toBe(0);
      expect(exec(as('authenticated', A), `insert into chapters (id, subject_id, title) select gen_random_uuid(), id, 'Fake' from subjects limit 1`).ok).toBe(false);
      expect(exec(as('authenticated', A), 'delete from subjects', { rollback: true }).count).toBe(0);
    });
  });

  describe('questions and answer keys', () => {
    it('a student cannot mark a question published, and cannot self-verify a generated one', () => {
      expect(exec(as('authenticated', A), question(newUuid(), 'published')).ok).toBe(false);
      expect(exec(as('authenticated', A), question(newUuid(), 'verified', 'generated')).ok).toBe(false);
      expect(exec(as('authenticated', A), question(newUuid(), 'verified', 'coaching')).ok).toBe(true);
    });
    it('a student can store and read their own answer key', () => {
      const q = newUuid();
      expect(exec(as('authenticated', A), question(q, 'verified')).ok).toBe(true);
      expect(exec(as('authenticated', A), `insert into question_solutions (id, question_id, answer, verification_status) values ('${newUuid()}', '${q}', '{"correct":["A"]}', 'verified')`).ok).toBe(true);
      expect(select(as('authenticated', A), 'select answer from question_solutions')).toHaveLength(1);
    });
    it("another student cannot read a student's answer key", () => {
      const q = newUuid();
      exec(as('authenticated', A), question(q, 'verified'));
      exec(as('authenticated', A), `insert into question_solutions (id, question_id, answer, verification_status) values ('${newUuid()}', '${q}', '{"correct":["A"]}', 'verified')`);
      expect(select(as('authenticated', B), 'select * from question_solutions')).toHaveLength(0);
    });
    it("a student's own verified question does not leak to other students", () => {
      exec(as('authenticated', A), question(newUuid(), 'verified', 'coaching'));
      expect(select(as('authenticated', A), 'select id from questions')).toHaveLength(1);
      expect(select(as('authenticated', B), 'select id from questions')).toHaveLength(0);
    });
    it('answer keys of the shared bank (no owner) are unreadable by any student', () => {
      const q = newUuid();
      exec(as('postgres'), `insert into questions (id, chapter_id, type, stem, verification_status, origin, owner_id) values ('${q}', '${chapterId}', 'single', 's?', 'published', 'official', null)`);
      exec(as('postgres'), `insert into question_solutions (id, question_id, answer, verification_status, owner_id) values ('${newUuid()}', '${q}', '{"correct":["B"]}', 'published', null)`);
      expect(select(as('authenticated', A), 'select id from questions')).toHaveLength(1);        // the question is visible…
      expect(select(as('authenticated', A), 'select * from question_solutions')).toHaveLength(0); // …its key is not
    });
  });

  describe('student-authored lessons and formulas', () => {
    const lesson = (id: string, status: string, owner?: string) =>
      `insert into learning_content (id, ${owner ? 'owner_id, ' : ''}chapter_id, section, body, verification_status) values ('${id}', ${owner ? `'${owner}', ` : ''}'${chapterId}', 'explanation', 'text', '${status}')`;
    const formula = (id: string, status: string) =>
      `insert into formulas (id, chapter_id, name, latex, verification_status) values ('${id}', '${chapterId}', 'F', 'F=ma', '${status}')`;

    it('a student can write, read, edit and delete their own lessons and formulas', () => {
      const l = newUuid(), f = newUuid();
      expect(exec(as('authenticated', A), lesson(l, 'verified')).ok).toBe(true);
      expect(exec(as('authenticated', A), formula(f, 'needs_review')).ok).toBe(true);
      expect(select(as('authenticated', A), 'select id from learning_content')).toHaveLength(1);
      expect(exec(as('authenticated', A), `update learning_content set body='edited' where id='${l}'`).count).toBe(1);
      expect(exec(as('authenticated', A), `delete from formulas where id='${f}'`).count).toBe(1);
    });
    it('a student cannot publish content, and cannot write rows owned by someone else', () => {
      expect(exec(as('authenticated', A), lesson(newUuid(), 'published')).ok).toBe(false);
      expect(exec(as('authenticated', A), formula(newUuid(), 'published')).ok).toBe(false);
      expect(exec(as('authenticated', A), lesson(newUuid(), 'verified', B)).ok).toBe(false);
    });
    it("another student cannot see or change a student's lessons", () => {
      const l = newUuid();
      exec(as('authenticated', A), lesson(l, 'verified'));
      expect(select(as('authenticated', B), 'select id from learning_content')).toHaveLength(0);
      expect(exec(as('authenticated', B), `update learning_content set body='hijack' where id='${l}'`).count).toBe(0);
      expect(exec(as('authenticated', B), `delete from learning_content where id='${l}'`).count).toBe(0);
    });
    it('shared published lessons (no owner) are readable by everyone but editable by nobody', () => {
      const l = newUuid();
      exec(as('postgres'), lesson(l, 'published'));
      expect(select(as('authenticated', A), 'select id from learning_content')).toHaveLength(1);
      expect(exec(as('authenticated', A), `update learning_content set body='x' where id='${l}'`).count).toBe(0);
      expect(exec(as('authenticated', A), `delete from learning_content where id='${l}'`).count).toBe(0);
      expect(exec(as('anon'), 'select 1 from learning_content').ok).toBe(false);
    });
    it('unverified shared drafts are not visible to students', () => {
      exec(as('postgres'), lesson(newUuid(), 'needs_review'));
      expect(select(as('authenticated', A), 'select id from learning_content')).toHaveLength(0);
    });
  });

  describe('video catalogue', () => {
    const video = (id: string, status: string, owner?: string) =>
      `insert into video_resources (id, ${owner ? 'owner_id, ' : ''}chapter_id, kind, youtube_id, url, title, channel, purpose, verification_status) values ('${id}', ${owner ? `'${owner}', ` : ''}'${chapterId}', 'video', 'dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'T1', 'Teacher', 'concept', '${status}')`;
    it('a student manages her own videos and can verify them, but never publish', () => {
      const v = newUuid();
      expect(exec(as('authenticated', A), video(v, 'verified')).ok).toBe(true);
      expect(exec(as('authenticated', A), video(newUuid(), 'published')).ok).toBe(false);
      expect(exec(as('authenticated', A), `update video_resources set saved = true where id='${v}'`).count).toBe(1);
      expect(exec(as('authenticated', A), video(newUuid(), 'draft', B)).ok).toBe(false);
    });
    it("another student cannot see or change them, and anon cannot read", () => {
      const v = newUuid();
      exec(as('authenticated', A), video(v, 'needs_review'));
      expect(select(as('authenticated', B), 'select id from video_resources')).toHaveLength(0);
      expect(exec(as('authenticated', B), `delete from video_resources where id='${v}'`).count).toBe(0);
      expect(exec(as('anon'), 'select 1 from video_resources').ok).toBe(false);
    });
    it('question provenance columns exist and reject unknown exam categories', () => {
      expect(exec(as('authenticated', A), `insert into questions (id, chapter_id, type, stem, origin, exam_category, exam_year, citation) values ('${newUuid()}', '${chapterId}', 'single', 's?', 'official', 'jee_main', 2023, 'JEE Main 2023 Q1')`).ok).toBe(true);
      expect(exec(as('authenticated', A), `insert into questions (id, chapter_id, type, stem, exam_category) values ('${newUuid()}', '${chapterId}', 'single', 's?', 'made_up')`).ok).toBe(false);
    });
  });

  describe('content reviews', () => {
    const review = (role: string, rid = newUuid()) =>
      `insert into content_reviews (id, record_kind, record_id, chapter_id, decision, reviewer_name, reviewer_role, content_hash, reviewed_at) values ('${newUuid()}', 'lesson', '${rid}', '${chapterId}', 'approved', 'R', '${role}', 'h', now())`;
    it('a student account can record its own checks but can never record an academic reviewer decision', () => {
      expect(exec(as('authenticated', A), review('student')).ok).toBe(true);
      expect(exec(as('authenticated', A), review('ai_assistant')).ok).toBe(true);
      expect(exec(as('authenticated', A), review('academic_reviewer')).ok).toBe(false);
    });
    it('only an account listed in academic_reviewers can record academic decisions, and the list is not writable by students', () => {
      expect(exec(as('authenticated', A), `insert into academic_reviewers (user_id, display_name) values ('${A}', 'Me')`).ok).toBe(false);
      exec(as('postgres'), `insert into academic_reviewers (user_id, display_name) values ('${B}', 'Dr Rao') on conflict do nothing`);
      expect(exec(as('authenticated', B), review('academic_reviewer')).ok).toBe(true);
      exec(as('postgres'), `delete from academic_reviewers where user_id = '${B}'`);
    });
    it('reviews are private to their owner and cannot be deleted', () => {
      const id = newUuid();
      exec(as('authenticated', A), `insert into content_reviews (id, record_kind, record_id, decision, reviewer_name, reviewer_role, content_hash, reviewed_at) values ('${id}', 'video', '${newUuid()}', 'comment', 'S', 'student', 'h', now())`);
      expect(select(as('authenticated', B), 'select id from content_reviews')).toHaveLength(0);
      expect(exec(as('authenticated', A), `delete from content_reviews where id = '${id}'`).ok).toBe(false);
    });
  });

  it('updated_at moves forward on every update', () => {
    const id = newUuid();
    exec(as('authenticated', A), mistake(id));
    const t0 = select(as('postgres'), `select updated_at from mistake_entries where id='${id}'`)[0].updated_at as string;
    exec(as('authenticated', A), `update mistake_entries set student_note='n' where id='${id}'`);
    const t1 = select(as('postgres'), `select updated_at from mistake_entries where id='${id}'`)[0].updated_at as string;
    expect(new Date(t1).getTime()).toBeGreaterThan(new Date(t0).getTime());
    void sqlStr; void GRAV;
  });
});
