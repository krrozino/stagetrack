# Firebase — Ambiente de Desenvolvimento

## Objetivo

O StageTrack utiliza Firebase Authentication, Cloud Firestore e Firebase Storage. O projeto Firebase de desenvolvimento deve ser separado de qualquer ambiente futuro de produção.

## Projeto recomendado

Crie um projeto no Firebase Console com nome visível semelhante a:

`StageTrack Dev`

O `projectId` precisa ser globalmente único; use o identificador gerado/disponível no console.

## Região

Para o ambiente brasileiro, a região recomendada para o Cloud Firestore é:

`southamerica-east1` — São Paulo

A localização do Firestore não pode ser tratada como uma decisão temporária, portanto confirme a região antes da criação do banco.

## Serviços a habilitar

1. Authentication
   - habilitar provedor Email/Password;
2. Cloud Firestore
   - criar banco em modo seguro/produção;
   - região `southamerica-east1`;
3. Storage
   - criar bucket vinculado ao projeto;
4. Web App
   - registrar uma aplicação web para obter a configuração pública do SDK.

## Variáveis locais

Copie:

```bash
cp .env.example .env.local
```

Preencha com os valores da aplicação web do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Esses valores identificam a aplicação web; autorização real deve continuar sendo aplicada por Firebase Authentication, Firestore Rules e Storage Rules.

## Firebase CLI

Depois que o projeto real existir, vincule o repositório ao project ID usando o Firebase CLI e versione o `.firebaserc` gerado.

Os arquivos já presentes no repositório são:

- `firebase.json`;
- `firestore.rules`;
- `firestore.indexes.json`;
- `storage.rules`.

As regras iniciais bloqueiam todas as leituras e gravações. Permissões serão abertas de forma explícita conforme os modelos de autenticação e usuários forem implementados.

## Validação

Após preencher `.env.local`, a aplicação deve conseguir inicializar:

- Firebase App;
- Authentication;
- Firestore;
- Storage.

Nenhuma credencial privada, chave de service account ou arquivo `.env.local` deve ser commitado.
