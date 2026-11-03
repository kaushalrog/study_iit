-- Daily plan tasks are stored (one row per day and slot) so they can be completed, timed and synced.
alter table study_tasks add column if not exists start_time text;
alter table study_tasks add column if not exists end_time text;
alter table study_tasks add column if not exists difficulty text;
alter table study_tasks add column if not exists external boolean not null default false;
alter table study_tasks add column if not exists needs_setup text;
create index if not exists study_sessions_task_idx on study_sessions (task_id);
