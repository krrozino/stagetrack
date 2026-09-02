create type public.internship_status as enum (
  'draft',
  'active',
  'paused',
  'completed',
  'cancelled'
);

alter table public.supervisors
  add constraint supervisors_id_organization_unique
  unique (id, organization_id);

create table public.internships (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null default auth.uid()
    references public.profiles(id) on delete restrict,
  internship_type_id uuid not null
    references public.internship_types(id) on delete restrict,
  organization_id uuid not null
    references public.organizations(id) on delete restrict,
  supervisor_id uuid,
  advisor_id uuid references public.profiles(id) on delete restrict,
  start_date date not null,
  expected_end_date date,
  required_minutes integer not null,
  status public.internship_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint internships_required_minutes_positive
    check (required_minutes > 0),
  constraint internships_expected_end_date_valid
    check (expected_end_date is null or expected_end_date >= start_date),
  constraint internships_supervisor_organization_fkey
    foreign key (supervisor_id, organization_id)
    references public.supervisors(id, organization_id)
    on delete restrict
);

create index internships_student_id_idx
  on public.internships (student_id);
create index internships_type_id_idx
  on public.internships (internship_type_id);
create index internships_organization_id_idx
  on public.internships (organization_id);
create index internships_supervisor_org_idx
  on public.internships (supervisor_id, organization_id)
  where supervisor_id is not null;
create index internships_advisor_id_idx
  on public.internships (advisor_id)
  where advisor_id is not null;
create index internships_student_status_created_idx
  on public.internships (student_id, status, created_at desc);

comment on table public.internships is
  'Student internships with protected workload snapshots and lifecycle status.';
comment on column public.internships.required_minutes is
  'Snapshot of internship_types.required_minutes at creation or draft type change.';

create function public.validate_and_prepare_internship()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  selected_course_id uuid;
  selected_required_minutes integer;
  selected_type_active boolean;
  student_course_id uuid;
begin
  if tg_op = 'INSERT' and current_user_id is not null then
    new.student_id := current_user_id;
  end if;

  if tg_op = 'UPDATE' and current_user_id is not null then
    if old.status in (
      'completed'::public.internship_status,
      'cancelled'::public.internship_status
    ) then
      raise exception 'Completed or cancelled internships cannot be changed by the student.';
    end if;

    if new.student_id is distinct from old.student_id
       or new.required_minutes is distinct from old.required_minutes
       or new.advisor_id is distinct from old.advisor_id then
      raise exception 'Protected internship fields cannot be changed by the student.';
    end if;

    if new.internship_type_id is distinct from old.internship_type_id
       and old.status <> 'draft'::public.internship_status then
      raise exception 'Internship type can only be changed while the internship is a draft.';
    end if;

    if new.status is distinct from old.status then
      if old.status = 'draft'::public.internship_status
         and new.status not in (
           'active'::public.internship_status,
           'cancelled'::public.internship_status
         ) then
        raise exception 'Invalid internship status transition.';
      elsif old.status = 'active'::public.internship_status
         and new.status not in (
           'paused'::public.internship_status,
           'cancelled'::public.internship_status
         ) then
        raise exception 'Invalid internship status transition.';
      elsif old.status = 'paused'::public.internship_status
         and new.status not in (
           'active'::public.internship_status,
           'cancelled'::public.internship_status
         ) then
        raise exception 'Invalid internship status transition.';
      end if;
    end if;
  end if;

  if tg_op = 'INSERT'
     or new.internship_type_id is distinct from old.internship_type_id then
    select course_id, required_minutes, active
      into selected_course_id, selected_required_minutes, selected_type_active
    from public.internship_types
    where id = new.internship_type_id;

    if not found then
      raise exception 'Internship type is not available.';
    end if;

    if selected_type_active is not true then
      raise exception 'Inactive internship types cannot be used for a new internship.';
    end if;

    select course_id
      into student_course_id
    from public.profiles
    where id = new.student_id;

    if not found or student_course_id is null then
      raise exception 'Student profile must have a course before creating an internship.';
    end if;

    if student_course_id <> selected_course_id then
      raise exception 'Internship type does not belong to the student course.';
    end if;

    new.required_minutes := selected_required_minutes;
  end if;

  if new.supervisor_id is not null then
    perform 1
    from public.supervisors
    where id = new.supervisor_id
      and organization_id = new.organization_id;

    if not found then
      raise exception 'Supervisor is not available for the selected organization.';
    end if;
  end if;

  return new;
end;
$$;

create trigger internships_validate_and_prepare
before insert or update on public.internships
for each row
execute function public.validate_and_prepare_internship();

create trigger internships_set_updated_at
before update on public.internships
for each row
execute function public.set_catalog_updated_at();

revoke all on function public.validate_and_prepare_internship()
from public, anon, authenticated;

alter table public.internships enable row level security;

revoke all on table public.internships from public, anon, authenticated;
revoke all on type public.internship_status from public, anon, authenticated;

grant usage on type public.internship_status to authenticated, service_role;
grant select on table public.internships to authenticated;
grant insert (
  internship_type_id,
  organization_id,
  supervisor_id,
  start_date,
  expected_end_date
) on public.internships to authenticated;
grant update (
  internship_type_id,
  organization_id,
  supervisor_id,
  start_date,
  expected_end_date,
  status
) on public.internships to authenticated;
grant select, insert, update, delete on public.internships to service_role;

create policy internships_select_own
on public.internships
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = student_id
);

create policy internships_insert_own
on public.internships
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = student_id
  and status = 'draft'::public.internship_status
);

create policy internships_update_own_open
on public.internships
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = student_id
  and status not in (
    'completed'::public.internship_status,
    'cancelled'::public.internship_status
  )
)
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = student_id
  and status <> 'completed'::public.internship_status
);
