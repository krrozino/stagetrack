with institution as (
  insert into public.academic_institutions (name, acronym)
  values ('Universidade Federal Fluminense', 'UFF')
  on conflict ((lower(btrim(name)))) do update
    set acronym = excluded.acronym,
        active = true
  returning id
), institution_id as (
  select id from institution
  union all
  select id from public.academic_institutions
  where lower(btrim(name)) = lower(btrim('Universidade Federal Fluminense'))
  limit 1
), course as (
  insert into public.courses (academic_institution_id, name, code)
  select id, 'Licenciatura em Computação', 'LCOMP' from institution_id
  on conflict (academic_institution_id, (lower(btrim(name)))) do update
    set active = true
  returning id
), course_id as (
  select id from course
  union all
  select c.id
  from public.courses c
  join institution_id i on i.id = c.academic_institution_id
  where lower(btrim(c.name)) = lower(btrim('Licenciatura em Computação'))
  limit 1
)
insert into public.internship_types (
  course_id,
  name,
  description,
  required_minutes
)
select
  id,
  'PPE 2 — Ensino Fundamental',
  'Componente piloto para acompanhamento de prática/estágio no Ensino Fundamental.',
  3000
from course_id
on conflict (course_id, (lower(btrim(name)))) do update
  set description = excluded.description,
      required_minutes = excluded.required_minutes,
      active = true;
