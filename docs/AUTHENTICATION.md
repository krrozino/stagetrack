# StageTrack — Autenticação

## Estratégia

O StageTrack utiliza Supabase Auth com sessões SSR baseadas em cookies através de `@supabase/ssr`.

A autenticação é separada em três responsabilidades:

```text
UI / Server Actions
       ↓
features/auth
       ↓
Supabase browser/server clients
       ↓
Supabase Auth
```

As telas não devem chamar métodos de autenticação diretamente. Operações de domínio ficam centralizadas em `src/features/auth/services/auth.service.ts`.

## Operações centralizadas

A fundação oferece:

- `register()` — cadastro com e-mail e senha;
- `login()` — login com e-mail e senha;
- `logout()` — encerramento da sessão;
- `requestPasswordReset()` — solicitação de recuperação de senha;
- `updatePassword()` — definição de uma nova senha para uma sessão de recuperação.

Os serviços retornam `AuthResult<T>`, permitindo que a interface trate sucesso e erro de forma consistente sem depender diretamente dos objetos de erro do SDK.

## Clientes Supabase

```text
src/lib/supabase/client.ts
src/lib/supabase/server.ts
```

O cliente de browser é usado apenas em Client Components quando necessário.

O cliente de servidor é criado por requisição e lê a sessão dos cookies. Ele não deve ser armazenado em estado global ou reutilizado entre usuários.

No servidor, `cookies()` é lido antes da criação/uso do cliente Supabase. Isso marca a operação como dependente da requisição no Next.js e evita que páginas autenticadas sejam tratadas como conteúdo estático durante o build.

## Renovação da sessão

O Next.js Proxy executa:

```text
proxy.ts
   ↓
src/lib/supabase/proxy.ts
   ↓
auth.getClaims()
```

`getClaims()` valida o JWT e permite que `@supabase/ssr` renove a sessão quando necessário.

Os cookies e headers de cache retornados durante a renovação são propagados para a resposta. Isso evita sessões inconsistentes e respostas autenticadas sendo cacheadas incorretamente.

Quando o Proxy precisa criar uma resposta de redirecionamento, os cookies renovados e os headers `Cache-Control`, `Expires` e `Pragma` da resposta Supabase também são copiados para o redirect.

## Autorização no servidor

Não usar `auth.getSession()` como prova de identidade ou autorização no servidor.

Para proteger páginas e dados, utilizar `auth.getClaims()` ou, quando for necessário buscar o registro mais recente do usuário no servidor de Auth, `auth.getUser()`.

A proteção de rotas utiliza defesa em profundidade:

```text
Requisição
   ↓
Next.js Proxy
   ↓  getClaims()
Validação/redirect antecipado
   ↓
Layout (protected)
   ↓  getClaims()
Revalidação server-side
   ↓
Página privada + dados protegidos por RLS
```

O Proxy reduz trabalho desnecessário ao interromper cedo acessos inválidos. O layout privado continua validando a identidade no servidor para que a segurança da área autenticada não dependa exclusivamente da configuração do Proxy.

## Política de rotas

As rotas privadas iniciais são:

```text
/dashboard
/internships
/activities
/profile
```

Sem claims válidas, qualquer uma dessas rotas redireciona para `/login`.

Usuários já autenticados que acessarem as páginas de entrada abaixo são enviados para `/dashboard`:

```text
/login
/register
/forgot-password
```

`/reset-password` é propositalmente excluída desse redirect. O fluxo de recuperação pode criar uma sessão autenticada temporária antes de o usuário definir a nova senha.

Após login ou cadastro que gere uma sessão imediatamente, a aplicação entra pela rota `/dashboard`.

O logout é executado por Server Action, encerra a sessão no Supabase e redireciona para `/login`.

## Cache de áreas autenticadas

O layout `src/app/(protected)/layout.tsx` declara:

```ts
export const dynamic = "force-dynamic";
```

Rotas dependentes de identidade não devem usar ISR ou cache compartilhável. Além da validação por requisição, respostas que renovam sessão carregam os headers de cache produzidos pelo `@supabase/ssr`.

Isso reduz o risco de conteúdo ou cookies de uma sessão serem reutilizados para outra requisição em infraestrutura com CDN ou instâncias serverless reutilizadas.

## Dados do perfil

A identidade vem do JWT validado pelo Supabase Auth. Dados de aplicação — como nome, matrícula e papel — ficam em `public.profiles` e são protegidos por Row Level Security.

O papel (`student`, `advisor`, `coordinator`) não é confiado a `user_metadata`. O fluxo público cria perfis como `student`, e promoção de papel permanece uma operação administrativa.

A rota `/profile` lê o perfil real do usuário autenticado através do repository de usuários, mantendo RLS e filtro explícito pelo UID.

## Fluxos de retorno

### PKCE callback

```text
/auth/callback
```

Recebe um `code`, executa `exchangeCodeForSession()` e salva a sessão nos cookies.

O parâmetro `next` é aceito somente como caminho relativo da própria aplicação para evitar open redirects.

### Token hash

```text
/auth/confirm
```

Recebe `token_hash` e `type` e executa `verifyOtp()`.

Essa rota deixa a aplicação preparada para templates de e-mail SSR baseados em token hash quando o projeto utilizar SMTP/template compatível.

## E-mail no ambiente Free

O projeto de desenvolvimento usa o serviço de e-mail padrão do Supabase enquanto estiver no plano Free. Esse serviço possui limitações e não deve ser tratado como infraestrutura de produção.

A aplicação não depende de customização de templates para funcionar durante a fase inicial. Quando houver domínio e ambiente de produção, SMTP próprio deverá ser avaliado.

## URLs de redirecionamento

Durante desenvolvimento, o Supabase deverá permitir URLs locais utilizadas pelo app, por exemplo:

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
```

Quando houver deploy, os domínios da Vercel/produção deverão ser adicionados à allow list antes dos testes de confirmação e recuperação de senha.

Links sensíveis iniciados pela aplicação usam `NEXT_PUBLIC_SITE_URL` em vez de construir a origem a partir do header `Host` da requisição.

## Chaves

Permitido no cliente:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Nunca expor no navegador ou versionar:

- secret keys;
- service-role keys;
- senha do banco;
- tokens de acesso administrativos.

A segurança dos dados acessíveis pelo cliente é garantida principalmente por autenticação, grants adequados e Row Level Security.

## Dependências reproduzíveis

As versões diretas do Supabase são fixadas em `package.json` e a árvore completa de dependências fica registrada em `package-lock.json`.

A CI utiliza `npm ci`, portanto qualquer divergência entre o manifesto e o lockfile deve falhar antes dos checks de qualidade.

## Estado da fundação de autenticação

- STG-004 — fundação Supabase Auth e SSR: concluída;
- STG-005 — perfil de usuário e RLS: concluída;
- STG-006 — telas e fluxos de autenticação: concluída;
- STG-007 — proteção de rotas privadas e shell autenticado: em validação.
