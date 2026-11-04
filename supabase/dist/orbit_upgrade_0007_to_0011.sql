-- ORBIT: upgrade an EXISTING Supabase project from migration 0006 to 0011.
-- Paste into Supabase > SQL Editor and run ONCE. (A fresh project should use orbit_setup.sql instead.)
-- Safe to run only if the project already has migrations 0001-0006.

-- ===== 0007_student_authored_content.sql =====
-- Students can write their own lessons and formulas (from their books), and these sync between their devices.
-- Shared rows (owner_id null) stay read-only; a student can never publish, only save as draft / needs_review / verified.
alter table learning_content add column if not exists owner_id uuid default auth.uid() references auth.users(id);
alter table learning_content add column if not exists deleted_at timestamptz;
alter table learning_content add column if not exists source_note text;
alter table formulas add column if not exists owner_id uuid default auth.uid() references auth.users(id);
alter table formulas add column if not exists deleted_at timestamptz;
alter table formulas add column if not exists source_note text;

drop policy if exists learning_read on learning_content;
drop policy if exists formulas_read on formulas;
create policy learning_read on learning_content for select to authenticated
  using ((owner_id is null and verification_status in ('verified','published')) or owner_id = auth.uid());
create policy formulas_read on formulas for select to authenticated
  using ((owner_id is null and verification_status in ('verified','published')) or owner_id = auth.uid());

create policy learning_owner_write on learning_content for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and verification_status in ('draft','extracted','needs_review','verified'));
create policy formulas_owner_write on formulas for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and verification_status in ('draft','extracted','needs_review','verified'));

-- Migration 0005 removed write privileges from these two tables; restore them (RLS above decides which rows).
grant insert, update, delete on learning_content, formulas to authenticated;

create index if not exists learning_content_owner_updated_idx on learning_content (owner_id, updated_at);
create index if not exists formulas_owner_updated_idx on formulas (owner_id, updated_at);

-- ===== 0008_persistent_daily_plan.sql =====
-- Daily plan tasks are stored (one row per day and slot) so they can be completed, timed and synced.
alter table study_tasks add column if not exists start_time text;
alter table study_tasks add column if not exists end_time text;
alter table study_tasks add column if not exists difficulty text;
alter table study_tasks add column if not exists external boolean not null default false;
alter table study_tasks add column if not exists needs_setup text;
create index if not exists study_sessions_task_idx on study_sessions (task_id);

-- ===== 0009_video_catalogue_and_question_provenance.sql =====
-- Curated video lessons and honest question provenance. Mirrors device migration v6.
create table video_resources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid() references auth.users(id),
  chapter_id uuid not null references chapters(id), topic_id uuid references topics(id),
  kind text not null check (kind in ('video','playlist')),
  youtube_id text not null, url text not null,
  title text not null, channel text not null,
  language text not null default 'en' check (language in ('en','te','hi')),
  purpose text not null check (purpose in ('concept','classroom','examples','main','advanced','revision')),
  level text not null default 'main' check (level in ('foundation','main','advanced')),
  duration_seconds int, why text, link_checked_at timestamptz, source_note text,
  watched_at timestamptz, saved boolean not null default false, personal_note text,
  source_id uuid references content_sources(id),
  verification_status verification_status not null default 'draft',
  content_version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create index video_resources_chapter_idx on video_resources (chapter_id, topic_id);
create index video_resources_owner_updated_idx on video_resources (owner_id, updated_at);
create trigger touch_video_resources before update on video_resources for each row execute function touch_updated_at();

alter table video_resources enable row level security;
create policy video_resources_read on video_resources for select to authenticated using (owner_id = auth.uid());
-- A student may save a video as draft / needs_review / verified (her own statement that she opened it), never 'published'.
create policy video_resources_owner_write on video_resources for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and verification_status in ('draft','extracted','needs_review','verified'));
revoke all on video_resources from anon;
revoke truncate on video_resources from authenticated;
grant select, insert, update, delete on video_resources to authenticated;

alter table questions add column if not exists exam_category text check (exam_category in ('jee_main','jee_advanced','other_official'));
alter table questions add column if not exists exam_year int;
alter table questions add column if not exists exam_session text;
alter table questions add column if not exists citation text;
alter table questions add column if not exists citation_url text;
alter table questions add column if not exists license text not null default 'unknown' check (license in ('open','permission','personal_use','unknown'));
create index if not exists questions_exam_idx on questions (exam_category, exam_year);

-- ===== 0010_content_reviews.sql =====
-- Review history for academic content. Mirrors device migration v7.
-- Who may approve: only accounts listed in academic_reviewers (managed with the service role / SQL editor, never by the app).
create table academic_reviewers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);
alter table academic_reviewers enable row level security;
create policy academic_reviewers_self on academic_reviewers for select to authenticated using (user_id = auth.uid());
revoke all on academic_reviewers from anon;
revoke insert, update, delete, truncate on academic_reviewers from authenticated;
grant select on academic_reviewers to authenticated;

