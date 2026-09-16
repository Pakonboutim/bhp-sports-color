-- BHP Sports Color - Final Supabase schema
-- Designed from the complete legacy Google Apps Script web workflow.
-- IMPORTANT: browser code must use a publishable key only.
-- All writes should go through trusted Edge Functions using a secret key.

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------
-- 1) CORE TABLES
-- -------------------------------------------------------------------

create table if not exists public.students (
  student_code text primary key,
  number integer,
  prefix text,
  first_name text not null,
  last_name text not null,
  level text not null,
  room text not null,
  color text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_color_check
    check (color is null or color in ('red','yellow','blue','pink'))
);

create table if not exists public.teachers (
  teacher_id uuid primary key default gen_random_uuid(),
  color text not null,
  prefix text,
  first_name text not null,
  last_name text not null,
  role text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teachers_color_check
    check (color in ('red','yellow','blue','pink')),
  constraint teachers_natural_key
    unique (color, prefix, first_name, last_name)
);

create table if not exists public.sports (
  sport_id text primary key,
  name text not null,
  level text,
  gender text not null default 'Mixed',
  athlete_limit integer not null,
  type text not null,
  active boolean not null default true,
  team_format text not null default 'Standard4',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sports_gender_check
    check (gender in ('Male','Female','Mixed')),
  constraint sports_type_check
    check (type in ('Knockout','Round Robin')),
  constraint sports_limit_check
    check (athlete_limit > 0),
  constraint sports_team_format_check
    check (team_format in ('Standard4','UpperMaleCombined2'))
);

create table if not exists public.athletes (
  sport_id text not null references public.sports(sport_id) on delete cascade,
  color text not null,
  student_code text not null references public.students(student_code) on delete cascade,
  student_name text not null,
  level_room text not null,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (sport_id, color, student_code),
  constraint athletes_color_check
    check (color in ('red','yellow','blue','pink'))
);

create table if not exists public.matches (
  match_id text primary key,
  sport_id text not null references public.sports(sport_id) on delete cascade,
  sport_name text not null,
  round text not null,
  team_a text,
  team_b text,
  score_a integer,
  score_b integer,
  winner text,
  loser text,
  referee_name text,
  confirmed_at timestamptz,
  status text not null default 'Pending',
  match_date date,
  match_time time without time zone,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_status_check
    check (status in ('Pending','Confirmed')),
  constraint matches_score_a_check
    check (score_a is null or score_a >= 0),
  constraint matches_score_b_check
    check (score_b is null or score_b >= 0),
  constraint matches_confirmed_integrity check (
    status <> 'Confirmed'
    or (
      team_a is not null and team_b is not null
      and score_a is not null and score_b is not null
      and score_a <> score_b
      and winner is not null and loser is not null
      and referee_name is not null
      and confirmed_at is not null
    )
  )
);

create table if not exists public.student_photos (
  student_code text primary key references public.students(student_code) on delete cascade,
  storage_bucket text not null default 'athlete-photos',
  storage_path text,
  photo_url text,
  mime_type text,
  size_bytes integer,
  legacy_drive_file_id text,
  legacy_photo_url text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint student_photos_mime_check
    check (mime_type is null or mime_type in ('image/jpeg','image/png','image/webp')),
  constraint student_photos_size_check
    check (size_bytes is null or (size_bytes > 0 and size_bytes <= 1500000))
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  audit_id bigint generated always as identity primary key,
  event_time timestamptz not null default now(),
  action text not null,
  user_type text not null default 'System',
  user_id uuid references auth.users(id) on delete set null,
  color text,
  details jsonb not null default '{}'::jsonb
);

create table if not exists public.app_user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null,
  color text,
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_user_roles_role_check
    check (role in ('admin','staff','referee','color_manager')),
  constraint app_user_roles_color_check
    check (color is null or color in ('red','yellow','blue','pink')),
  constraint app_user_roles_staff_color_check
    check (
      (role in ('staff','color_manager') and color is not null)
      or role not in ('staff','color_manager')
    )
);

