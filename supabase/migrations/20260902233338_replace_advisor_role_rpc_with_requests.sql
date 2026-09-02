drop function if exists public.set_profile_advisor_role(uuid, public.app_role);

create table public.profile_role_change_requests (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null default auth.uid()
    references public.profiles(id) on delete restrict,
  target_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  previous_role public.app_role not null,
  requested_role public.app_role not null,
  created_at timestamptz not null default now(),
  constraint profile_role_change_requests_not_self
    check (actor_id <> target_profile_id),
  constraint profile_role_change_requests_manageable_role
    check (requested_role in ('student'::public.app_role, 'advisor'::public.app_role))
);

create index profile_role_change_requests_target_created_idx
  on public.profile_role_change_requests (target_profile_id, created_at desc);
create index profile_role_change_requests_actor_created_idx
  on public.profile_role_change_requests (actor_id, created_at desc);

alter table public.profile_role_change_requests enable row level security;
revoke all on table public.profile_role_change_requests from public, anon, authenticated;
grant select on table public.profile_role_change_requests to authenticated;
grant insert (target_profile_id, requested_role)
  on public.profile_role_change_requests to authenticated;
grant select, insert, update, delete
  on public.profile_role_change_requests to service_role;

create policy profile_role_change_requests_select_coordination
on public.profile_role_change_requests
for select
to authenticated
using (private.current_app_role() = 'coordinator'::public.app_role);

create policy profile_role_change_requests_insert_coordination
on public.profile_role_change_requests
for insert
to authenticated
with check (
  private.current_app_role() = 'coordinator'::public.app_role
  and actor_id = (select auth.uid())
);

create or replace function private.apply_profile_role_change_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role public.app_role;
  current_target_role public.app_role;
begin
  if auth.uid() is null then
    raise exception 'Authenticated user is required.';
  end if;

  select p.role
    into actor_role
  from public.profiles p
  where p.id = auth.uid();

  if actor_role <> 'coordinator'::public.app_role then
    raise exception 'Coordinator role is required.';
  end if;

  new.actor_id := auth.uid();

  if new.target_profile_id = new.actor_id then
    raise exception 'Coordinators cannot change their own role.';
  end if;

  if new.requested_role not in (
    'student'::public.app_role,
    'advisor'::public.app_role
  ) then
    raise exception 'Only student and advisor roles can be managed here.';
  end if;

  select p.role
    into current_target_role
  from public.profiles p
  where p.id = new.target_profile_id
  for update;

  if not found then
    raise exception 'Target profile does not exist.';
  end if;

  if current_target_role = 'coordinator'::public.app_role then
    raise exception 'Coordinator roles cannot be changed through this workflow.';
  end if;

  if current_target_role = 'advisor'::public.app_role
     and new.requested_role = 'student'::public.app_role
     and exists (
       select 1
       from public.internships i
       where i.advisor_id = new.target_profile_id
     ) then
    raise exception 'Remove advisor assignments before changing this profile back to student.';
  end if;

  new.previous_role := current_target_role;

  update public.profiles p
  set role = new.requested_role
  where p.id = new.target_profile_id;

  return new;
end;
$$;

revoke all on function private.apply_profile_role_change_request()
from public, anon, authenticated;

create trigger profile_role_change_requests_apply
before insert on public.profile_role_change_requests
for each row
execute function private.apply_profile_role_change_request();
