# StageTrack — Roadmap

## Objetivo do roadmap

Evoluir o StageTrack em ciclos pequenos e verificáveis, priorizando um primeiro produto realmente utilizável por estudantes antes de adicionar recursos institucionais mais complexos.

Cada etapa relevante deve preservar três princípios:

1. regras de negócio explícitas;
2. autorização também aplicada no PostgreSQL com RLS;
3. mudanças pequenas, versionadas e validadas pela CI.

---

## Sprint 0 — Foundation

**Status da engenharia: concluída.**

Objetivo: preparar uma fundação técnica segura e reutilizável para o produto.

### Entregue

- [x] aplicação Next.js App Router;
- [x] estrutura por domínio;
- [x] PostgreSQL no Supabase;
- [x] Supabase Auth;
- [x] sessão SSR com `@supabase/ssr`;
- [x] cadastro, login, logout e recuperação de senha;
- [x] tabela `profiles` ligada a `auth.users`;
- [x] papéis `student`, `advisor` e `coordinator`;
- [x] RLS e grants de menor privilégio para perfis;
- [x] migrations versionadas;
- [x] tipos TypeScript gerados do schema real;
- [x] Proxy de renovação/validação de sessão;
- [x] proteção server-side das rotas privadas;
- [x] layout autenticado responsivo;
- [x] navegação desktop/mobile com rota ativa;
- [x] dashboard estrutural com estados vazios;
- [x] documentação-base;
- [x] CI com `npm ci`, lint, typecheck e build.

### Definition of Done de engenharia

A fundação é considerada pronta porque:

- o build de produção passa de forma reproduzível;
- cadastro e login possuem implementação completa;
- conteúdo privado exige claims válidas;
- perfil possui persistência e autorização no banco;
- alterações de schema são reproduzíveis por migration;
- nenhuma chave privilegiada é necessária no navegador;
- documentação e CI estão versionadas.

### Release gate ainda pendente

O StageTrack ainda não possui projeto hospedado na Vercel.

A **STG-020 — Configurar deploy de desenvolvimento na Vercel** fecha essa pendência externa e será necessária antes da validação end-to-end dos fluxos da Sprint 1.

---

## Sprint 1 — Internship Foundation

**Status: em andamento.**

Objetivo: permitir ao estudante cadastrar, visualizar e começar a acompanhar um estágio real.

### Sequência planejada

#### STG-013 — Catálogo acadêmico base

- instituições de ensino;
- cursos;
- modalidades/componentes de estágio;
- carga obrigatória em minutos;
- vínculo de perfil com curso;
- RLS de leitura do catálogo.

#### STG-014 — Concedentes e supervisores

- instituições concedentes;
- supervisores;
- integridade referencial;
- políticas de acesso aos dados.

#### STG-015 — Modelo de estágio e RLS

- entidade `internships`;
- status `draft`, `active`, `paused`, `completed`, `cancelled`;
- vínculos com aluno, modalidade, concedente e supervisor;
- snapshot protegido de carga obrigatória;
- datas e constraints;
- políticas RLS do aluno.

#### STG-016 — Repository de estágios

- criação;
- leitura por ID;
- listagem do histórico;
- estágio atual;
- atualização de campos autorizados.

#### STG-017 — Cadastro do estágio

- formulário responsivo;
- catálogo acadêmico;
- concedente e supervisor;
- datas;
- criação segura pelo repository.

#### STG-018 — Meu Estágio

- visualização do estágio atual;
- status;
- carga horária obrigatória;
- organização e supervisor;
- histórico e estados vazios.

#### STG-019 — Dashboard com estágio real

- substituir o `DashboardViewModel` vazio por dados persistidos;
- carga mínima e horas restantes reais;
- progresso inicial;
- preservar o estado sem estágio.

### Definition of Done

A Sprint 1 estará concluída quando o estudante conseguir:

```text
Criar conta
   ↓
Entrar na área privada
   ↓
Cadastrar seu estágio
   ↓
Visualizar o estágio salvo
   ↓
Ver carga mínima e contexto real no dashboard
```

Ainda não haverá soma de horas realizadas porque essa responsabilidade começa na Sprint 2.

---

## Sprint 2 — Activity Tracking

Objetivo: tornar o StageTrack utilizável no dia a dia do estágio.

- modelo `activity_logs`;
- registro de data, início, fim e descrição;
- cálculo automático de duração;
- armazenamento da duração em minutos;
- histórico cronológico;
- edição e exclusão conforme regras;
- soma das horas;
- horas restantes;
- percentual de conclusão;
- integração completa com o dashboard.

### Primeiro grande marco — Student MVP

Ao final da Sprint 2, o aluno deverá conseguir:

```text
Criar conta
   ↓
Cadastrar estágio
   ↓
Registrar atividades
   ↓
Acompanhar horas
   ↓
Visualizar progresso
```

Esse marco será chamado de **StageTrack Student MVP**.

---

## Sprint 3 — Academic Tracking

- professor orientador;
- vínculo aluno/orientador;
- lista de orientandos;
- envio de registros para análise;
- aprovação e rejeição;
- comentários do orientador;
- carga registrada x carga validada.

## Sprint 4 — Documents

- documentos obrigatórios;
- Supabase Storage;
- upload;
- status;
- revisão;
- pendências.

## Sprint 5 — Reports

- relatório cronológico de atividades;
- resumo de carga horária;
- ficha de frequência;
- exportação em PDF.

## Sprint 6 — Coordination

- dashboard institucional;
- filtros;
- alunos em risco;
- estágios ativos e concluídos;
- gestão de cursos e modalidades;
- configurações por instituição.

---

## Pós-1.0

Possibilidades futuras:

- previsão inteligente de conclusão;
- notificações;
- calendário;
- geração assistida de relatórios com IA;
- assinatura digital;
- integração com sistemas acadêmicos;
- múltiplas instituições de ensino;
- PWA e experiência mobile aprimorada.
