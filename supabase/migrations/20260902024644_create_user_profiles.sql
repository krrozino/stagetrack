create type public.app_role as enum ('student', 'advisor', 'coordinator');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'student',
  registration_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length
    check (char_length(btrim(full_name)) between 2 and 120),
  constraint profiles_registration_number_length
    check (
      registration_number is null
      or char_length(btrim(registration_number)) between 1 and 50
    )
);

comment on table public.profiles is
  'Application profile linked one-to-one with Supabase Auth users.';
comment on column public.profiles.role is
  'Authorization role. Client-created profiles always start as student.';

create function public.set_profile_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profile_updated_at();

revoke all on function public.set_profile_updated_at()
from public, anon, authenticated;

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, full_name, registration_number)
  on table public.profiles to authenticated;
grant update (full_name, registration_number)
  on table public.profiles to authenticated;
grant select, insert, update, delete
  on table public.profiles to service_role;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = id
);

create policy profiles_insert_own_as_student
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = id
  and role = 'student'::public.app_role
);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = id
)
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = id
);
