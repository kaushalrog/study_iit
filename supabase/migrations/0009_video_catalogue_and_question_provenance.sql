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
