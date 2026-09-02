# StageTrack — Requisitos do Produto

## Perfis

- `student`: aluno
- `advisor`: professor orientador
- `coordinator`: coordenação

## Requisitos funcionais do núcleo

### Autenticação

- **RF001** — permitir cadastro de usuário.
- **RF002** — permitir login por e-mail e senha.
- **RF003** — permitir logout.
- **RF004** — permitir recuperação de senha.

### Usuário

- **RF005** — permitir visualizar o próprio perfil.
- **RF006** — permitir editar dados autorizados do próprio perfil.
- **RF007** — permitir matrícula acadêmica para alunos.
- **RF008** — associar aluno a um curso.

### Modalidades de estágio

- **RF009** — permitir cadastrar modalidades de estágio.
- **RF010** — cada modalidade deve possuir carga horária obrigatória.
- **RF011** — modalidade pode possuir descrição e orientações.
- **RF012** — modalidade pode ser ativada ou desativada.

### Instituições

- **RF013** — permitir cadastrar instituição concedente.
- **RF014** — armazenar dados básicos da instituição.
- **RF015** — permitir reutilizar uma instituição em diferentes estágios.

### Estágio

- **RF016** — permitir ao aluno criar um estágio.
- **RF017** — vincular estágio a uma modalidade.
- **RF018** — vincular estágio a uma instituição.
- **RF019** — permitir supervisor e orientador.
- **RF020** — armazenar data inicial e data prevista de término.
- **RF021** — manter status do estágio: `draft`, `active`, `paused`, `completed`, `cancelled`.
- **RF022** — permitir visualizar o próprio estágio e histórico de estágios.

### Atividades

- **RF023** — permitir registrar atividade de estágio.
- **RF024** — registro deve possuir data, início, fim e descrição.
- **RF025** — permitir turma, professor responsável e observações.
- **RF026** — calcular automaticamente a duração.
- **RF027** — permitir edição e exclusão enquanto o registro não estiver validado.
- **RF028** — listar registros em ordem cronológica.

### Carga horária

- **RF029** — somar a duração dos registros válidos.
- **RF030** — calcular horas restantes.
- **RF031** — calcular percentual de conclusão.
- **RF032** — rejeitar horário final anterior ou igual ao inicial.

### Dashboard do aluno

- **RF033** — exibir horas cumpridas.
- **RF034** — exibir horas restantes.
- **RF035** — exibir percentual de conclusão.
- **RF036** — exibir status do estágio e atividades recentes.

## Requisitos pós-MVP

- validação de atividades por orientador;
- comentários de revisão;
- painel de orientandos;
- dashboard da coordenação;
- documentos e estados de aprovação;
- geração de relatórios e PDF;
- alertas e previsão de conclusão.

## Regras de negócio

- **RN001** — aluno só pode alterar seus próprios estágios e registros.
- **RN002** — professor só acessa orientandos autorizados.
- **RN003** — coordenação acessa apenas seu contexto institucional.
- **RN004** — todo estágio deve possuir modalidade.
- **RN005** — carga obrigatória da modalidade deve ser maior que zero.
- **RN006** — estágio só pode ser concluído ao atingir a carga mínima obrigatória.
- **RN007** — duração deve ser armazenada em minutos.
- **RN008** — registros rejeitados não contam como carga validada.
- **RN009** — registros validados não podem ser editados pelo aluno.
- **RN010** — não é permitido registrar atividades em estágio concluído ou cancelado.
- **RN011** — histórico de estágios concluídos deve ser preservado.
- **RN012** — progresso visual é limitado a 100%, mesmo que a carga registrada ultrapasse a mínima.
- **RN013** — relações entre entidades devem preservar integridade referencial no banco sempre que aplicável.

## Requisitos não funcionais

- **RNF001** — interface responsiva.
- **RNF002** — rotas privadas exigem autenticação.
- **RNF003** — autorização deve ser validada no banco com Row Level Security (RLS), não apenas na interface.
- **RNF004** — dados devem possuir persistência confiável e integridade referencial.
- **RNF005** — interface deve priorizar clareza e usabilidade.
- **RNF006** — consultas devem carregar apenas os dados necessários.
- **RNF007** — arquitetura deve permitir evolução para auditoria e múltiplas instituições.
- **RNF008** — credenciais privilegiadas do Supabase nunca devem ser expostas no navegador.
