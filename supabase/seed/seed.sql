-- Shared reference rows. Run once with the service role (supabase db reset / psql). Safe to re-run.
-- Ids are deterministic (src/utils/ids.ts seedId) and MUST match the ids the app seeds locally,
-- otherwise synced rows that reference chapters fail their foreign key. tests/unit/seedsql.test.ts guards this.
insert into subjects (id, key, name, sort_order) values
  ('c4b28551-26dc-40f5-ab91-2dc3cfa90421', 'math', 'Mathematics', 1),
  ('d6332c6c-4141-4b78-a54f-276ef87147bc', 'physics', 'Physics', 2),
  ('cf3919b7-8614-435b-a7bc-12196e7e5a87', 'chemistry', 'Chemistry', 3)
on conflict (id) do nothing;

insert into chapters (id, subject_id, title, sort_order, verification_status) values
  ('e7b115cc-11a3-4430-aaaf-1c7e709f563c', 'c4b28551-26dc-40f5-ab91-2dc3cfa90421', 'Inverse Trigonometry', 1, 'verified'),
  ('7da621cc-52fe-4788-aa0c-a4ca207860bc', 'c4b28551-26dc-40f5-ab91-2dc3cfa90421', 'Binomial Theorem', 2, 'verified'),
  ('ae7ceb30-65b2-4f84-a8c6-147af8e32900', 'd6332c6c-4141-4b78-a54f-276ef87147bc', 'Gravitation', 1, 'verified'),
  ('9e9c43f7-e5ec-4763-aa62-3bb57ea671c7', 'cf3919b7-8614-435b-a7bc-12196e7e5a87', 'Chemical Kinetics', 1, 'verified')
on conflict (id) do nothing;

