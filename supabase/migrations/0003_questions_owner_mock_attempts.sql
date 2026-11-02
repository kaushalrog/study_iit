alter table questions add column if not exists source_note text;

-- Student-entered answer keys belong to the student; shared-bank keys (owner_id null) stay unreadable by clients.
alter table question_solutions add column if not exists owner_id uuid default auth.uid() references auth.users(id);
create policy solutions_owner on question_solutions for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy solutions_no_self_verify on question_solutions as restrictive for insert to authenticated
  with check (verification_status in ('draft','extracted','needs_review','verified'));

create table mock_attempts (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  name text not null, config jsonb not null,
  started_at timestamptz not null, finished_at timestamptz not null,
  total_marks numeric not null, max_marks numeric not null,
  percentage numeric not null, accuracy numeric not null, attempt_rate numeric not null,
  negative_lost numeric not null default 0, duration_ms int not null default 0, result jsonb not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create index on mock_attempts(owner_id, finished_at);
alter table mock_attempts enable row level security;
create policy mock_attempts_owner on mock_attempts for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create trigger touch_mock_attempts before update on mock_attempts for each row execute function touch_updated_at();
