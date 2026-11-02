-- Students confirm their own answer keys, so they may save questions as 'verified' (never 'published',
-- which stays admin-only), but a generated (AI) question can never be marked verified by the client.
drop policy if exists questions_no_self_verify on questions;
drop policy if exists questions_no_self_verify_upd on questions;
create policy questions_self_verify_ins on questions as restrictive for insert to authenticated
  with check (verification_status in ('draft','extracted','needs_review','verified')
              and not (origin = 'generated' and verification_status = 'verified'));
create policy questions_self_verify_upd on questions as restrictive for update to authenticated
  with check (verification_status in ('draft','extracted','needs_review','verified')
              and not (origin = 'generated' and verification_status = 'verified'));

drop policy if exists solutions_no_self_verify on question_solutions;
create policy solutions_self_verify on question_solutions as restrictive for insert to authenticated
  with check (verification_status in ('draft','extracted','needs_review','verified'));

-- The sync engine pulls with `updated_at >= cursor ORDER BY updated_at`; index it on every synced table.
do $$ declare t text; begin
  foreach t in array array['profiles','exam_templates','exams','topics','questions','question_solutions','exam_subject_results','question_attempts',
    'mock_attempts','study_tasks','study_sessions','mistake_entries','revision_schedule','topic_mastery','ai_conversations','ai_messages','notes'] loop
    execute format('create index if not exists %I on %I (owner_id, updated_at)', t||'_owner_updated_idx', t);
  end loop;
end $$;