-- -------------------------------------------------------------------
-- 2) INDEXES
-- -------------------------------------------------------------------

create index if not exists idx_students_level_room
  on public.students(level, room);

create index if not exists idx_students_color
  on public.students(color);

create index if not exists idx_teachers_color
  on public.teachers(color);

create index if not exists idx_athletes_sport_color
  on public.athletes(sport_id, color);

create index if not exists idx_athletes_student
  on public.athletes(student_code);

create index if not exists idx_matches_sport_round
  on public.matches(sport_id, round);

create index if not exists idx_matches_status
  on public.matches(status);

create index if not exists idx_matches_schedule
  on public.matches(match_date, match_time);

create index if not exists idx_audit_logs_time
  on public.audit_logs(event_time desc);

create index if not exists idx_audit_logs_action
  on public.audit_logs(action);

-- -------------------------------------------------------------------
-- 3) GENERIC UPDATED_AT TRIGGER
-- -------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists trg_teachers_updated_at on public.teachers;
create trigger trg_teachers_updated_at
before update on public.teachers
for each row execute function public.set_updated_at();

drop trigger if exists trg_sports_updated_at on public.sports;
create trigger trg_sports_updated_at
before update on public.sports
for each row execute function public.set_updated_at();

drop trigger if exists trg_athletes_updated_at on public.athletes;
create trigger trg_athletes_updated_at
before update on public.athletes
for each row execute function public.set_updated_at();

drop trigger if exists trg_matches_updated_at on public.matches;
create trigger trg_matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists trg_app_user_roles_updated_at on public.app_user_roles;
create trigger trg_app_user_roles_updated_at
before update on public.app_user_roles
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------
-- 4) SETTINGS DEFAULTS
-- -------------------------------------------------------------------

insert into public.app_settings(key, value)
values ('StaffRegistrationOpen', 'true'::jsonb)
on conflict (key) do nothing;

-- -------------------------------------------------------------------
-- 5) KEEP ATHLETE PHOTO URL IN SYNC FOR FAST PUBLIC READS
-- -------------------------------------------------------------------

create or replace function public.sync_athlete_photo_url()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    update public.athletes
       set photo_url = null
     where student_code = old.student_code;
    return old;
  else
    update public.athletes
       set photo_url = new.photo_url
     where student_code = new.student_code;
    return new;
  end if;
end;
$$;

drop trigger if exists trg_sync_athlete_photo_insert_update on public.student_photos;
create trigger trg_sync_athlete_photo_insert_update
after insert or update on public.student_photos
for each row execute function public.sync_athlete_photo_url();

drop trigger if exists trg_sync_athlete_photo_delete on public.student_photos;
create trigger trg_sync_athlete_photo_delete
after delete on public.student_photos
for each row execute function public.sync_athlete_photo_url();

-- -------------------------------------------------------------------
-- 6) MATCH BRACKET REBUILD
-- Recomputes final teams from confirmed semifinals.
-- Also clears the final result when a semifinal changes.
-- -------------------------------------------------------------------

