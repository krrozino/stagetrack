# StageTrack — Supabase Development Setup

## Objetivo

O ambiente de desenvolvimento utiliza Supabase para PostgreSQL, Authentication e Storage.

## Projeto de desenvolvimento

Projeto criado:

```text
name: stagetrack-dev
project ref: xcxdhmxgmxyrjumwlvpk
region: sa-east-1 (São Paulo)
project URL: https://xcxdhmxgmxyrjumwlvpk.supabase.co
```

O projeto foi criado no plano Free e validado como `ACTIVE_HEALTHY`.

Produção deverá utilizar um projeto separado quando o produto chegar a essa fase.

## Plano inicial

O MVP deve permanecer compatível com o plano Free. Não habilitar add-ons pagos sem decisão explícita do projeto.

Limites relevantes do plano gratuito devem ser acompanhados no dashboard do Supabase, especialmente database size, egress e file storage.

## Variáveis da aplicação

Obtenha a Publishable Key no painel do projeto e crie `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xcxdhmxgmxyrjumwlvpk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

`.env.local` não deve ser commitado.

A publishable key pode ser utilizada no cliente quando as tabelas estão corretamente protegidas por RLS. Chaves secret/service-role nunca devem usar prefixo `NEXT_PUBLIC_` e nunca devem ser expostas ao browser.

## Clientes Next.js

A aplicação possui dois entrypoints:

```text
src/lib/supabase/client.ts
src/lib/supabase/server.ts
```

- `client.ts`: Client Components/browser.
- `server.ts`: Server Components, Server Actions e Route Handlers.

A autenticação SSR será completada na STG-004.

## Database migrations

Mudanças de schema serão versionadas em:

```text
supabase/migrations/
```

As migrations serão a fonte reproduzível da estrutura do banco. Tabelas, constraints, índices e políticas RLS não devem depender somente de alterações manuais feitas pelo dashboard.

## Segurança

Toda tabela exposta para usuários autenticados deverá ter RLS habilitado antes de uso real.

Princípio inicial:

```text
sem política explícita = sem acesso
```

Políticas específicas serão adicionadas junto das tabelas e funcionalidades correspondentes.

Nunca utilizar `user_metadata` como fonte de autorização. Perfis e permissões deverão ser persistidos em dados controlados pela aplicação e protegidos por RLS.

## Validação realizada

A conexão ao PostgreSQL do projeto foi validada em 2026-09-01 através de uma consulta real ao banco.

O schema `public` começou vazio, como esperado. Nenhuma tabela de domínio foi criada antes da definição das migrations do StageTrack.

## Próximas etapas

1. configurar `.env.local` nos ambientes de desenvolvimento;
2. implementar autenticação e sessão SSR;
3. criar a migration do modelo de usuários/perfis;
4. habilitar RLS desde a primeira tabela;
5. iniciar a STG-004.
