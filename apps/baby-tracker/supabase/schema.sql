-- =====================================================================
-- Бебешки дневник — схема на базата данни (Supabase / PostgreSQL 15+)
-- Baby tracker — database schema
--
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.
--
-- Design:
--   * children  — one row per child (newborn, toddler, ...)
--   * events    — one row per activity (feeding, sleep, diaper, health)
--   * v_events, v_daily_summary — read-only views for analysis/export
--   * Row Level Security: every row belongs to the signed-in user
--     (auth.uid()); nobody else can read or change it.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists public.children (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  birth_date  date,
  sex         text check (sex in ('m', 'f')),
  color       text not null default '#7c9cff' check (color ~ '^#[0-9a-fA-F]{6}$'),
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table  public.children            is 'Деца. One row per child.';
comment on column public.children.sex        is 'm = момче, f = момиче';

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  child_id     uuid not null references public.children (id) on delete cascade,

  -- What happened
  category     text not null check (category in ('feeding', 'sleep', 'diaper', 'health')),
  type         text not null,

  -- When (stored in UTC; views convert to Europe/Sofia)
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,           -- null = still running (timer) or instant event

  -- Measurements (meaning depends on type, see unit)
  amount       numeric(10, 2) check (amount is null or amount >= 0),
  unit         text check (unit in ('ml', 'g', 'kg', 'cm', 'C', 'mg', 'drops', 'pcs')),

  -- Type-specific details
  side         text check (side in ('left', 'right', 'both')),           -- breastfeeding / pumping
  milk_type    text check (milk_type in ('breast_milk', 'formula')),     -- bottle
  diaper_color text check (diaper_color in ('yellow', 'green', 'brown', 'black', 'red', 'other')),
  label        text check (char_length(label) <= 120),                   -- food / medicine / vaccine / symptom name
  note         text check (char_length(note) <= 1000),

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint events_end_after_start check (ended_at is null or ended_at >= started_at),
  constraint events_type_matches_category check (
       (category = 'feeding' and type in ('breast', 'bottle', 'solids', 'pumping'))
    or (category = 'sleep'   and type in ('nap', 'night'))
    or (category = 'diaper'  and type in ('wet', 'dirty', 'mixed', 'dry', 'potty_pee', 'potty_poo', 'accident'))
    or (category = 'health'  and type in ('weight', 'height', 'head', 'temperature', 'medicine', 'vaccine', 'symptom', 'doctor'))
  )
);

-- v2: dual breastfeeding timer (left/right seconds, which side is running).
-- "add column if not exists" makes this safe to re-run on an existing database.
alter table public.events add column if not exists left_sec        integer check (left_sec  >= 0);
alter table public.events add column if not exists right_sec       integer check (right_sec >= 0);
alter table public.events add column if not exists active_side     text check (active_side in ('left', 'right'));
alter table public.events add column if not exists side_started_at timestamptz;
alter table public.events add column if not exists last_side       text check (last_side in ('left', 'right'));

comment on column public.events.left_sec        is 'Breastfeeding: seconds on the left side (completed segments).';
comment on column public.events.right_sec       is 'Breastfeeding: seconds on the right side (completed segments).';
comment on column public.events.active_side     is 'Breastfeeding timer: side currently running (NULL = paused/finished).';
comment on column public.events.side_started_at is 'Breastfeeding timer: when the active side segment started.';
comment on column public.events.last_side       is 'Breastfeeding: side used last in this session.';

comment on table  public.events          is 'Активности: хранене, сън, пелени/гърне, здраве.';
comment on column public.events.type     is
  'feeding: breast|bottle|solids|pumping; sleep: nap|night; '
  'diaper: wet|dirty|mixed|dry|potty_pee|potty_poo|accident; '
  'health: weight|height|head|temperature|medicine|vaccine|symptom|doctor';
comment on column public.events.ended_at is 'NULL while a timer is running, or for instant events.';

create index if not exists events_user_child_time_idx
  on public.events (user_id, child_id, started_at desc);
create index if not exists events_running_idx
  on public.events (user_id) where ended_at is null and category in ('sleep', 'feeding');
create index if not exists children_user_idx on public.children (user_id);

-- ---------------------------------------------------------------------
-- Integrity: user_id cannot be spoofed, child must belong to same user
-- ---------------------------------------------------------------------

create or replace function public.tg_set_owner_and_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    -- Always the signed-in user, whatever the client sent.
    if auth.uid() is not null then
      new.user_id := auth.uid();
    end if;
  else
    new.user_id    := old.user_id;      -- ownership is immutable
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists children_owner on public.children;
create trigger children_owner before insert or update on public.children
  for each row execute function public.tg_set_owner_and_timestamps();

drop trigger if exists events_owner on public.events;
create trigger events_owner before insert or update on public.events
  for each row execute function public.tg_set_owner_and_timestamps();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.children enable row level security;
