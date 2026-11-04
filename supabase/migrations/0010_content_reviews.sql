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
