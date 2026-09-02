create type public.activity_status as enum (
  'draft',
  'submitted',
  'approved',
  'rejected'
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null
    references public.internships(id) on delete cascade,
  student_id uuid not null default auth.uid()
    references public.profiles(id) on delete restrict,
  activity_date date not null,
  start_time time not null,
  end_time time not null,
  duration_minutes integer not null,
  group_label text,
  teacher_name text,
  description text not null,
  notes text,
  status public.activity_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_logs_duration_positive
    check (duration_minutes > 0),
  constraint activity_logs_description_length
    check (char_length(btrim(description)) between 2 and 4000),
  constraint activity_logs_group_length
    check (group_label is null or char_length(btrim(group_label)) <= 160),
  constraint activity_logs_teacher_length
    check (teacher_name is null or char_length(btrim(teacher_name)) <= 160),
  constraint activity_logs_notes_length
    check (notes is null or char_length(notes) <= 4000)
);

create index activity_logs_student_date_idx
  on public.activity_logs (student_id, activity_date desc, start_time desc);
create index activity_logs_internship_date_idx
  on public.activity_logs (internship_id, activity_date desc, start_time desc);
create index activity_logs_internship_status_idx
  on public.activity_logs (internship_id, status);

create function public.validate_and_prepare_activity_log()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  internship_student_id uuid;
  internship_status public.internship_status;
begin
  if current_user_id is null then
    raise exception 'Authenticated user is required.';
  end if;

  select student_id, status
    into internship_student_id, internship_status
  from public.internships
  where id = new.internship_id;

  if not found or internship_student_id <> current_user_id then
    raise exception 'Internship is not available for the current user.';
  end if;

  if internship_status <> 'active'::public.internship_status then
    raise exception 'Activities can only be registered for an active internship.';
  end if;

  if new.end_time <= new.start_time then
    raise exception 'End time must be after start time.';
  end if;

  if tg_op = 'UPDATE'
     and old.status in (
       'approved'::public.activity_status,
       'rejected'::public.activity_status
     ) then
    raise exception 'Reviewed activities cannot be changed by the student.';
  end if;

  new.student_id := current_user_id;
  new.duration_minutes := floor(
    extract(epoch from (new.end_time - new.start_time)) / 60
  )::integer;

  if tg_op = 'INSERT' then
    new.status := 'submitted'::public.activity_status;
  else
    new.status := old.status;
  end if;

  return new;
end;
$$;

create trigger activity_logs_validate_and_prepare
before insert or update on public.activity_logs
for each row
execute function public.validate_and_prepare_activity_log();

create trigger activity_logs_set_updated_at
before update on public.activity_logs
for each row
execute function public.set_catalog_updated_at();

revoke all on function public.validate_and_prepare_activity_log()
from public, anon, authenticated;

alter table public.activity_logs enable row level security;

revoke all on table public.activity_logs from public, anon, authenticated;
revoke all on type public.activity_status from public, anon, authenticated;

grant usage on type public.activity_status to authenticated, service_role;
grant select on table public.activity_logs to authenticated;
grant insert (
  internship_id,
  activity_date,
  start_time,
  end_time,
  group_label,
  teacher_name,
  description,
  notes
) on public.activity_logs to authenticated;
grant update (
  activity_date,
  start_time,
  end_time,
  group_label,
  teacher_name,
  description,
  notes
) on public.activity_logs to authenticated;
grant delete on table public.activity_logs to authenticated;
grant select, insert, update, delete
  on public.activity_logs to service_role;

create policy activity_logs_select_own
on public.activity_logs
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = student_id
);

create policy activity_logs_insert_own
on public.activity_logs
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = student_id
);

create policy activity_logs_update_own_unreviewed
on public.activity_logs
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = student_id
  and status in (
    'draft'::public.activity_status,
    'submitted'::public.activity_status
  )
)
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = student_id
  and status in (
    'draft'::public.activity_status,
    'submitted'::public.activity_status
  )
);

create policy activity_logs_delete_own_unreviewed
on public.activity_logs
for delete
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = student_id
  and status in (
    'draft'::public.activity_status,
    'submitted'::public.activity_status
  )
);
