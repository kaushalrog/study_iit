-- Remotely published academic content ("content packs"). The app reads packs and applies them with its normal importer,
-- so adding lessons, questions, videos or a roadmap needs no new APK. Mirrors nothing on the device: packs are read-only there.
-- Who may publish: only accounts listed in content_publishers (edit that table with SQL; the app cannot).
create table content_publishers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);
alter table content_publishers enable row level security;
create policy content_publishers_self on content_publishers for select to authenticated using (user_id = auth.uid());
revoke all on content_publishers from anon;
revoke insert, update, delete, truncate on content_publishers from authenticated;
grant select on content_publishers to authenticated;

create table content_packs (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9:_-]{1,80}$'),         -- stable key, e.g. chapter:gravitation or roadmap
  kind text not null check (kind in ('bundle', 'roadmap')),
  version int not null check (version > 0),
  title text not null,
  payload jsonb not null,                                                    -- bundle JSON in the importer format, or a roadmap overlay
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),                    -- hash of the canonical JSON of payload; the app re-checks it
  retired jsonb not null default '[]',                                       -- older lesson texts this version replaces (withdrawn only if nobody confirmed them)
  min_app_version text,
  published_by uuid default auth.uid() references auth.users(id),
  published_at timestamptz not null default now(),
  deleted_at timestamptz,                                                    -- explicit withdrawal; devices keep their local copy
  updated_at timestamptz not null default now()
);
create index content_packs_updated_idx on content_packs (updated_at);

-- A new version must be higher than the one it replaces: versions only move forward.
create function content_packs_version_guard() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.version <= old.version and new.deleted_at is not distinct from old.deleted_at then
    raise exception 'content pack % must increase its version (current %)', old.id, old.version;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger content_packs_version_guard before insert or update on content_packs for each row execute function content_packs_version_guard();

alter table content_packs enable row level security;
create policy content_packs_read on content_packs for select to authenticated using (true);
create policy content_packs_publish_ins on content_packs for insert to authenticated with check (exists (select 1 from content_publishers p where p.user_id = auth.uid()));
create policy content_packs_publish_upd on content_packs for update to authenticated using (exists (select 1 from content_publishers p where p.user_id = auth.uid()))
  with check (exists (select 1 from content_publishers p where p.user_id = auth.uid()));
revoke all on content_packs from anon;
revoke delete, truncate on content_packs from authenticated;
grant select, insert, update on content_packs to authenticated;