create table content_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid() references auth.users(id),
  record_kind text not null check (record_kind in ('lesson','formula','question','video')),
  record_id uuid not null,
  chapter_id uuid references chapters(id),
  decision text not null check (decision in ('approved','rejected','needs_research','edited','comment')),
  reviewer_name text not null,
  reviewer_role text not null check (reviewer_role in ('academic_reviewer','student','automated','ai_assistant')),
  checks jsonb not null default '{}',
  feedback text, evidence text,
  content_hash text not null,
  reviewed_at timestamptz not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create index content_reviews_record_idx on content_reviews (record_kind, record_id, reviewed_at);
create index content_reviews_owner_updated_idx on content_reviews (owner_id, updated_at);
create trigger touch_content_reviews before update on content_reviews for each row execute function touch_updated_at();

alter table content_reviews enable row level security;
create policy content_reviews_read on content_reviews for select to authenticated using (owner_id = auth.uid());
create policy content_reviews_insert on content_reviews for insert to authenticated with check (owner_id = auth.uid());
create policy content_reviews_update on content_reviews for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
-- A student account can never record an academic reviewer's decision. The role is only accepted from a listed reviewer.
create policy content_reviews_reviewer_only on content_reviews as restrictive for insert to authenticated
  with check (reviewer_role <> 'academic_reviewer' or exists (select 1 from academic_reviewers r where r.user_id = auth.uid()));
create policy content_reviews_reviewer_only_upd on content_reviews as restrictive for update to authenticated
  with check (reviewer_role <> 'academic_reviewer' or exists (select 1 from academic_reviewers r where r.user_id = auth.uid()));
revoke all on content_reviews from anon;
revoke truncate, delete on content_reviews from authenticated;
grant select, insert, update on content_reviews to authenticated;

-- ===== 0011_content_packs.sql =====
-- Remotely published academic content ("content packs"). The app reads packs and applies them with its normal importer,
-- so adding lessons, questions, videos or a roadmap needs no new APK. Mirrors nothing on the device: packs are read-only there.
-- Who may publish: only accounts listed in content_publishers (edit that table with SQL; the app cannot).
create table content_publishers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);
alter table content_publishers enable row level security;
create policy content_publishers_self on content_publishers for select to authenticated using (user_id = auth.uid());
revoke all on content_publishers from anon;
revoke insert, update, delete, truncate on content_publishers from authenticated;
grant select on content_publishers to authenticated;

create table content_packs (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9:_-]{1,80}$'),         -- stable key, e.g. chapter:gravitation or roadmap
  kind text not null check (kind in ('bundle', 'roadmap')),
  version int not null check (version > 0),
  title text not null,
  payload jsonb not null,                                                    -- bundle JSON in the importer format, or a roadmap overlay
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),                    -- hash of the canonical JSON of payload; the app re-checks it
  retired jsonb not null default '[]',                                       -- older lesson texts this version replaces (withdrawn only if nobody confirmed them)
  min_app_version text,
  published_by uuid default auth.uid() references auth.users(id),
  published_at timestamptz not null default now(),
  deleted_at timestamptz,                                                    -- explicit withdrawal; devices keep their local copy
  updated_at timestamptz not null default now()
);
create index content_packs_updated_idx on content_packs (updated_at);

-- A new version must be higher than the one it replaces: versions only move forward.
create function content_packs_version_guard() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.version <= old.version and new.deleted_at is not distinct from old.deleted_at then
    raise exception 'content pack % must increase its version (current %)', old.id, old.version;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger content_packs_version_guard before insert or update on content_packs for each row execute function content_packs_version_guard();

alter table content_packs enable row level security;
create policy content_packs_read on content_packs for select to authenticated using (true);
create policy content_packs_publish_ins on content_packs for insert to authenticated with check (exists (select 1 from content_publishers p where p.user_id = auth.uid()));
create policy content_packs_publish_upd on content_packs for update to authenticated using (exists (select 1 from content_publishers p where p.user_id = auth.uid()))
  with check (exists (select 1 from content_publishers p where p.user_id = auth.uid()));
revoke all on content_packs from anon;
revoke delete, truncate on content_packs from authenticated;
grant select, insert, update on content_packs to authenticated;

-- ===== make your publishing account a content publisher (edit the email) =====
-- Only accounts listed here can publish content packs. Use an account you control; it does not need to be the student's.
insert into content_publishers (user_id, display_name)
select id, 'Publisher' from auth.users where email = 'kaushalreddy15@gmail.com'
on conflict (user_id) do nothing;
