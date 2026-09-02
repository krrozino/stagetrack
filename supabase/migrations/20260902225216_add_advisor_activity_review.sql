create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter table public.internships
  add constraint internships_advisor_not_student
  check (advisor_id is null or advisor_id <> student_id);

create or replace function public.validate_internship_advisor_assignment()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  selected_role public.app_role;
begin
  if new.advisor_id is null then
    return new;
  end if;

  if new.advisor_id = new.student_id then
    raise exception 'The student cannot be their own advisor.';
  end if;

  select role
    into selected_role
  from public.profiles
  where id = new.advisor_id;

  if not found or selected_role not in (
    'advisor'::public.app_role,
    'coordinator'::public.app_role
  ) then
    raise exception 'Assigned advisor must have an advisor or coordinator role.';
  end if;

  return new;
end;
$$;

create trigger internships_validate_advisor_assignment
before insert or update of advisor_id, student_id on public.internships
for each row
execute function public.validate_internship_advisor_assignment();

revoke all on function public.validate_internship_advisor_assignment()
from public, anon, authenticated;

alter table public.activity_logs
  add column review_comment text,
  add column reviewed_by uuid references public.profiles(id) on delete restrict,
  add column reviewed_at timestamptz,
  add constraint activity_logs_review_comment_length
    check (review_comment is null or char_length(review_comment) <= 2000),
  add constraint activity_logs_review_metadata_consistent
    check (
      (status in ('draft'::public.activity_status, 'submitted'::public.activity_status)
        and reviewed_by is null and reviewed_at is null)
      or
      (status in ('approved'::public.activity_status, 'rejected'::public.activity_status)
        and reviewed_by is not null and reviewed_at is not null)
    );

create index activity_logs_reviewed_by_idx
  on public.activity_logs (reviewed_by)
  where reviewed_by is not null;

create table public.activity_status_events (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activity_logs(id) on delete cascade,
  internship_id uuid not null references public.internships(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete restrict,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  from_status public.activity_status,
  to_status public.activity_status not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint activity_status_events_comment_length
    check (comment is null or char_length(comment) <= 2000)
);

create index activity_status_events_activity_created_idx
  on public.activity_status_events (activity_id, created_at desc);
create index activity_status_events_internship_created_idx
  on public.activity_status_events (internship_id, created_at desc);
create index activity_status_events_student_created_idx
  on public.activity_status_events (student_id, created_at desc);

alter table public.activity_status_events enable row level security;
revoke all on table public.activity_status_events from public, anon, authenticated;
grant select on table public.activity_status_events to authenticated;
grant select, insert, update, delete on table public.activity_status_events to service_role;

create policy internships_select_assigned_advisor
on public.internships
for select
to authenticated
using (
  (select auth.uid()) is not null
  and advisor_id = (select auth.uid())
  and student_id <> (select auth.uid())
);

create policy profiles_select_assigned_students
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) is not null
  and id <> (select auth.uid())
  and exists (
    select 1
    from public.internships i
    where i.student_id = profiles.id
      and i.advisor_id = (select auth.uid())
  )
);

create policy activity_logs_select_assigned_advisor
on public.activity_logs
for select
to authenticated
using (
  (select auth.uid()) is not null
  and student_id <> (select auth.uid())
  and exists (
    select 1
    from public.internships i
    where i.id = activity_logs.internship_id
      and i.advisor_id = (select auth.uid())
  )
);

create policy activity_logs_review_assigned_advisor
on public.activity_logs
for update
to authenticated
using (
  (select auth.uid()) is not null
  and student_id <> (select auth.uid())
  and status = 'submitted'::public.activity_status
  and exists (
    select 1
    from public.internships i
    where i.id = activity_logs.internship_id
      and i.advisor_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) is not null
  and student_id <> (select auth.uid())
  and status in ('approved'::public.activity_status, 'rejected'::public.activity_status)
  and reviewed_by = (select auth.uid())
  and reviewed_at is not null
  and exists (
    select 1
    from public.internships i
    where i.id = activity_logs.internship_id
      and i.advisor_id = (select auth.uid())
  )
);

grant update (status, review_comment) on public.activity_logs to authenticated;

create policy activity_status_events_select_own
on public.activity_status_events
for select
to authenticated
using (
  (select auth.uid()) is not null
  and student_id = (select auth.uid())
);

