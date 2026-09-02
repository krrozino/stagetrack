# StageTrack — Arquitetura

## Stack atual

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zod
- PostgreSQL (Supabase)
- Supabase Auth
- `@supabase/ssr`
- Row Level Security (RLS)
- GitHub Actions
- Vercel como plataforma de hospedagem planejada

Supabase Storage entra quando o módulo de documentos for implementado. Bibliotecas adicionais de formulários só serão incorporadas se a complexidade dos próximos fluxos justificar a dependência; os fluxos atuais usam Server Actions e recursos nativos do React.

## Estratégia

O StageTrack é uma aplicação web responsiva em um único projeto Next.js. O Supabase fornece PostgreSQL, autenticação e Data API. O MVP não possui um backend separado.

```text
Browser
   ↓
Next.js App Router
   ├── Server Components / Server Actions
   └── Client Components quando necessário
          ↓
      Supabase SSR / SDK
          ├── Auth
          └── PostgreSQL + RLS
```

O domínio é fortemente relacional. PostgreSQL representa relações entre alunos, cursos, estágios, instituições, supervisores, orientadores, atividades e documentos com foreign keys, constraints e índices.

## Estrutura do repositório

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
│   ├── lib/
│   │   └── supabase/
│   └── types/
├── .env.example
└── README.md
```

## Organização por domínio

A aplicação evita concentrar regras em componentes de página. Funcionalidades são agrupadas por domínio:

```text
src/features/
├── auth/
├── users/
├── navigation/
├── dashboard/
├── internships/       # Sprint 1
├── internship-types/  # Sprint 1
├── organizations/     # Sprint 1
├── supervisors/       # Sprint 1
└── activities/        # Sprint 2
```

Cada domínio pode conter `components`, `repositories`, `services`, `schemas`, `types`, `config` e utilitários conforme necessidade real.

## Acesso a dados

Chamadas ao Supabase não devem ficar espalhadas pela interface. Repositories concentram operações de domínio.

Exemplo de direção para Sprint 1/2:

```text
internshipRepository
- createInternship()
- getInternship()
- getStudentInternships()
- getCurrentInternship()
- updateInternship()

activityRepository
- createActivity()
- updateActivity()
- deleteActivity()
- getInternshipActivities()
```

A autorização nunca dependerá apenas desses repositories: o PostgreSQL também aplica RLS para impedir acesso indevido mesmo em chamadas diretas à Data API.

## Estado atual do banco

### `profiles`

Implementada e ligada 1:1 ao Supabase Auth:

```text
id                  UUID PK / FK auth.users.id
full_name           text
role                app_role
registration_number text nullable
created_at          timestamptz
updated_at          timestamptz
```

Papéis disponíveis:

```text
student
advisor
coordinator
```

O usuário não possui privilégio para promover o próprio `role`.

## Schema planejado para Sprint 1

A Sprint 1 adicionará de forma incremental:

```text
academic_institutions
courses
internship_types
organizations
supervisors
internships
```

`profiles.course_id` será adicionado quando `courses` existir.

Tabelas posteriores:

```text
activity_logs  # Sprint 2
documents      # Sprint 4
notifications  # pós-MVP / quando necessário
audit_logs     # evolução institucional
```

## Relações-alvo do núcleo

```text
auth.users
    │
    └── profiles
          │
          ├── course
          │     └── academic_institution
          │
          └── internships
                ├── internship_type
                ├── organization
                │     └── supervisors
                ├── advisor (profiles, futuro)
                ├── activity_logs (Sprint 2)
                └── documents (Sprint 4)
```

IDs de domínio utilizam UUIDs. Relações devem ser protegidas por foreign keys sempre que aplicável.

## Modelo-alvo de estágio

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

Status previstos:

```text
draft
active
paused
completed
cancelled
```

`required_minutes` será um snapshot da modalidade selecionada para preservar o histórico caso a configuração acadêmica seja alterada no futuro.

## Modelo-alvo de atividade

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

A fonte de verdade para duração é minuto inteiro, nunca hora decimal.

```text
13:00 → 17:30 = 270 minutos
```

Horas cumpridas, horas restantes e percentual são valores derivados dos registros. Constraints e validações de aplicação devem impedir durações inválidas.

## Autenticação e sessão

Supabase Auth é responsável por cadastro, login, logout, recuperação de senha e sessão.

```text
Supabase Auth
   ↓
auth.users.id
   ↓
public.profiles.id
```

O cliente Supabase server-side é criado por requisição. `cookies()` é lido antes do uso do cliente para manter o contexto request-bound no Next.js.

### Proteção de rotas

A proteção usa duas camadas:

```text
Request
  ↓
Next.js Proxy + auth.getClaims()
  ↓
layout (protected) + auth.getClaims()
  ↓
Página privada
```

`auth.getSession()` não é usado como prova de identidade no servidor.

Rotas autenticadas são `force-dynamic` para evitar ISR/cache compartilhado de conteúdo dependente de sessão.

Detalhes adicionais ficam em [`AUTHENTICATION.md`](./AUTHENTICATION.md).

## Segurança de dados

A interface não é considerada uma barreira de segurança.

Tabelas expostas pela Data API utilizam Row Level Security e grants mínimos.

Princípios:

- aluno acessa apenas os próprios dados quando a entidade é pessoal;
- dados de catálogo terão leitura controlada e mutação administrativa;
- orientador acessará apenas estudantes vinculados quando essa função existir;
- coordenação acessará apenas seu contexto institucional quando essa função existir;
- operações administrativas não usam chaves privilegiadas no navegador;
- `service_role`/secret keys nunca entram em variáveis `NEXT_PUBLIC_*`.

Após alterações DDL, security e performance advisors do Supabase devem ser revisados.

## Migrations

Mudanças de schema são versionadas em `supabase/migrations`.

Isso inclui:

- tabelas;
- foreign keys;
- constraints;
- índices;
- enums;
- funções/triggers;
- grants;
- políticas RLS.

Evitar alterações manuais no banco que não sejam reproduzíveis por migration.

## Rotas

Públicas:

```text
/
/login
/register
/forgot-password
/reset-password
/auth/callback
/auth/confirm
```

Privadas:

```text
/dashboard
/internships
/internships/*
/activities
/profile
```

## Dashboard

O dashboard já possui um `DashboardViewModel` desacoplado da fonte de dados. Enquanto não existe estágio persistido, a página utiliza um modelo vazio honesto. Na STG-019, a fonte será substituída por queries reais sem reescrever os componentes visuais.

## Qualidade

Antes de mergear funcionalidades relevantes:

```text
npm ci
npm run lint
npm run typecheck
npm run build
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
