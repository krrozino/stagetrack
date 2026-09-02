# StageTrack — Roadmap Inicial

## Objetivo do roadmap

Evoluir o StageTrack em ciclos pequenos, priorizando um primeiro produto realmente utilizável por estudantes antes de adicionar recursos institucionais mais complexos.

## Sprint 0 — Foundation

Objetivo: preparar a base técnica do produto.

- inicializar aplicação Next.js;
- estruturar diretórios;
- configurar Firebase;
- implementar fundação de autenticação;
- criar modelo de usuário;
- criar telas de login, cadastro e recuperação;
- proteger rotas privadas;
- criar layout autenticado;
- criar dashboard placeholder;
- adicionar regras iniciais do Firestore;
- consolidar documentação;
- configurar CI com lint, typecheck e build.

### Definition of Done

A Sprint 0 estará concluída quando:

- aplicação rodar localmente;
- build passar;
- deploy inicial existir;
- Firebase estiver conectado;
- cadastro e login funcionarem;
- dashboard exigir autenticação;
- regras básicas do Firestore existirem;
- documentação estiver versionada;
- CI estiver executando com sucesso.

## Sprint 1 — Internship Foundation

Objetivo: permitir ao estudante cadastrar e visualizar seu estágio.

- modalidades de estágio;
- instituições;
- cadastro do estágio;
- visualização do estágio;
- status do estágio;
- dashboard com dados reais.

## Sprint 2 — Activity Tracking

Objetivo: tornar o StageTrack utilizável no dia a dia.

- registro de atividades;
- cálculo automático de duração;
- histórico de atividades;
- edição e exclusão conforme regras;
- soma das horas;
- horas restantes;
- percentual de conclusão.

### Primeiro grande marco

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

## Sprint 3 — Academic Tracking

- professor orientador;
- lista de orientandos;
- envio de registros para análise;
- aprovação e rejeição;
- comentários do orientador;
- carga registrada x carga validada.

## Sprint 4 — Documents

- documentos obrigatórios;
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
- modalidades e configurações por curso.

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
