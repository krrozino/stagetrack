create table public.academic_institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  acronym text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_institutions_name_length
    check (char_length(btrim(name)) between 2 and 160),
  constraint academic_institutions_acronym_length
    check (
      acronym is null
      or char_length(btrim(acronym)) between 1 and 30
    )
);

create unique index academic_institutions_name_unique_idx
  on public.academic_institutions (lower(btrim(name)));

comment on table public.academic_institutions is
  'Academic institutions that own courses in the StageTrack catalog.';

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  academic_institution_id uuid not null
    references public.academic_institutions(id) on delete restrict,
  name text not null,
  code text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_name_length
    check (char_length(btrim(name)) between 2 and 160),
  constraint courses_code_length
    check (
      code is null
      or char_length(btrim(code)) between 1 and 40
    )
);

create index courses_academic_institution_id_idx
  on public.courses (academic_institution_id);

create unique index courses_institution_name_unique_idx
  on public.courses (academic_institution_id, lower(btrim(name)));

create unique index courses_institution_code_unique_idx
  on public.courses (academic_institution_id, lower(btrim(code)))
  where code is not null;

comment on table public.courses is
  'Courses offered by an academic institution.';

create table public.internship_types (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  name text not null,
  description text,
  required_minutes integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint internship_types_name_length
    check (char_length(btrim(name)) between 2 and 160),
  constraint internship_types_description_length
    check (description is null or char_length(description) <= 4000),
  constraint internship_types_required_minutes_positive
    check (required_minutes > 0)
);

create index internship_types_course_id_idx
  on public.internship_types (course_id);

create unique index internship_types_course_name_unique_idx
  on public.internship_types (course_id, lower(btrim(name)));

comment on table public.internship_types is
  'Configured internship or practicum components and their required workload.';
comment on column public.internship_types.required_minutes is
  'Required workload stored in whole minutes.';

alter table public.profiles
  add column course_id uuid
    references public.courses(id) on delete restrict;

create index profiles_course_id_idx
  on public.profiles (course_id);

comment on column public.profiles.course_id is
  'Current academic course selected by the user profile.';

create function public.set_catalog_updated_at()
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

create trigger academic_institutions_set_updated_at
before update on public.academic_institutions
for each row
execute function public.set_catalog_updated_at();

create trigger courses_set_updated_at
before update on public.courses
for each row
execute function public.set_catalog_updated_at();

create trigger internship_types_set_updated_at
before update on public.internship_types
for each row
execute function public.set_catalog_updated_at();

revoke all on function public.set_catalog_updated_at()
from public, anon, authenticated;

a lter table public.academic_institutions enable row level security;
alter table public.courses enable row level security;
alter table public.internship_types enable row level security;

revoke all on table public.academic_institutions
from public, anon, authenticated;
revoke all on table public.courses
from public, anon, authenticated;
revoke all on table public.internship_types
from public, anon, authenticated;

grant select on table public.academic_institutions to authenticated;
grant select on table public.courses to authenticated;
grant select on table public.internship_types to authenticated;

grant select, insert, update, delete
  on table public.academic_institutions to service_role;
grant select, insert, update, delete
  on table public.courses to service_role;
grant select, insert, update, delete
  on table public.internship_types to service_role;

revoke update on table public.profiles from authenticated;
grant update (full_name, registration_number, course_id)
  on table public.profiles to authenticated;

create policy academic_institutions_select_authenticated
on public.academic_institutions
for select
to authenticated
using ((select auth.uid()) is not null);

create policy courses_select_authenticated
on public.courses
for select
to authenticated
using ((select auth.uid()) is not null);

create policy internship_types_select_authenticated
on public.internship_types
for select
to authenticated
using ((select auth.uid()) is not null);
