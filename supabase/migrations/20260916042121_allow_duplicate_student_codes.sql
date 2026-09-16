drop function if exists public.replace_athletes(text,text,text[]);
drop function if exists public.bulk_set_student_colors(jsonb);
drop function if exists public.sync_athlete_photo_url() cascade;

drop table if exists public.student_photos cascade;
drop table if exists public.athletes cascade;

alter table public.students drop constraint if exists students_pkey;
alter table public.students add column if not exists student_id uuid not null default gen_random_uuid();
alter table public.students add constraint students_pkey primary key (student_id);
create index if not exists idx_students_student_code on public.students(student_code);

create table public.athletes (
  sport_id text not null references public.sports(sport_id) on delete cascade,
  color text not null,
  student_id uuid not null references public.students(student_id) on delete cascade,
  student_code text,
  student_name text not null,
  level_room text not null,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (sport_id, color, student_id),
  constraint athletes_color_check check (color in ('red','yellow','blue','pink'))
);

create table public.student_photos (
  student_id uuid primary key references public.students(student_id) on delete cascade,
  student_code text,
  storage_bucket text not null default 'athlete-photos',
  storage_path text,
  photo_url text,
  mime_type text,
  size_bytes integer,
  legacy_drive_file_id text,
  legacy_photo_url text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint student_photos_mime_check check (mime_type is null or mime_type in ('image/jpeg','image/png','image/webp')),
  constraint student_photos_size_check check (size_bytes is null or (size_bytes > 0 and size_bytes <= 1500000))
);

create index if not exists idx_athletes_sport_color on public.athletes(sport_id, color);
create index if not exists idx_athletes_student on public.athletes(student_id);

create trigger trg_athletes_updated_at before update on public.athletes for each row execute function public.set_updated_at();

create or replace function public.sync_athlete_photo_url()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    update public.athletes set photo_url = null where student_id = old.student_id;
    return old;
  else
    update public.athletes set photo_url = new.photo_url where student_id = new.student_id;
    return new;
  end if;
end;
$$;

create trigger trg_sync_athlete_photo_insert_update after insert or update on public.student_photos for each row execute function public.sync_athlete_photo_url();
create trigger trg_sync_athlete_photo_delete after delete on public.student_photos for each row execute function public.sync_athlete_photo_url();

create or replace function public.replace_athletes(
  p_sport_id text,
  p_color text,
  p_student_ids uuid[]
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
  if p_color not in ('red','yellow','blue','pink') then raise exception 'Invalid color'; end if;
  select athlete_limit into v_limit from public.sports where sport_id = p_sport_id and active = true;
  if v_limit is null then raise exception 'Sport not found'; end if;
  v_count := coalesce(array_length(p_student_ids,1),0);
  if v_count > v_limit then raise exception 'Athlete limit exceeded'; end if;
  if exists (
    select 1
      from unnest(coalesce(p_student_ids,array[]::uuid[])) sid
      left join public.students s on s.student_id = sid
     where s.student_id is null or s.color is distinct from p_color or s.active = false
  ) then raise exception 'Student is not eligible for this color'; end if;
  delete from public.athletes where sport_id = p_sport_id and color = p_color;
  insert into public.athletes(sport_id,color,student_id,student_code,student_name,level_room,photo_url)
  select p_sport_id,p_color,s.student_id,s.student_code,
         concat(coalesce(s.prefix,''),s.first_name,' ',s.last_name),
         s.level||'/'||s.room,p.photo_url
    from public.students s
    left join public.student_photos p using(student_id)
   where s.student_id = any(coalesce(p_student_ids,array[]::uuid[]));
  return v_count;
end;
$$;

create or replace function public.bulk_set_student_colors(p_items jsonb)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare v_count integer;
begin
  if jsonb_typeof(p_items) <> 'array' then raise exception 'Expected JSON array'; end if;
  with input as (
    select (x->>'student_id')::uuid as student_id, nullif(x->>'color','') as color
    from jsonb_array_elements(p_items) x
  ), updated as (
    update public.students s
       set color = i.color
      from input i
     where s.student_id = i.student_id
       and (i.color is null or i.color in ('red','yellow','blue','pink'))
    returning 1
  ) select count(*) into v_count from updated;
  return v_count;
end;
$$;

revoke all on function public.replace_athletes(text,text,uuid[]) from public, anon, authenticated;
revoke all on function public.bulk_set_student_colors(jsonb) from public, anon, authenticated;
grant execute on function public.replace_athletes(text,text,uuid[]) to service_role;
grant execute on function public.bulk_set_student_colors(jsonb) to service_role;

alter table public.athletes enable row level security;
alter table public.student_photos enable row level security;
revoke all on public.athletes from anon, authenticated;
revoke all on public.student_photos from anon, authenticated;
grant select(sport_id,color,student_name,level_room,photo_url) on public.athletes to anon, authenticated;
create policy "read public athletes" on public.athletes for select to anon, authenticated using (true);
grant all on public.athletes to service_role;
grant all on public.student_photos to service_role;
