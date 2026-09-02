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

Os cookies e headers de cache retornados durante a renovação devem ser propagados para a resposta. Isso evita sessões inconsistentes e respostas autenticadas sendo cacheadas incorretamente.

## Autorização no servidor

Não usar `auth.getSession()` como prova de identidade ou autorização no servidor.

Para proteger páginas e dados, utilizar `auth.getClaims()` ou, quando for necessário buscar o registro de usuário mais recente no servidor de Auth, `auth.getUser()`.

A proteção efetiva das rotas privadas será implementada na STG-007. Nesta etapa o Proxy apenas mantém a sessão atualizada.

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

A aplicação não deve depender de customização de templates para funcionar durante a fase inicial. Quando houver domínio e ambiente de produção, SMTP próprio deverá ser avaliado.

## URLs de redirecionamento

Durante desenvolvimento, o Supabase deverá permitir URLs locais utilizadas pelo app, por exemplo:

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
```

Quando houver deploy, os domínios da Vercel/produção deverão ser adicionados à allow list antes dos testes de confirmação e recuperação de senha.

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

A segurança dos dados acessíveis pelo cliente será garantida principalmente por autenticação, grants adequados e Row Level Security.

## Próximas etapas

- STG-005: modelo de perfil de usuário e RLS;
- STG-006: telas de login, cadastro e recuperação;
- STG-007: proteção das rotas privadas.
