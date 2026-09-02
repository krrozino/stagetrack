# StageTrack — Supabase Development Setup

## Objetivo

O ambiente de desenvolvimento utiliza Supabase para PostgreSQL, Authentication e Storage.

## Plano inicial

O MVP deve permanecer compatível com o plano Free. Não habilitar add-ons pagos sem decisão explícita do projeto.

Limites relevantes do plano gratuito devem ser acompanhados no dashboard do Supabase, especialmente database size, egress e file storage.

## Criar projeto

1. Crie um novo projeto Supabase para desenvolvimento.
2. Use um nome identificável, por exemplo `stagetrack-dev`.
3. Escolha uma região disponível adequada aos usuários do projeto.
4. Guarde a senha do banco fora do repositório.

Produção deverá utilizar um projeto separado quando o produto chegar a essa fase.

## Variáveis da aplicação

No painel do projeto, obtenha o Project URL e a Publishable Key.

Crie `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

`.env.local` não deve ser commitado.

A publishable key pode ser utilizada no cliente quando as tabelas estão corretamente protegidas por RLS. Chaves secret/service-role nunca devem usar prefixo `NEXT_PUBLIC_`.

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

## Próximas etapas

Depois que o projeto Supabase real existir:

1. preencher `.env.local`;
2. validar conexão;
3. configurar autenticação por e-mail/senha;
4. iniciar migrations do modelo de usuários;
5. implementar o fluxo de autenticação da STG-004.