create or replace function public.rebuild_knockout_final(p_sport_id text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_final_id text;
  v_team_a text;
  v_team_b text;
begin
  select match_id
    into v_final_id
    from public.matches
   where sport_id = p_sport_id
     and round = 'Final'
   limit 1;

  if v_final_id is null then
    return;
  end if;

  select winner
    into v_team_a
    from public.matches
   where sport_id = p_sport_id
     and round = 'Semi Final 1'
     and status = 'Confirmed'
   limit 1;

  select winner
    into v_team_b
    from public.matches
   where sport_id = p_sport_id
     and round = 'Semi Final 2'
     and status = 'Confirmed'
   limit 1;

  update public.matches
     set team_a = v_team_a,
         team_b = v_team_b,
         score_a = null,
         score_b = null,
         winner = null,
         loser = null,
         referee_name = null,
         confirmed_at = null,
         status = 'Pending'
   where match_id = v_final_id;
end;
$$;

create or replace function public.on_semifinal_changed()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.round in ('Semi Final 1','Semi Final 2')
     and (
       old.status is distinct from new.status
       or old.winner is distinct from new.winner
       or old.score_a is distinct from new.score_a
       or old.score_b is distinct from new.score_b
     )
  then
    perform public.rebuild_knockout_final(new.sport_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_semifinal_changed on public.matches;
create trigger trg_semifinal_changed
after update on public.matches
for each row execute function public.on_semifinal_changed();

-- -------------------------------------------------------------------
-- 7) SERVICE-ONLY TRANSACTION FUNCTIONS
-- These are intended to be called only from trusted Edge Functions.
-- -------------------------------------------------------------------

create or replace function public.ensure_matches_for_sport(p_sport_id text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  s public.sports%rowtype;
begin
  select * into s from public.sports where sport_id = p_sport_id;
  if not found then
    raise exception 'Sport not found';
  end if;

  if exists(select 1 from public.matches where sport_id = p_sport_id) then
    return;
  end if;

  if s.team_format = 'UpperMaleCombined2' then
    insert into public.matches(match_id,sport_id,sport_name,round,team_a,team_b)
    values ('MT-'||substr(gen_random_uuid()::text,1,8),s.sport_id,s.name,'Final','yellow-blue','pink-red');

  elsif s.type = 'Knockout' then
    insert into public.matches(match_id,sport_id,sport_name,round,team_a,team_b)
    values
      ('MT-'||substr(gen_random_uuid()::text,1,8),s.sport_id,s.name,'Semi Final 1','red','yellow'),
      ('MT-'||substr(gen_random_uuid()::text,1,8),s.sport_id,s.name,'Semi Final 2','blue','pink'),
      ('MT-'||substr(gen_random_uuid()::text,1,8),s.sport_id,s.name,'Final',null,null);

  else
    insert into public.matches(match_id,sport_id,sport_name,round,team_a,team_b)
    values
      ('MT-'||substr(gen_random_uuid()::text,1,8),s.sport_id,s.name,'Round Robin','red','yellow'),
      ('MT-'||substr(gen_random_uuid()::text,1,8),s.sport_id,s.name,'Round Robin','red','blue'),
      ('MT-'||substr(gen_random_uuid()::text,1,8),s.sport_id,s.name,'Round Robin','red','pink'),
      ('MT-'||substr(gen_random_uuid()::text,1,8),s.sport_id,s.name,'Round Robin','yellow','blue'),
      ('MT-'||substr(gen_random_uuid()::text,1,8),s.sport_id,s.name,'Round Robin','yellow','pink'),
      ('MT-'||substr(gen_random_uuid()::text,1,8),s.sport_id,s.name,'Round Robin','blue','pink');
  end if;
end;
$$;

create or replace function public.replace_athletes(
  p_sport_id text,
  p_color text,
  p_student_codes text[]
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_limit integer;
  v_count integer;
begin
  if p_color not in ('red','yellow','blue','pink') then
    raise exception 'Invalid color';
  end if;

  select athlete_limit into v_limit
    from public.sports
   where sport_id = p_sport_id
     and active = true;

  if v_limit is null then
    raise exception 'Sport not found';
  end if;

  v_count := coalesce(array_length(p_student_codes,1),0);
  if v_count > v_limit then
    raise exception 'Athlete limit exceeded';
  end if;

  if exists (
    select 1
      from unnest(coalesce(p_student_codes,array[]::text[])) code
      left join public.students s on s.student_code = code
     where s.student_code is null
        or s.color is distinct from p_color
        or s.active = false
  ) then
    raise exception 'Student is not eligible for this color';
  end if;

  delete from public.athletes
   where sport_id = p_sport_id
     and color = p_color;

  insert into public.athletes(
    sport_id,color,student_code,student_name,level_room,photo_url
  )
  select p_sport_id,
         p_color,
         s.student_code,
         concat(coalesce(s.prefix,''),s.first_name,' ',s.last_name),
         s.level||'/'||s.room,
         p.photo_url
    from public.students s
    left join public.student_photos p using(student_code)
   where s.student_code = any(coalesce(p_student_codes,array[]::text[]));

  return v_count;
end;
$$;

create or replace function public.bulk_set_student_colors(p_items jsonb)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_count integer;
begin
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'Expected JSON array';
  end if;

  with input as (
    select
      x->>'student_code' as student_code,
      nullif(x->>'color','') as color
    from jsonb_array_elements(p_items) x
  ),
  updated as (
    update public.students s
       set color = i.color
      from input i
     where s.student_code = i.student_code
       and (i.color is null or i.color in ('red','yellow','blue','pink'))
    returning 1
  )
  select count(*) into v_count from updated;

  return v_count;
end;
$$;

create or replace function public.confirm_match_result(
  p_match_id text,
  p_score_a integer,
  p_score_b integer,
  p_referee_name text
)
returns public.matches
language plpgsql
security invoker
set search_path = public
as $$
declare
  m public.matches%rowtype;
begin
  if p_score_a is null or p_score_b is null
     or p_score_a < 0 or p_score_b < 0
     or p_score_a = p_score_b then
    raise exception 'Invalid score';
  end if;

  if nullif(trim(p_referee_name),'') is null then
    raise exception 'Referee name required';
  end if;

  select * into m
    from public.matches
   where match_id = p_match_id
   for update;

  if not found then raise exception 'Match not found'; end if;
  if m.status = 'Confirmed' then raise exception 'Already confirmed'; end if;
  if m.team_a is null or m.team_b is null then raise exception 'Teams are not ready'; end if;

  update public.matches
     set score_a = p_score_a,
         score_b = p_score_b,
         winner = case when p_score_a > p_score_b then m.team_a else m.team_b end,
         loser = case when p_score_a > p_score_b then m.team_b else m.team_a end,
         referee_name = trim(p_referee_name),
         confirmed_at = now(),
         status = 'Confirmed'
   where match_id = p_match_id
   returning * into m;

  return m;
end;
$$;

create or replace function public.unlock_match_result(p_match_id text)
returns public.matches
language plpgsql
security invoker
set search_path = public
as $$
declare
  m public.matches%rowtype;
begin
  update public.matches
     set score_a = null,
         score_b = null,
         winner = null,
         loser = null,
         referee_name = null,
         confirmed_at = null,
         status = 'Pending'
   where match_id = p_match_id
   returning * into m;

  if not found then raise exception 'Match not found'; end if;
  return m;
end;
$$;

create or replace function public.edit_match_score(
  p_match_id text,
  p_score_a integer,
  p_score_b integer
)
returns public.matches
language plpgsql
security invoker
set search_path = public
as $$
declare
  m public.matches%rowtype;
begin
  if p_score_a is null or p_score_b is null
     or p_score_a < 0 or p_score_b < 0
     or p_score_a = p_score_b then
    raise exception 'Invalid score';
  end if;

  select * into m
    from public.matches
   where match_id = p_match_id
   for update;

  if not found then raise exception 'Match not found'; end if;
  if m.status <> 'Confirmed' then raise exception 'Match is not confirmed'; end if;

  update public.matches
     set score_a = p_score_a,
         score_b = p_score_b,
         winner = case when p_score_a > p_score_b then m.team_a else m.team_b end,
         loser = case when p_score_a > p_score_b then m.team_b else m.team_a end
   where match_id = p_match_id
   returning * into m;

  return m;
end;
$$;

-- Lock down transaction RPCs: Edge Function/service role only.
revoke all on function public.ensure_matches_for_sport(text) from public, anon, authenticated;
revoke all on function public.replace_athletes(text,text,text[]) from public, anon, authenticated;
revoke all on function public.bulk_set_student_colors(jsonb) from public, anon, authenticated;
revoke all on function public.confirm_match_result(text,integer,integer,text) from public, anon, authenticated;
revoke all on function public.unlock_match_result(text) from public, anon, authenticated;
revoke all on function public.edit_match_score(text,integer,integer) from public, anon, authenticated;

grant execute on function public.ensure_matches_for_sport(text) to service_role;
grant execute on function public.replace_athletes(text,text,text[]) to service_role;
grant execute on function public.bulk_set_student_colors(jsonb) to service_role;
grant execute on function public.confirm_match_result(text,integer,integer,text) to service_role;
grant execute on function public.unlock_match_result(text) to service_role;
grant execute on function public.edit_match_score(text,integer,integer) to service_role;

-- -------------------------------------------------------------------
-- 8) ROW LEVEL SECURITY
-- -------------------------------------------------------------------

alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.sports enable row level security;
alter table public.athletes enable row level security;
alter table public.matches enable row level security;
alter table public.student_photos enable row level security;
alter table public.app_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_user_roles enable row level security;

-- Default: no direct writes from browser.
revoke all on public.students from anon, authenticated;
revoke all on public.teachers from anon, authenticated;
revoke all on public.sports from anon, authenticated;
revoke all on public.athletes from anon, authenticated;
revoke all on public.matches from anon, authenticated;
revoke all on public.student_photos from anon, authenticated;
revoke all on public.app_settings from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;
revoke all on public.app_user_roles from anon, authenticated;

-- Explicit Data API grants (required by newer Supabase projects).
grant select(number,prefix,first_name,last_name,level,room,color)
  on public.students to anon, authenticated;

grant select(color,prefix,first_name,last_name,role)
  on public.teachers to anon, authenticated;

grant select
  on public.sports to anon, authenticated;

grant select(match_id,sport_id,sport_name,round,team_a,team_b,score_a,score_b,winner,loser,referee_name,confirmed_at,status,match_date,match_time)
  on public.matches to anon, authenticated;

grant select(sport_id,color,student_name,level_room,photo_url)
  on public.athletes to anon, authenticated;

grant select(key,value)
  on public.app_settings to anon, authenticated;

grant select(user_id,role,color,display_name,active)
  on public.app_user_roles to authenticated;

-- Public read policies. Sensitive columns remain protected by column grants.
drop policy if exists "read students" on public.students;
create policy "read students"
on public.students for select
to anon, authenticated
using (active = true);

drop policy if exists "read teachers" on public.teachers;
create policy "read teachers"
on public.teachers for select
to anon, authenticated
using (active = true);

drop policy if exists "read sports" on public.sports;
create policy "read sports"
on public.sports for select
to anon, authenticated
using (active = true);

drop policy if exists "read matches" on public.matches;
create policy "read matches"
on public.matches for select
to anon, authenticated
using (true);

drop policy if exists "read public athletes" on public.athletes;
create policy "read public athletes"
on public.athletes for select
to anon, authenticated
using (true);

drop policy if exists "read app settings" on public.app_settings;
create policy "read app settings"
on public.app_settings for select
to anon, authenticated
using (key = 'StaffRegistrationOpen');

drop policy if exists "user reads own role" on public.app_user_roles;
create policy "user reads own role"
on public.app_user_roles for select
to authenticated
using ((select auth.uid()) = user_id);

-- service_role still bypasses RLS and is used only server-side.
grant all on public.students to service_role;
grant all on public.teachers to service_role;
grant all on public.sports to service_role;
grant all on public.athletes to service_role;
grant all on public.matches to service_role;
grant all on public.student_photos to service_role;
grant all on public.app_settings to service_role;
grant all on public.audit_logs to service_role;
grant all on public.app_user_roles to service_role;
grant usage, select on all sequences in schema public to service_role;

-- -------------------------------------------------------------------
-- 9) STORAGE BUCKET FOR ATHLETE PHOTOS
-- Public read matches current Google Drive behavior.
-- Upload / replace / delete should be done by trusted Edge Functions.
-- -------------------------------------------------------------------

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'athlete-photos',
  'athlete-photos',
  true,
  1500000,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
