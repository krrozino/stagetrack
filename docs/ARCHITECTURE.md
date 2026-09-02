# StageTrack — Arquitetura Inicial

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- PostgreSQL (Supabase)
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)
- Vercel

## Estratégia

O StageTrack será inicialmente uma aplicação web responsiva em um único projeto Next.js. O Supabase fornecerá PostgreSQL, autenticação, armazenamento de arquivos e APIs de acesso aos dados. O MVP não terá um backend separado.

```text
Next.js
   ↓
Supabase SDK / SSR
   ├── Auth
   ├── PostgreSQL
   └── Storage
```

O domínio é fortemente relacional. PostgreSQL será usado para representar relações entre alunos, cursos, estágios, instituições, supervisores, orientadores, atividades e documentos com foreign keys e constraints.

## Estrutura sugerida

```text
stagetrack/
├── .github/
│   └── workflows/
├── docs/
├── public/
├── supabase/
│   └── migrations/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   │   └── supabase/
│   ├── schemas/
│   ├── services/
│   ├── types/
│   └── utils/
├── .env.example
└── README.md
```

## Organização por domínio

```text
src/features/
├── auth/
├── users/
├── internships/
├── internship-types/
├── organizations/
├── supervisors/
└── activities/
```

Cada domínio poderá conter seus próprios `components`, `services`, `schemas`, `types`, `hooks` e `utils` quando necessário.

## Acesso a dados

Chamadas ao Supabase não devem ficar espalhadas pela interface. Serviços/repositories concentrarão operações de domínio.

```text
internshipRepository
- createInternship()
- getInternship()
- getStudentInternships()
- updateInternship()

activityRepository
- createActivity()
- updateActivity()
- deleteActivity()
- getInternshipActivities()
```

A autorização não dependerá desses repositories: o PostgreSQL também aplicará RLS para impedir acesso indevido mesmo em chamadas diretas à Data API.

## Tabelas iniciais

```text
profiles
courses
internship_types
organizations
supervisors
internships
activity_logs
```

Tabelas futuras:

```text
documents
notifications
audit_logs
```

## Relações principais

```text
auth.users
    │
    └── profiles
          │
          ├── courses
          │
          └── internships
                ├── internship_types
                ├── organizations
                │     └── supervisors
                ├── advisor (profiles)
                ├── activity_logs
                └── documents
```

IDs de domínio utilizarão UUIDs. Relações serão protegidas por foreign keys sempre que aplicável.

## Modelos principais

### Profile

```text
id (FK auth.users.id)
name
role
course_id
registration_number
created_at
updated_at
```

### Internship

```text
id
student_id
internship_type_id
organization_id
supervisor_id
advisor_id
start_date
expected_end_date
required_minutes
status
created_at
updated_at
```

### ActivityLog

```text
id
internship_id
student_id
date
start_time
end_time
duration_minutes
class_group
teacher_name
description
notes
status
advisor_comment
created_at
updated_at
```

## Tempo e carga horária

A fonte de verdade para duração será `duration_minutes`, nunca horas decimais.

```text
13:00 → 17:30 = 270 minutos
```

Horas cumpridas, horas restantes e percentual serão valores derivados dos registros. Constraints e validações de aplicação devem impedir durações inválidas.

## Autenticação

Supabase Auth será responsável por cadastro, login, logout, recuperação de senha e sessão.

O usuário autenticado existe em `auth.users`. Dados acadêmicos e de perfil ficarão em `public.profiles`, usando o mesmo UUID:

```text
Supabase Auth
   ↓
auth.users.id
   ↓
public.profiles.id
```

## Segurança

A interface não será considerada uma barreira de segurança.

As tabelas expostas pela Data API utilizarão Row Level Security. Políticas iniciais seguirão o princípio de menor privilégio:

- aluno acessa apenas os próprios dados;
- orientador acessa apenas estudantes vinculados quando essa função existir;
- coordenação acessa apenas seu contexto institucional;
- operações administrativas não usam chaves privilegiadas no navegador.

A `service_role`/secret key nunca deverá ser exposta em variáveis `NEXT_PUBLIC_*`.

## Migrations

Mudanças de schema deverão ser versionadas em `supabase/migrations`.

Isso inclui:

- tabelas;
- foreign keys;
- constraints;
- índices;
- funções/triggers quando necessários;
- políticas RLS.

Evitar alterações manuais no banco que não sejam reproduzíveis por migration.

## Rotas iniciais

Públicas:

```text
/
/login
/register
/forgot-password
```

Privadas:

```text
/dashboard
/internships
/internships/*
/activities
/profile
```

## Qualidade

Antes de mergear funcionalidades relevantes:

```text
lint
typecheck
build
```

Testes automatizados serão adicionados progressivamente, priorizando cálculos, regras, autorização e fluxos críticos.

## Convenções Git

Conventional Commits:

```text
feat: add internship creation flow
fix: prevent invalid activity duration
docs: update product requirements
refactor: isolate internship repository
test: add duration calculation tests
```

Branches:

```text
feat/*
fix/*
docs/*
refactor/*
test/*
```