alter table public.children force  row level security;
alter table public.events   enable row level security;
alter table public.events   force  row level security;

-- Anonymous (not signed-in) visitors get nothing at all.
revoke all on public.children from anon;
revoke all on public.events   from anon;
grant select, insert, update, delete on public.children to authenticated;
grant select, insert, update, delete on public.events   to authenticated;

drop policy if exists children_owner_all on public.children;
create policy children_owner_all on public.children
  for all to authenticated
  using      (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists events_owner_all on public.events;
create policy events_owner_all on public.events
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.children c
      where c.id = child_id and c.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------
-- Analysis views (respect RLS via security_invoker)
-- Times are shown in Bulgarian local time (Europe/Sofia).
-- Views are dropped and re-created so new columns can be added on upgrade
-- (views hold no data — nothing is lost).
-- ---------------------------------------------------------------------

drop view if exists public.v_daily_summary;
drop view if exists public.v_events;

create view public.v_events
with (security_invoker = true) as
select
  e.id,
  e.child_id,
  c.name                                                   as child_name,
  e.category,
  e.type,
  (e.started_at at time zone 'Europe/Sofia')               as started_local,
  (e.ended_at   at time zone 'Europe/Sofia')               as ended_local,
  (e.started_at at time zone 'Europe/Sofia')::date         as day_local,
  round(extract(epoch from (e.ended_at - e.started_at)) / 60.0, 1) as duration_min,
  e.amount,
  e.unit,
  e.side,
  round(e.left_sec  / 60.0, 1)                             as left_min,
  round(e.right_sec / 60.0, 1)                             as right_min,
  e.last_side,
  -- minutes actually fed (left + right) for breastfeeding, else wall-clock duration
  case when e.type = 'breast' and (e.left_sec is not null or e.right_sec is not null)
       then round((coalesce(e.left_sec, 0) + coalesce(e.right_sec, 0)) / 60.0, 1)
       else round(extract(epoch from (e.ended_at - e.started_at)) / 60.0, 1)
  end                                                      as active_min,
  e.milk_type,
  e.diaper_color,
  e.label,
  e.note,
  case when c.birth_date is not null
       then ((e.started_at at time zone 'Europe/Sofia')::date - c.birth_date)
  end                                                      as age_days,
  e.started_at,
  e.ended_at
from public.events e
join public.children c on c.id = e.child_id;

comment on view public.v_events is 'Всички събития с име на дете, местно време и продължителност. Use for export/analysis.';

create view public.v_daily_summary
with (security_invoker = true) as
select
  child_id,
  child_name,
  day_local,
  count(*) filter (where category = 'feeding' and type in ('breast', 'bottle', 'solids')) as feedings,
  coalesce(sum(active_min) filter (where category = 'feeding' and type = 'breast'), 0) as breast_min,
  coalesce(sum(amount) filter (where category = 'feeding' and type = 'bottle' and unit = 'ml'), 0) as bottle_ml,
  coalesce(sum(amount) filter (where category = 'feeding' and type = 'pumping' and unit = 'ml'), 0) as pumped_ml,
  coalesce(round(sum(duration_min) filter (where category = 'sleep') / 60.0, 2), 0) as sleep_hours,
  count(*) filter (where category = 'sleep' and type = 'nap')                     as naps,
  count(*) filter (where category = 'diaper' and type in ('wet', 'mixed'))         as wet_diapers,
  count(*) filter (where category = 'diaper' and type in ('dirty', 'mixed'))       as dirty_diapers,
  count(*) filter (where category = 'diaper' and type like 'potty%')               as potty_successes,
  count(*) filter (where category = 'diaper' and type = 'accident')                as potty_accidents,
  max(amount) filter (where category = 'health' and type = 'temperature')          as max_temperature_c
from public.v_events
group by child_id, child_name, day_local;

comment on view public.v_daily_summary is 'Дневно обобщение по дете. One row per child per day (Sofia time).';

revoke all on public.v_events        from anon;
revoke all on public.v_daily_summary from anon;
grant select on public.v_events        to authenticated;
grant select on public.v_daily_summary to authenticated;

-- ---------------------------------------------------------------------
-- Optional hardening: only allow ONE specific e-mail to register.
-- Replace the address below, then uncomment and run.
-- (Also turn off "Allow new users to sign up" in Auth settings.)
-- ---------------------------------------------------------------------
-- create or replace function public.tg_only_allowed_signup()
-- returns trigger language plpgsql security definer set search_path = '' as $$
-- begin
--   if lower(new.email) <> lower('your.wife@example.com') then
--     raise exception 'Регистрацията е забранена';
--   end if;
--   return new;
-- end; $$;
-- drop trigger if exists only_allowed_signup on auth.users;
-- create trigger only_allowed_signup before insert on auth.users
--   for each row execute function public.tg_only_allowed_signup();
