# StageTrack

Sistema web para acompanhamento de estágios supervisionados obrigatórios.

O StageTrack centraliza a jornada acadêmica de estágio em um único ambiente: cadastro do estágio, instituições, supervisores, registros de atividades, carga horária, progresso, documentos e, futuramente, acompanhamento por orientadores e coordenações.

## Objetivo

Reduzir controles manuais e fragmentados, oferecendo ao estudante uma forma simples de registrar atividades e acompanhar sua carga horária, enquanto prepara uma base relacional e segura para acompanhamento acadêmico institucional.

## MVP do aluno

O primeiro grande marco do produto permitirá que um estudante:

1. crie uma conta e faça login;
2. cadastre seu estágio;
3. registre atividades realizadas;
4. acompanhe horas cumpridas e restantes;
5. consulte o histórico de registros.

Esse marco será considerado o **StageTrack Student MVP**.

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

Supabase Storage será incorporado quando o módulo de documentos entrar no roadmap.

## Estado atual

### Fundação de engenharia — concluída

A Sprint 0 já entregou:

- aplicação Next.js estruturada por domínio;
- autenticação com Supabase Auth;
- sessões SSR baseadas em cookies;
- cadastro, login, logout e recuperação de senha;
- perfil persistido em PostgreSQL;
- RLS e grants de menor privilégio para o perfil;
- proteção de rotas privadas com Proxy + validação server-side;
- layout autenticado responsivo;
- dashboard estrutural com estados vazios;
- migrations versionadas;
- tipos TypeScript gerados do banco;
- CI com `npm ci`, lint, typecheck e build.

### Sprint 1 — Internship Foundation

O desenvolvimento entra agora no núcleo funcional do produto:

```text
Catálogo acadêmico
   ↓
Concedentes e supervisores
   ↓
Modelo de estágio + RLS
   ↓
Repository
   ↓
Cadastro do estágio
   ↓
Meu Estágio
   ↓
Dashboard com dados reais
```

### Deploy

O primeiro projeto hospedado do StageTrack na Vercel ainda é uma pendência explícita do backlog (`STG-020`). O código já passa pelo build de produção na CI, mas a aplicação não deve ser considerada publicada até a conclusão dessa etapa.

## Segurança

A interface não é tratada como barreira de autorização.

- identidade server-side é validada com `auth.getClaims()`;
- dados expostos pela Data API usam Row Level Security;
- o usuário não pode promover o próprio papel (`student`, `advisor`, `coordinator`);
- chaves privilegiadas do Supabase não são expostas no navegador;
- mudanças de schema e políticas são versionadas em `supabase/migrations`.

## Qualidade

Pull requests relevantes devem passar por:

```text
npm ci
npm run lint
npm run typecheck
npm run build
```

Testes automatizados serão adicionados progressivamente, priorizando regras de negócio, cálculos e autorização.

## Documentação

- [`docs/PRODUCT_VISION.md`](./docs/PRODUCT_VISION.md) — visão de produto;
- [`docs/REQUIREMENTS.md`](./docs/REQUIREMENTS.md) — requisitos e regras de negócio;
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — decisões técnicas e estrutura;
- [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md) — autenticação, sessão e proteção de rotas;
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — evolução por sprints.
