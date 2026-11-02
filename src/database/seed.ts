import { advancedSampleConfig, ADVANCED_SAMPLE_SOURCE, mainSetupConfig } from '../features/exam-engine/templates';
import { seedId } from '../utils/ids';
import type { SqlDb } from './sqlite/types';

/**
 * Initial records from the student brief. No questions, marks, mastery or past exams are invented.
 * Chapter subtopics are intentionally absent: they come from the student's own books via import.
 * All inserts are INSERT OR IGNORE keyed on deterministic ids, so seeding is idempotent.
 */
export const IDS = {
  profile: seedId('profile:mahitha'),
  subject: { math: seedId('subject:math'), physics: seedId('subject:physics'), chemistry: seedId('subject:chemistry') },
  chapter: {
    invTrig: seedId('chapter:inverse-trigonometry'),
    binomial: seedId('chapter:binomial-theorem'),
    gravitation: seedId('chapter:gravitation'),
    kinetics: seedId('chapter:chemical-kinetics'),
  },
  examMain: seedId('exam:main:2026-11-10'),
  examAdv: seedId('exam:advanced:2026-11-11'),
  tplMain: seedId('template:main'),
  tplAdv: seedId('template:advanced-sample'),
  source: seedId('source:brief'),
} as const;

export const SYLLABUS = [
  { id: IDS.chapter.invTrig, subject: 'math', title: 'Inverse Trigonometry', note: 'Complete chapter', order: 1 },
  { id: IDS.chapter.binomial, subject: 'math', title: 'Binomial Theorem', note: '', order: 2 },
  { id: IDS.chapter.gravitation, subject: 'physics', title: 'Gravitation', note: '', order: 1 },
  { id: IDS.chapter.kinetics, subject: 'chemistry', title: 'Chemical Kinetics', note: '', order: 1 },
] as const;

export async function seedInitialData(db: SqlDb): Promise<void> {
  const done = await db.first<{ value: string }>("SELECT value FROM app_meta WHERE key = 'seed_v1'");
  if (done) return;

  await db.tx(async () => {
    await db.run(
      `INSERT OR IGNORE INTO profiles (id, display_name, class_level, academic_year, board, institution, programme, preferred_language)
       VALUES (?, 'S. Mahitha', 9, '2026-2027', 'Andhra Pradesh SSC', 'Sri Chaitanya', 'IIT Premium League (IPL)', 'en')`,
      [IDS.profile],
    );
    const subjects: [keyof typeof IDS.subject, string, number][] = [['math', 'Mathematics', 1], ['physics', 'Physics', 2], ['chemistry', 'Chemistry', 3]];
    for (const [key, name, order] of subjects) {
      await db.run('INSERT OR IGNORE INTO subjects (id, key, name, sort_order) VALUES (?, ?, ?, ?)', [IDS.subject[key], key, name, order]);
    }
    await db.run(
      `INSERT OR IGNORE INTO content_sources (id, title, source_type, verification_status) VALUES (?, 'Student brief (syllabus portions)', 'student', 'verified')`,
      [IDS.source],
    );
    for (const c of SYLLABUS) {
      await db.run(
        `INSERT OR IGNORE INTO chapters (id, subject_id, title, sort_order, source_id, verification_status) VALUES (?, ?, ?, ?, ?, 'verified')`,
        [c.id, IDS.subject[c.subject], c.title, c.order, IDS.source],
      );
    }

    // Exam templates. Advanced comes from the supplied sample paper and stays "needs_review".
    const main = mainSetupConfig();
    await db.run(
      `INSERT OR IGNORE INTO exam_templates (id, name, style, duration_minutes, negative_marking_enabled, source_note, verification_status)
       VALUES (?, ?, 'main', NULL, 1, 'Pattern not supplied yet. Configure sections before taking a scored mock.', 'draft')`,
      [IDS.tplMain, main.name],
    );
    const adv = advancedSampleConfig();
    await db.run(
      `INSERT OR IGNORE INTO exam_templates (id, name, style, duration_minutes, negative_marking_enabled, source_note, verification_status)
       VALUES (?, ?, 'advanced', ?, 1, ?, 'needs_review')`,
      [IDS.tplAdv, adv.name, adv.durationMinutes, ADVANCED_SAMPLE_SOURCE],
    );
    for (const [i, s] of adv.sections.entries()) {
      const sid = seedId(`section:adv:${s.id}`);
      await db.run(
        `INSERT OR IGNORE INTO exam_sections (id, template_id, section_key, name, subject_key, question_type, question_count, attempt_limit, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sid, IDS.tplAdv, s.id, s.name, s.subject, s.questionType, s.questionCount, s.attemptLimit, i],
      );
      await db.run(
        `INSERT OR IGNORE INTO scoring_rules (id, section_id, correct, incorrect, unanswered, partial_per_correct_option) VALUES (?, ?, ?, ?, ?, ?)`,
        [seedId(`rule:adv:${s.id}`), sid, s.rule.correct, s.rule.incorrect, s.rule.unanswered, s.rule.partialPerCorrectOption],
      );
    }

    const syllabus = JSON.stringify(SYLLABUS.map((c) => ({ chapterId: c.id, title: c.title, subject: c.subject })));
    await db.run(
      `INSERT OR IGNORE INTO exams (id, template_id, name, style, exam_date, syllabus_json, status) VALUES (?, ?, 'Main-style exam', 'main', '2026-11-10', ?, 'scheduled')`,
      [IDS.examMain, IDS.tplMain, syllabus],
    );
    await db.run(
      `INSERT OR IGNORE INTO exams (id, template_id, name, style, exam_date, syllabus_json, status) VALUES (?, ?, 'Advanced-style exam', 'advanced', '2026-11-11', ?, 'scheduled')`,
      [IDS.examAdv, IDS.tplAdv, syllabus],
    );

    // Baseline kept as ranges, not as fabricated exam records.
    await db.run(
      `INSERT OR REPLACE INTO app_meta (key, value) VALUES ('baseline', ?)`,
      [JSON.stringify({ main: { low: 100, high: 150, outOf: 300 }, advanced: { low: 80, high: 100, outOf: 180 }, note: 'Self-reported average range, not individual exams.' })],
    );
    await db.run("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('seed_v1', ?)", [new Date().toISOString()]);
  });
}
