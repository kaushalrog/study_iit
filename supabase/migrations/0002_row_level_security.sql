-- Row Level Security. Default deny; anon gets nothing.
do $$ declare t text; begin
  foreach t in array array[
    'profiles','topics','questions','exam_templates','exams','exam_subject_results','question_attempts','study_tasks','study_sessions',
    'mistake_entries','revision_schedule','topic_mastery','ai_conversations','ai_messages','notes','content_sources'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid())', t||'_owner', t);
  end loop;
end $$;

-- Shared reference tables: readable by signed-in students, writable only via service role (no write policy).
alter table subjects enable row level security;
alter table chapters enable row level security;
alter table learning_content enable row level security;
alter table formulas enable row level security;
alter table exam_sections enable row level security;
alter table scoring_rules enable row level security;
alter table question_solutions enable row level security;
create policy subjects_read on subjects for select to authenticated using (true);
create policy chapters_read on chapters for select to authenticated using (true);
create policy learning_read on learning_content for select to authenticated
  using (verification_status in ('verified','published'));
create policy formulas_read on formulas for select to authenticated
  using (verification_status in ('verified','published'));
create policy sections_read on exam_sections for select to authenticated
  using (exists (select 1 from exam_templates t where t.id = template_id and t.owner_id = auth.uid()));
create policy sections_write on exam_sections for all to authenticated
  using (exists (select 1 from exam_templates t where t.id = template_id and t.owner_id = auth.uid()))
  with check (exists (select 1 from exam_templates t where t.id = template_id and t.owner_id = auth.uid()));
create policy rules_all on scoring_rules for all to authenticated
  using (exists (select 1 from exam_sections s join exam_templates t on t.id = s.template_id where s.id = section_id and t.owner_id = auth.uid()))
  with check (exists (select 1 from exam_sections s join exam_templates t on t.id = s.template_id where s.id = section_id and t.owner_id = auth.uid()));

-- question_solutions has NO policy for authenticated: answer keys are served only by edge functions
-- (service role) after an attempt is submitted, so list queries can never leak them.

-- Students may only insert questions as their own, never as verified/published.
create policy questions_no_self_verify on questions as restrictive for insert to authenticated
  with check (verification_status in ('draft','extracted','needs_review'));
create policy questions_no_self_verify_upd on questions as restrictive for update to authenticated
  with check (verification_status in ('draft','extracted','needs_review'));

revoke all on all tables in schema public from anon;

-- Verified/published questions form the shared bank; students always see their own as well.
create policy questions_read_verified on questions for select to authenticated
  using (verification_status in ('verified','published'));
