-- Initial role-management RPC. This migration is immediately superseded by
-- 20260902233338_replace_advisor_role_rpc_with_requests.sql, which removes
-- the public SECURITY DEFINER RPC in favor of an auditable request table and
-- a private trigger.
create or replace function public.set_profile_advisor_role(
  target_profile_id uuid,
  target_role public.app_role
)
returns table (
  id uuid,
  full_name text,
  role public.app_role
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  current_target_role public.app_role;
begin
  if actor_id is null then
    raise exception 'Authenticated user is required.';
  end if;

  select p.role
    into actor_role
  from public.profiles p
  where p.id = actor_id;

  if actor_role <> 'coordinator'::public.app_role then
    raise exception 'Coordinator role is required.';
  end if;

  if target_profile_id = actor_id then
    raise exception 'Coordinators cannot change their own role.';
  end if;

  if target_role not in (
    'student'::public.app_role,
    'advisor'::public.app_role
  ) then
    raise exception 'Only student and advisor roles can be managed here.';
  end if;

  select p.role
    into current_target_role
  from public.profiles p
  where p.id = target_profile_id
  for update;

  if not found then
    raise exception 'Target profile does not exist.';
  end if;

  if current_target_role = 'coordinator'::public.app_role then
    raise exception 'Coordinator roles cannot be changed through this workflow.';
  end if;

  if current_target_role = 'advisor'::public.app_role
     and target_role = 'student'::public.app_role
     and exists (
       select 1
       from public.internships i
       where i.advisor_id = target_profile_id
     ) then
    raise exception 'Remove advisor assignments before changing this profile back to student.';
  end if;

  update public.profiles p
  set role = target_role
  where p.id = target_profile_id;

  return query
  select p.id, p.full_name, p.role
  from public.profiles p
  where p.id = target_profile_id;
end;
$$;

revoke all on function public.set_profile_advisor_role(uuid, public.app_role)
from public, anon, authenticated;
grant execute on function public.set_profile_advisor_role(uuid, public.app_role)
to authenticated, service_role;
