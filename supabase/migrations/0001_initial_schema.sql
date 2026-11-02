-- ORBIT initial schema. Mirrors src/database/migrations (SQLite). Student-owned rows are RLS-protected.
create extension if not exists "pgcrypto";

create type verification_status as enum ('draft','extracted','needs_review','verified','published','archived');

-- Ownership helper: every student-owned row carries owner_id = auth.uid().
create table profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  display_name text not null,
  class_level int not null,
  academic_year text not null,
  board text, institution text, programme text,
  preferred_language text not null default 'en' check (preferred_language in ('en','te')),
  weekday_study_minutes int not null default 120,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  unique (owner_id)
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('math','physics','chemistry')),
  name text not null, sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table content_sources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid() references auth.users(id),
  title text not null,
  source_type text not null check (source_type in ('coaching_notes','textbook','reference_book','question_paper','answer_key','original','ai_generated','student')),
  location text, imported_at timestamptz, reviewer text,
  verification_status verification_status not null default 'draft',
  content_version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id),
  title text not null, sort_order int not null default 0,
  source_id uuid references content_sources(id),
  verification_status verification_status not null default 'draft',
  content_version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table topics (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid() references auth.users(id),
  chapter_id uuid not null references chapters(id),
  parent_topic_id uuid references topics(id),
  title text not null, sort_order int not null default 0,
  status text not null default 'not_started'
    check (status in ('not_started','learning','learning_completed','practising','needs_revision','mastered')),
  source_id uuid references content_sources(id),
  verification_status verification_status not null default 'draft',
  content_version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table learning_content (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id), topic_id uuid references topics(id),
  section text not null, language text not null default 'en' check (language in ('en','te')),
  level text not null default 'main' check (level in ('foundation','main','advanced')),
  body text not null, sort_order int not null default 0,
  source_id uuid references content_sources(id),
  verification_status verification_status not null default 'draft',
  content_version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table formulas (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id), topic_id uuid references topics(id),
  name text not null, latex text not null, variables jsonb not null default '[]',
  units text, conditions text, explanation text, example text,
  source_id uuid references content_sources(id),
  verification_status verification_status not null default 'draft',
  content_version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table questions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid() references auth.users(id),
  chapter_id uuid not null references chapters(id), topic_id uuid references topics(id),
  type text not null check (type in ('single','multi','integer','matching','assertion_reason')),
  stem text not null, options jsonb, image_path text,
  difficulty text not null default 'main' check (difficulty in ('foundation','main','advanced')),
  origin text not null default 'student' check (origin in ('official','coaching','generated','student')),
  generation jsonb,
  source_id uuid references content_sources(id),
  verification_status verification_status not null default 'draft',
  content_version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
-- Answer keys are separate and only reachable through the service-role edge function / verified-published view.
create table question_solutions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references questions(id) on delete cascade,
  answer jsonb not null, explanation text, hint text,
  source_id uuid references content_sources(id),
  verification_status verification_status not null default 'draft',
  content_version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table exam_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  name text not null, style text not null check (style in ('main','advanced')),
  duration_minutes int, negative_marking_enabled boolean not null default true,
  source_note text, verification_status verification_status not null default 'needs_review',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table exam_sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references exam_templates(id) on delete cascade,
  section_key text not null, name text not null, subject_key text not null, question_type text not null,
  question_count int not null check (question_count > 0), attempt_limit int, sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (template_id, section_key)
);
create table scoring_rules (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null unique references exam_sections(id) on delete cascade,
  correct numeric not null check (correct >= 0),
  incorrect numeric not null check (incorrect <= 0),
  unanswered numeric not null default 0,
  partial_per_correct_option numeric,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table exams (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  template_id uuid references exam_templates(id),
  name text not null, style text not null check (style in ('main','advanced')),
  exam_date date not null, syllabus jsonb not null default '[]',
  status text not null default 'scheduled' check (status in ('scheduled','in_progress','completed')),
  entry_mode text not null default 'engine' check (entry_mode in ('engine','manual')),
  started_at timestamptz, finished_at timestamptz, total_score numeric, max_score numeric,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table exam_subject_results (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  exam_id uuid not null references exams(id) on delete cascade,
  subject_key text not null, marks numeric not null, max_marks numeric not null,
  correct int, incorrect int, unanswered int, negative_lost numeric,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (exam_id, subject_key)
);
create table question_attempts (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  question_id uuid references questions(id), exam_id uuid references exams(id),
  kind text not null default 'practice' check (kind in ('concept_check','practice','revision','exam')),
  selected jsonb, numeric_answer numeric,
  outcome text not null check (outcome in ('correct','partial','incorrect','unanswered')),
  marks numeric not null default 0, time_ms int not null default 0,
  hint_used boolean not null default false, marked_for_review boolean not null default false,
  attempted_at timestamptz not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table study_tasks (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  plan_date date not null, slot text not null, title text not null, detail text,
  subject_key text, chapter_id uuid, topic_id uuid, planned_minutes int not null,
  status text not null default 'pending' check (status in ('pending','done','skipped','rescheduled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  unique (owner_id, plan_date, slot)
);
create table study_sessions (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  task_id uuid references study_tasks(id), subject_key text, chapter_id uuid,
  started_at timestamptz not null, ended_at timestamptz, actual_minutes int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table mistake_entries (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  subject_key text not null, chapter_id uuid references chapters(id), topic_id uuid references topics(id), question_id uuid references questions(id),
  question_text text not null, image_path text,
  my_answer text, correct_answer text, official_explanation text, working_steps text, student_note text,
  category text not null check (category in ('conceptual','approach','calculation','formula_misuse','careless','time_management','misread')),
  ocr_confirmed boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table revision_schedule (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  mistake_id uuid not null unique references mistake_entries(id) on delete cascade,
  stage int not null default 0, interval_days int not null default 1, consecutive_wrong int not null default 0,
  due_on date not null, last_reviewed_at timestamptz, review_concept boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table topic_mastery (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  topic_id uuid references topics(id), chapter_id uuid not null references chapters(id),
  score numeric, confidence text, evidence_count int not null default 0, weakest_component text, last_assessed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  unique (owner_id, chapter_id, topic_id)
);
create table ai_conversations (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  chapter_id uuid references chapters(id), topic_id uuid references topics(id), title text, language text not null default 'en',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table ai_messages (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')), body text not null, meta jsonb,
  saved_to_notes boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table notes (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  chapter_id uuid references chapters(id), topic_id uuid references topics(id),
  title text, body text not null, source text not null default 'student',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);

create index on chapters(subject_id);
create index on topics(chapter_id);
create index on learning_content(chapter_id, topic_id);
create index on formulas(chapter_id);
create index on questions(chapter_id, difficulty);
create index on question_attempts(owner_id, attempted_at);
create index on question_attempts(question_id);
create index on study_tasks(owner_id, plan_date);
create index on mistake_entries(owner_id, chapter_id);
create index on revision_schedule(owner_id, due_on);
create index on ai_messages(conversation_id);

-- Keep updated_at honest and make sync conflict detection possible (server wins only if strictly newer).
create function touch_updated_at() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.updated_at is not distinct from old.updated_at then new.updated_at = now(); end if;
  return new;
end $$;
do $$ declare t text; begin
  foreach t in array array['profiles','subjects','chapters','topics','learning_content','formulas','questions','question_solutions',
    'exam_templates','exam_sections','scoring_rules','exams','exam_subject_results','question_attempts','study_tasks','study_sessions',
    'mistake_entries','revision_schedule','topic_mastery','ai_conversations','ai_messages','notes','content_sources'] loop
    execute format('create trigger %I before update on %I for each row execute function touch_updated_at()', 'touch_'||t, t);
  end loop;
end $$;