create policy activity_status_events_select_assigned_advisor
on public.activity_status_events
for select
to authenticated
using (
  (select auth.uid()) is not null
  and student_id <> (select auth.uid())
  and exists (
    select 1
    from public.internships i
    where i.id = activity_status_events.internship_id
      and i.advisor_id = (select auth.uid())
  )
);

create or replace function public.validate_and_prepare_activity_log()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  internship_student_id uuid;
  internship_advisor_id uuid;
  internship_status public.internship_status;
  actor_role public.app_role;
begin
  if current_user_id is null then
    raise exception 'Authenticated user is required.';
  end if;

  select student_id, advisor_id, status
    into internship_student_id, internship_advisor_id, internship_status
  from public.internships
  where id = new.internship_id;

  if not found then
    raise exception 'Internship is not available.';
  end if;

  if tg_op = 'INSERT' then
    if internship_student_id <> current_user_id then
      raise exception 'Internship is not available for the current user.';
    end if;

    if internship_status <> 'active'::public.internship_status then
      raise exception 'Activities can only be registered for an active internship.';
    end if;

    if new.end_time <= new.start_time then
      raise exception 'End time must be after start time.';
    end if;

    new.student_id := current_user_id;
    new.duration_minutes := floor(
      extract(epoch from (new.end_time - new.start_time)) / 60
    )::integer;
    new.status := 'submitted'::public.activity_status;
    new.review_comment := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    return new;
  end if;

  if new.internship_id is distinct from old.internship_id
     or new.student_id is distinct from old.student_id then
    raise exception 'Protected activity fields cannot be changed.';
  end if;

  if current_user_id = old.student_id then
    if old.status not in (
      'draft'::public.activity_status,
      'submitted'::public.activity_status
    ) then
      raise exception 'Reviewed activities cannot be changed by the student.';
    end if;

    if internship_status not in (
      'active'::public.internship_status,
      'paused'::public.internship_status
    ) then
      raise exception 'Activities cannot be changed for this internship state.';
    end if;

    if new.status is distinct from old.status
       or new.review_comment is distinct from old.review_comment
       or new.reviewed_by is distinct from old.reviewed_by
       or new.reviewed_at is distinct from old.reviewed_at then
      raise exception 'Students cannot review their own activities.';
    end if;

    if new.end_time <= new.start_time then
      raise exception 'End time must be after start time.';
    end if;

    new.duration_minutes := floor(
      extract(epoch from (new.end_time - new.start_time)) / 60
    )::integer;
    return new;
  end if;

  select role
    into actor_role
  from public.profiles
  where id = current_user_id;

  if current_user_id = internship_advisor_id
     and current_user_id <> old.student_id
     and actor_role in ('advisor'::public.app_role, 'coordinator'::public.app_role) then
    if old.status <> 'submitted'::public.activity_status then
      raise exception 'Only submitted activities can be reviewed.';
    end if;

    if new.status not in (
      'approved'::public.activity_status,
      'rejected'::public.activity_status
    ) then
      raise exception 'Review must approve or reject the activity.';
    end if;

    if new.activity_date is distinct from old.activity_date
       or new.start_time is distinct from old.start_time
       or new.end_time is distinct from old.end_time
       or new.duration_minutes is distinct from old.duration_minutes
       or new.group_label is distinct from old.group_label
       or new.teacher_name is distinct from old.teacher_name
       or new.description is distinct from old.description
       or new.notes is distinct from old.notes then
      raise exception 'Reviewers cannot alter the student activity content.';
    end if;

    if new.status = 'rejected'::public.activity_status
       and (new.review_comment is null or char_length(btrim(new.review_comment)) < 3) then
      raise exception 'Rejected activities require a review comment.';
    end if;

    new.review_comment := nullif(btrim(new.review_comment), '');
    new.reviewed_by := current_user_id;
    new.reviewed_at := now();
    return new;
  end if;

  raise exception 'The current user cannot update this activity.';
end;
$$;

create or replace function private.record_activity_status_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authenticated user is required to record activity history.';
  end if;

  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.activity_status_events (
      activity_id,
      internship_id,
      student_id,
      actor_id,
      from_status,
      to_status,
      comment,
      created_at
    ) values (
      new.id,
      new.internship_id,
      new.student_id,
      current_user_id,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status,
      case when tg_op = 'INSERT' then null else new.review_comment end,
      now()
    );
  end if;

  return new;
end;
$$;

revoke all on function private.record_activity_status_event()
from public, anon, authenticated;

create trigger activity_logs_record_status_event
after insert or update of status on public.activity_logs
for each row
execute function private.record_activity_status_event();
