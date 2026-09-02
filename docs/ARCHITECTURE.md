# StageTrack — Arquitetura Inicial

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Vercel

## Estratégia

O StageTrack será inicialmente uma aplicação web responsiva em um único projeto Next.js. O Firebase fornecerá autenticação, persistência e armazenamento de arquivos. O MVP não terá backend separado.

```text
Next.js
   ↓
Firebase SDK
   ├── Authentication
   ├── Firestore
   └── Storage
```

## Estrutura sugerida

```text
stagetrack/
├── .github/
│   └── workflows/
├── docs/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── schemas/
│   ├── services/
│   ├── types/
│   └── utils/
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .firebaserc
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

Chamadas ao Firestore não devem ficar espalhadas pela interface. Serviços/repositories concentrarão operações como:

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

## Coleções iniciais

```text
/users/{userId}
/courses/{courseId}
/internshipTypes/{internshipTypeId}
/organizations/{organizationId}
/supervisors/{supervisorId}
/internships/{internshipId}
/activityLogs/{activityLogId}
```

Coleções futuras:

```text
/documents
/notifications
/auditLogs
```

## Modelos principais

### User

```text
id
name
email
role
courseId
registrationNumber
createdAt
updatedAt
```

### Internship

```text
id
studentId
internshipTypeId
organizationId
supervisorId
advisorId
startDate
expectedEndDate
requiredMinutes
status
createdAt
updatedAt
```

### ActivityLog

```text
id
internshipId
studentId
date
startTime
endTime
durationMinutes
classGroup
teacherName
description
notes
status
advisorComment
createdAt
updatedAt
```

## Tempo e carga horária

A fonte de verdade para duração será `durationMinutes`, nunca horas decimais.

Exemplo:

```text
13:00 → 17:30 = 270 minutos
```

Horas cumpridas, horas restantes e percentual serão valores derivados dos registros.

## Autenticação

O UID do Firebase Authentication será utilizado como ID do documento do usuário no Firestore:

```text
Firebase Authentication
       ↓
      UID
       ↓
/users/{uid}
```

## Segurança

A interface não será considerada uma barreira de segurança. As regras do Firestore deverão impedir acesso cruzado entre alunos e preparar autorização para orientadores e coordenação.

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

Testes automatizados serão adicionados progressivamente, priorizando cálculos, regras e fluxos críticos.

## Convenções Git

Conventional Commits:

```text
feat: add internship creation flow
fix: prevent invalid activity duration
docs: update product requirements
refactor: isolate firestore repository
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
