import type { SqlDb } from '../sqlite/types';

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

const meta = `
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at TEXT`;

const content = `
  source_id TEXT REFERENCES content_sources(id),
  verification_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (verification_status IN ('draft','extracted','needs_review','verified','published','archived')),
  content_version INTEGER NOT NULL DEFAULT 1`;

/**
 * Append-only list. Never edit a shipped migration; add a new one.
 * Mirrors supabase/migrations (same table and column names).
 */
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    sql: `
CREATE TABLE profiles (${meta},
  display_name TEXT NOT NULL,
  class_level INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  board TEXT, institution TEXT, programme TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','te')),
  weekday_study_minutes INTEGER NOT NULL DEFAULT 120
);
CREATE TABLE subjects (${meta},
  key TEXT NOT NULL UNIQUE CHECK (key IN ('math','physics','chemistry')),
  name TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE content_sources (${meta},
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('coaching_notes','textbook','reference_book','question_paper','answer_key','original','ai_generated','student')),
  location TEXT, imported_at TEXT, reviewer TEXT,
  verification_status TEXT NOT NULL DEFAULT 'draft',
  content_version INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE chapters (${meta},
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  title TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0,
  ${content}
);
CREATE TABLE topics (${meta},
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  parent_topic_id TEXT REFERENCES topics(id),
  title TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started','learning','learning_completed','practising','needs_revision','mastered')),
  ${content}
);
CREATE TABLE learning_content (${meta},
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  topic_id TEXT REFERENCES topics(id),
  section TEXT NOT NULL CHECK (section IN ('introduction','why_it_matters','explanation','derivation','example','common_mistakes','tips','summary','mini_assessment')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en','te')),
  level TEXT NOT NULL DEFAULT 'main' CHECK (level IN ('foundation','main','advanced')),
  body TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0,
  ${content}
);
CREATE TABLE formulas (${meta},
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  topic_id TEXT REFERENCES topics(id),
  name TEXT NOT NULL, latex TEXT NOT NULL,
  variables_json TEXT NOT NULL DEFAULT '[]', units TEXT, conditions TEXT, explanation TEXT, example TEXT,
  ${content}
);
CREATE TABLE questions (${meta},
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  topic_id TEXT REFERENCES topics(id),
  type TEXT NOT NULL CHECK (type IN ('single','multi','integer','matching','assertion_reason')),
  stem TEXT NOT NULL, options_json TEXT, image_uri TEXT,
  difficulty TEXT NOT NULL DEFAULT 'main' CHECK (difficulty IN ('foundation','main','advanced')),
  origin TEXT NOT NULL DEFAULT 'student' CHECK (origin IN ('official','coaching','generated','student')),
  generation_json TEXT,
  ${content}
);
-- Answers live apart from questions so ordinary list queries never carry the key.
CREATE TABLE question_solutions (${meta},
  question_id TEXT NOT NULL UNIQUE REFERENCES questions(id),
  answer_json TEXT NOT NULL, explanation TEXT, hint TEXT,
  ${content}
);
CREATE TABLE exam_templates (${meta},
  name TEXT NOT NULL,
  style TEXT NOT NULL CHECK (style IN ('main','advanced')),
  duration_minutes INTEGER,
  negative_marking_enabled INTEGER NOT NULL DEFAULT 1,
  source_note TEXT,
  verification_status TEXT NOT NULL DEFAULT 'needs_review'
);
CREATE TABLE exam_sections (${meta},
  template_id TEXT NOT NULL REFERENCES exam_templates(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL, name TEXT NOT NULL,
  subject_key TEXT NOT NULL, question_type TEXT NOT NULL,
  question_count INTEGER NOT NULL CHECK (question_count > 0),
  attempt_limit INTEGER, sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (template_id, section_key)
);
CREATE TABLE scoring_rules (${meta},
  section_id TEXT NOT NULL UNIQUE REFERENCES exam_sections(id) ON DELETE CASCADE,
  correct REAL NOT NULL CHECK (correct >= 0),
  incorrect REAL NOT NULL CHECK (incorrect <= 0),
  unanswered REAL NOT NULL DEFAULT 0,
  partial_per_correct_option REAL
);
CREATE TABLE exams (${meta},
  template_id TEXT REFERENCES exam_templates(id),
  name TEXT NOT NULL,
  style TEXT NOT NULL CHECK (style IN ('main','advanced')),
  exam_date TEXT NOT NULL,
  syllabus_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed')),
  entry_mode TEXT NOT NULL DEFAULT 'engine' CHECK (entry_mode IN ('engine','manual')),
  started_at TEXT, finished_at TEXT,
  total_score REAL, max_score REAL,
  session_state_json TEXT
);
CREATE TABLE exam_subject_results (${meta},
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_key TEXT NOT NULL,
  marks REAL NOT NULL, max_marks REAL NOT NULL,
  correct INTEGER, incorrect INTEGER, unanswered INTEGER, negative_lost REAL,
  UNIQUE (exam_id, subject_key)
);
CREATE TABLE question_attempts (${meta},
  question_id TEXT REFERENCES questions(id),
  exam_id TEXT REFERENCES exams(id),
  kind TEXT NOT NULL DEFAULT 'practice' CHECK (kind IN ('concept_check','practice','revision','exam')),
  selected_json TEXT, numeric_answer REAL,
  outcome TEXT NOT NULL CHECK (outcome IN ('correct','partial','incorrect','unanswered')),
  marks REAL NOT NULL DEFAULT 0,
  time_ms INTEGER NOT NULL DEFAULT 0,
  hint_used INTEGER NOT NULL DEFAULT 0,
  marked_for_review INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL
);
CREATE TABLE study_tasks (${meta},
  plan_date TEXT NOT NULL,
  slot TEXT NOT NULL, title TEXT NOT NULL, detail TEXT,
  subject_key TEXT, chapter_id TEXT, topic_id TEXT,
  planned_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','skipped','rescheduled')),
  completed_at TEXT,
  UNIQUE (plan_date, slot)
);
CREATE TABLE study_sessions (${meta},
  task_id TEXT REFERENCES study_tasks(id),
  subject_key TEXT, chapter_id TEXT,
  started_at TEXT NOT NULL, ended_at TEXT,
  actual_minutes INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE mistake_entries (${meta},
  subject_key TEXT NOT NULL,
  chapter_id TEXT REFERENCES chapters(id),
  topic_id TEXT REFERENCES topics(id),
  question_id TEXT REFERENCES questions(id),
  question_text TEXT NOT NULL, image_uri TEXT,
  my_answer TEXT, correct_answer TEXT, official_explanation TEXT, working_steps TEXT, student_note TEXT,
  category TEXT NOT NULL CHECK (category IN ('conceptual','approach','calculation','formula_misuse','careless','time_management','misread')),
  ocr_confirmed INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE revision_schedule (${meta},
  mistake_id TEXT NOT NULL UNIQUE REFERENCES mistake_entries(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL DEFAULT 0,
  interval_days INTEGER NOT NULL DEFAULT 1,
  consecutive_wrong INTEGER NOT NULL DEFAULT 0,
  due_on TEXT NOT NULL,
  last_reviewed_at TEXT,
  review_concept INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE topic_mastery (${meta},
  topic_id TEXT REFERENCES topics(id),
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  score REAL, confidence TEXT, evidence_count INTEGER NOT NULL DEFAULT 0,
  weakest_component TEXT, last_assessed_at TEXT,
  UNIQUE (chapter_id, topic_id)
);
CREATE TABLE ai_conversations (${meta},
  chapter_id TEXT REFERENCES chapters(id), topic_id TEXT REFERENCES topics(id),
  title TEXT, language TEXT NOT NULL DEFAULT 'en'
);
CREATE TABLE ai_messages (${meta},
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  body TEXT NOT NULL,
  meta_json TEXT,
  saved_to_notes INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE notes (${meta},
  chapter_id TEXT REFERENCES chapters(id), topic_id TEXT REFERENCES topics(id),
  title TEXT, body TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'student'
);
CREATE TABLE sync_outbox (
  id TEXT PRIMARY KEY NOT NULL,
  table_name TEXT NOT NULL, row_id TEXT NOT NULL,
  op TEXT NOT NULL CHECK (op IN ('upsert','delete')),
  payload_json TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT, next_attempt_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (table_name, row_id, op, payload_json)
);
CREATE TABLE app_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);

CREATE INDEX idx_chapters_subject ON chapters(subject_id);
CREATE INDEX idx_topics_chapter ON topics(chapter_id);
CREATE INDEX idx_content_chapter ON learning_content(chapter_id, topic_id);
CREATE INDEX idx_formulas_chapter ON formulas(chapter_id);
CREATE INDEX idx_questions_chapter ON questions(chapter_id, difficulty);
CREATE INDEX idx_attempts_question ON question_attempts(question_id);
CREATE INDEX idx_attempts_exam ON question_attempts(exam_id);
CREATE INDEX idx_attempts_time ON question_attempts(attempted_at);
CREATE INDEX idx_tasks_date ON study_tasks(plan_date);
CREATE INDEX idx_mistakes_chapter ON mistake_entries(chapter_id);
CREATE INDEX idx_revision_due ON revision_schedule(due_on);
CREATE INDEX idx_outbox_next ON sync_outbox(next_attempt_at);
`,
  },
  {
    version: 2,
    name: 'question_source_and_mock_attempts',
    sql: `
ALTER TABLE questions ADD COLUMN source_note TEXT;
CREATE TABLE mock_attempts (${meta},
  name TEXT NOT NULL,
  config_json TEXT NOT NULL,
  started_at TEXT NOT NULL, finished_at TEXT NOT NULL,
  total_marks REAL NOT NULL, max_marks REAL NOT NULL,
  percentage REAL NOT NULL, accuracy REAL NOT NULL, attempt_rate REAL NOT NULL,
  negative_lost REAL NOT NULL DEFAULT 0, duration_ms INTEGER NOT NULL DEFAULT 0,
  result_json TEXT NOT NULL
);
CREATE INDEX idx_mock_finished ON mock_attempts(finished_at);
`,
  },
  {
    version: 3,
    name: 'sync_conflicts',
    sql: `
-- When a remote edit wins over an unsynced local edit, the losing local version is kept here so nothing is silently lost.
CREATE TABLE sync_conflicts (
  id TEXT PRIMARY KEY NOT NULL,
  table_name TEXT NOT NULL, row_id TEXT NOT NULL,
  local_payload_json TEXT NOT NULL, remote_payload_json TEXT NOT NULL,
  resolution TEXT NOT NULL CHECK (resolution IN ('remote_won','local_won')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_conflicts_row ON sync_conflicts(table_name, row_id);
`,
  },
  {
    version: 4,
    name: 'student_authored_content',
    sql: `
-- Lessons and formulas can now be written by the student, so they carry their own source note and sync like other student data.
ALTER TABLE learning_content ADD COLUMN source_note TEXT;
ALTER TABLE formulas ADD COLUMN source_note TEXT;
CREATE INDEX idx_topics_title ON topics(chapter_id, title);
`,
  },
  {
    version: 5,
    name: 'persistent_daily_plan',
    sql: `
-- A day's plan is stored once so it does not change under the student, and so it can be ticked off, timed and synced.
ALTER TABLE study_tasks ADD COLUMN start_time TEXT;
ALTER TABLE study_tasks ADD COLUMN end_time TEXT;
ALTER TABLE study_tasks ADD COLUMN difficulty TEXT;
ALTER TABLE study_tasks ADD COLUMN external INTEGER NOT NULL DEFAULT 0;
ALTER TABLE study_tasks ADD COLUMN needs_setup TEXT;
CREATE INDEX idx_sessions_task ON study_sessions(task_id);
`,
  },
  {
    version: 6,
    name: 'video_catalogue_and_question_provenance',
    sql: `
-- Curated lessons live in their own table (never hard-coded in screens). A video is only 'verified' after a person has opened it.
CREATE TABLE video_resources (${meta},
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  topic_id TEXT REFERENCES topics(id),
  kind TEXT NOT NULL CHECK (kind IN ('video','playlist')),
  youtube_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL, channel TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en','te','hi')),
  purpose TEXT NOT NULL CHECK (purpose IN ('concept','classroom','examples','main','advanced','revision')),
  level TEXT NOT NULL DEFAULT 'main' CHECK (level IN ('foundation','main','advanced')),
  duration_seconds INTEGER,
  why TEXT,
  link_checked_at TEXT,
  source_note TEXT,
  watched_at TEXT,
  saved INTEGER NOT NULL DEFAULT 0,
  personal_note TEXT,
  ${content}
);
CREATE INDEX idx_videos_chapter ON video_resources(chapter_id, topic_id);
CREATE INDEX idx_videos_youtube ON video_resources(youtube_id);

-- Where a question really came from. A question counts as a previous-year question only with exam, year and a citation.
ALTER TABLE questions ADD COLUMN exam_category TEXT CHECK (exam_category IN ('jee_main','jee_advanced','other_official'));
ALTER TABLE questions ADD COLUMN exam_year INTEGER;
ALTER TABLE questions ADD COLUMN exam_session TEXT;
ALTER TABLE questions ADD COLUMN citation TEXT;
ALTER TABLE questions ADD COLUMN citation_url TEXT;
ALTER TABLE questions ADD COLUMN license TEXT NOT NULL DEFAULT 'unknown' CHECK (license IN ('open','permission','personal_use','unknown'));
CREATE INDEX idx_questions_exam ON questions(exam_category, exam_year);
`,
  },
];

export async function migrate(db: SqlDb): Promise<number> {
  await db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)`);
  const row = await db.first<{ v: number | null }>('SELECT MAX(version) AS v FROM schema_migrations');
  const current = row?.v ?? 0;
  for (const m of MIGRATIONS.filter((x) => x.version > current).sort((a, b) => a.version - b.version)) {
    await db.tx(async () => {
      await db.exec(m.sql);
      await db.run('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)', [m.version, m.name, new Date().toISOString()]);
    });
  }
  return MIGRATIONS[MIGRATIONS.length - 1].version;
}
