-- Found by tests/live/sync.live.test.ts "schema contract": the app writes `deleted_at` on every table,
-- but these server tables lacked it, so every upload of them was rejected.
alter table exam_templates       add column if not exists deleted_at timestamptz;
alter table exam_sections        add column if not exists deleted_at timestamptz;
alter table scoring_rules        add column if not exists deleted_at timestamptz;
alter table question_solutions   add column if not exists deleted_at timestamptz;
alter table exam_subject_results add column if not exists deleted_at timestamptz;
