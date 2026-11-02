-- Hardening found by running the migrations against a real Postgres (tests/live/rls.test.ts).
-- Row-level security does NOT cover TRUNCATE, and Supabase's default privileges grant it to API roles, so revoke it explicitly.

-- 1. Signed-out visitors get nothing, including on tables created after migration 0002.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- 2. Signed-in students may read and write rows (RLS decides which), but never TRUNCATE or alter table-level behaviour.
revoke truncate, references, trigger on all tables in schema public from authenticated;
alter default privileges in schema public revoke truncate, references, trigger on tables from authenticated;

-- 3. Shared reference tables are read-only for students (no write policy existed, but remove the privilege too).
revoke insert, update, delete on subjects, chapters, learning_content, formulas from authenticated;

-- 4. The shared question bank is for questions with no owner. A student's own verified question must stay private to them.
drop policy if exists questions_read_verified on questions;
create policy questions_read_shared on questions for select to authenticated
  using (owner_id is null and verification_status in ('verified','published'));
