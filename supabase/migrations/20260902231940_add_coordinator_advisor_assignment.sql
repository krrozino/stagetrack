create or replace function private.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

grant usage on schema private to authenticated;
grant execute on function private.current_app_role() to authenticated;

create policy profiles_select_coordination
on public.profiles
for select
to authenticated
using (private.current_app_role() = 'coordinator'::public.app_role);

create policy internships_select_coordination
on public.internships
for select
to authenticated
using (private.current_app_role() = 'coordinator'::public.app_role);

create policy internships_update_advisor_coordination
on public.internships
for update
to authenticated
using (private.current_app_role() = 'coordinator'::public.app_role)
with check (private.current_app_role() = 'coordinator'::public.app_role);

grant update (advisor_id) on public.internships to authenticated;

create or replace function public.validate_and_prepare_internship()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  actor_role public.app_role;
  selected_course_id uuid;
  selected_required_minutes integer;
  selected_type_active boolean;
  student_course_id uuid;
begin
  if current_user_id is not null then
    select role into actor_role
    from public.profiles
    where id = current_user_id;
  end if;

  if tg_op = 'INSERT' and current_user_id is not null then
    new.student_id := current_user_id;
  end if;

  if tg_op = 'UPDATE' and current_user_id is not null then
    if actor_role = 'coordinator'::public.app_role then
      if new.student_id is distinct from old.student_id
         or new.internship_type_id is distinct from old.internship_type_id
         or new.organization_id is distinct from old.organization_id
         or new.supervisor_id is distinct from old.supervisor_id
         or new.start_date is distinct from old.start_date
         or new.expected_end_date is distinct from old.expected_end_date
         or new.required_minutes is distinct from old.required_minutes
         or new.status is distinct from old.status
         or new.created_at is distinct from old.created_at then
        raise exception 'Coordinators can only change the assigned advisor.';
      end if;

      return new;
    end if;

    if current_user_id <> old.student_id then
      raise exception 'The current user cannot update this internship.';
    end if;

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