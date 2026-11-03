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
