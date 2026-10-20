-- Aport — shared table for both phones (you + wife). Run once in Supabase → SQL Editor → New query → Run.
-- Safe to run again.
--
-- Everything the app stores (exercise progress, sessions, tasks, ticks, journal, settings) is one row here;
-- "kind" says what it is and "data" holds its fields. Each phone keeps its own copy (works without signal)
-- and syncs this table. Unlike the fitness app, rows are SHARED: every logged-in account in this Supabase
-- project sees the same dog. Keep sign-ups disabled so only your two accounts exist.

create table if not exists dog_records (
  id text primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete set null,  -- who created the row
  kind text not null,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now(),   -- when it was changed (set by the phone)
  deleted boolean not null default false,
  synced_at timestamptz not null default now()     -- when the server received it (used to fetch changes)
);

create index if not exists dog_records_synced on dog_records (synced_at, id);

-- An older edit never overwrites a newer one: the server keeps the later updated_at and bumps synced_at,
-- so the phone that sent the old version downloads the newer one.
create or replace function dog_records_touch() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' then
    new.user_id := old.user_id;
    if new.updated_at < old.updated_at then
      new.kind := old.kind;
      new.data := old.data;
      new.updated_at := old.updated_at;
      new.deleted := old.deleted;
    end if;
  end if;
  new.synced_at := clock_timestamp();
  return new;
end $$;

drop trigger if exists dog_records_touch on dog_records;
create trigger dog_records_touch before insert or update on dog_records
  for each row execute function dog_records_touch();

-- Shared household data: any logged-in account of this project can read and write.
alter table dog_records enable row level security;
drop policy if exists "household" on dog_records;
create policy "household" on dog_records for all to authenticated using (true) with check (true);

grant select, insert, update, delete on dog_records to authenticated;
grant all on dog_records to service_role;
