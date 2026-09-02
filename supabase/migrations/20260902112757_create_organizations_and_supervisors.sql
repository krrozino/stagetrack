create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  document text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_name_length
    check (char_length(btrim(name)) between 2 and 160),
  constraint organizations_document_length
    check (
      document is null
      or char_length(btrim(document)) between 1 and 40
    ),
  constraint organizations_email_length
    check (
      email is null
      or char_length(btrim(email)) between 3 and 254
    ),
  constraint organizations_phone_length
    check (
      phone is null
      or char_length(btrim(phone)) between 1 and 40
    ),
  constraint organizations_address_length
    check (
      address is null
      or char_length(btrim(address)) between 1 and 500
    ),
  constraint organizations_city_length
    check (
      city is null
      or char_length(btrim(city)) between 1 and 120
    ),
  constraint organizations_state_length
    check (
      state is null
      or char_length(btrim(state)) between 1 and 120
    ),
  constraint organizations_postal_code_length
    check (
      postal_code is null
      or char_length(btrim(postal_code)) between 1 and 30
    )
);

create unique index organizations_document_unique_idx
  on public.organizations (lower(btrim(document)))
  where document is not null;

create index organizations_created_by_idx
  on public.organizations (created_by);

create index organizations_name_search_idx
  on public.organizations (lower(btrim(name)));

comment on table public.organizations is
  'Host organizations where students perform internships or supervised practica.';
comment on column public.organizations.created_by is
  'User who originally registered the organization. Hidden from normal client reads.';

create table public.supervisors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  position text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supervisors_name_length
    check (char_length(btrim(name)) between 2 and 160),
  constraint supervisors_email_length
    check (
      email is null
      or char_length(btrim(email)) between 3 and 254
    ),
  constraint supervisors_phone_length
    check (
      phone is null
      or char_length(btrim(phone)) between 1 and 40
    ),
  constraint supervisors_position_length
    check (
      position is null
      or char_length(btrim(position)) between 1 and 160
    )
);

create index supervisors_organization_id_idx
  on public.supervisors (organization_id);

create index supervisors_created_by_idx
  on public.supervisors (created_by);

create index supervisors_owner_organization_idx
  on public.supervisors (created_by, organization_id);

comment on table public.supervisors is
  'Internship supervisors registered by individual StageTrack users.';
comment on column public.supervisors.created_by is
  'Owner of this private supervisor contact record.';

create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function public.set_catalog_updated_at();

create trigger supervisors_set_updated_at
before update on public.supervisors
for each row
execute function public.set_catalog_updated_at();

alter table public.organizations enable row level security;
alter table public.supervisors enable row level security;

revoke all on table public.organizations
from public, anon, authenticated;
revoke all on table public.supervisors
from public, anon, authenticated;

grant select (
  id,
  name,
  document,
  email,
  phone,
  address,
  city,
  state,
  postal_code,
  created_at,
  updated_at
) on public.organizations to authenticated;

grant insert (
  created_by,
  name,
  document,
  email,
  phone,
  address,
  city,
  state,
  postal_code
) on public.organizations to authenticated;

grant update (
  name,
  document,
  email,
  phone,
  address,
  city,
  state,
  postal_code
) on public.organizations to authenticated;

grant select (
  id,
  organization_id,
  name,
  email,
  phone,
  position,
  created_at,
  updated_at
) on public.supervisors to authenticated;

grant insert (
  organization_id,
  created_by,
  name,
  email,
  phone,
  position
) on public.supervisors to authenticated;

grant update (
  organization_id,
  name,
  email,
  phone,
  position
) on public.supervisors to authenticated;

grant select, insert, update, delete
  on public.organizations to service_role;
grant select, insert, update, delete
  on public.supervisors to service_role;

create policy organizations_select_authenticated
on public.organizations
for select
to authenticated
using ((select auth.uid()) is not null);

create policy organizations_insert_own
on public.organizations
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = created_by
);

create policy organizations_update_own
on public.organizations
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = created_by
)
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = created_by
);

create policy supervisors_select_own
on public.supervisors
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = created_by
);

create policy supervisors_insert_own
on public.supervisors
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = created_by
);

create policy supervisors_update_own
on public.supervisors
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = created_by
)
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = created_by
);
