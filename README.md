# Nova Educação

Plataforma de pré-curso com domínio educacional persistido, autenticação por email e senha e áreas protegidas para estudantes e administradores.

## Stack

- Next.js 16.3 com App Router e `proxy.ts`
- React 19 e TypeScript em modo estrito
- Tailwind CSS 4 e shadcn/ui com Base UI
- Better Auth 1.6 com adaptador Prisma
- Prisma ORM 7.9 com PostgreSQL
- react-markdown 10 para renderização segura do conteúdo das aulas

## Requisitos

- Node.js 20.9 ou superior
- npm
- Uma instância PostgreSQL acessível

## Ambiente

Crie `.env` a partir de `.env.example` e configure:

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL usada pelo Prisma e pelo Better Auth |
| `BETTER_AUTH_SECRET` | Segredo aleatório com pelo menos 32 caracteres |
| `BETTER_AUTH_URL` | URL base da aplicação, sem barra final |
| `SEED_ADMIN_PASSWORD` | Senha local do administrador do seed, mínimo de 12 caracteres |
| `SEED_STUDENT_PASSWORD` | Senha local do estudante do seed, mínimo de 12 caracteres |

Valores reais devem existir apenas no `.env` ignorado pelo Git e nas variáveis protegidas do provedor de implantação. Use segredos diferentes em desenvolvimento, preview e produção.

## Execução local

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

A aplicação estará em [http://localhost:3000](http://localhost:3000).

O seed cria credenciais idempotentes para:

- `admin@example.com`, papel `ADMIN`, senha em `SEED_ADMIN_PASSWORD`;
- `aluno@example.com`, papel `STUDENT`, senha em `SEED_STUDENT_PASSWORD`.
- `aluno.sem.curso@example.com`, papel `STUDENT`, sem matrícula e com a senha em `SEED_STUDENT_PASSWORD`.

Não existe cadastro público. O usuário `COURSE_MANAGER` permanece no domínio, mas não recebe acesso a `/admin` nesta sprint.

## Autenticação e autorização

O Better Auth gerencia credenciais, sessões persistentes, cookies e logout. O Prisma mantém as tabelas `User`, `Session`, `Account` e `Verification` no mesmo PostgreSQL do domínio educacional.

As regras atuais são:

| Rota | Acesso |
| --- | --- |
| `/login` | Público; sessões existentes são redirecionadas para sua área |
| `/student` | Somente `STUDENT` |
| `/student/courses/**` | Somente `STUDENT` com matrícula válida e acesso à hierarquia publicada |
| `/admin` | Somente `ADMIN` |
| `/admin/courses/**` | Somente `ADMIN`; leituras e mutações validam a sessão no servidor |
| `/forbidden` | Estado de acesso negado |

O `proxy.ts` faz uma triagem antecipada. Os layouts protegidos repetem a validação no servidor por meio de `getSession`, `requireAuth`, `requireRole` e `requireAdmin`; não dependa apenas do proxy para proteger dados ou futuras Server Actions.

## Banco e migrations

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
npx prisma db seed
```

Histórico atual:

- `20260814192047_init_educational_domain`: domínio educacional da Sprint 04;
- `20260814195346_add_authentication`: campos e tabelas centrais do Better Auth;
- `20260815003348_add_lesson_image`: imagem principal opcional das aulas;
- `20260815013231_add_question_assessment_management`: dificuldade e explicação das questões, nota máxima e tempo limite das avaliações;
- `20260815121946_add_student_assessment_results`: regra de aprovação e snapshots persistidos do resultado das tentativas;
- `20260815122500_add_assessment_result_constraints`: checks dos resultados e garantia de uma única tentativa em andamento por matrícula e avaliação.

Use `prisma migrate deploy` em produção. `prisma migrate reset` apaga os dados e só pode ser usado em um banco local descartável.

## Implantação na Vercel

O `vercel.json` executa `npm run build:vercel`, que aplica migrations pendentes com `prisma migrate deploy` antes da build do Next.js. Configure as cinco variáveis da seção **Ambiente** no projeto Vercel antes do primeiro deploy.

Para produção, defina `BETTER_AUTH_URL` com o domínio canônico HTTPS. Em ambientes Preview que usam URLs variáveis, forneça uma URL estável destinada aos testes de autenticação ou configure explicitamente o valor por ambiente no painel da Vercel.

O seed não roda automaticamente durante o deploy. Execute `npx prisma db seed` de forma controlada com acesso às variáveis do ambiente quando precisar provisionar as contas iniciais.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build local de produção |
| `npm run build:vercel` | Migrations pendentes e build de implantação |
| `npm run start` | Servidor da build de produção |
| `npm run lint` | ESLint |
| `npx prisma db seed` | Seed idempotente do domínio e das credenciais |

## Estrutura administrativa

O painel gestor possui dashboard com totais de cursos, cursos publicados, disciplinas e módulos. A navegação ativa contém somente **Dashboard** e **Cursos**.

| Rota | Finalidade |
| --- | --- |
| `/admin/courses` | Listar cursos e acessar sua estrutura |
| `/admin/courses/new` | Criar curso |
| `/admin/courses/[courseId]` | Visualizar curso, alterar status e gerenciar disciplinas |
| `/admin/courses/[courseId]/edit` | Editar curso |
| `/admin/courses/[courseId]/subjects/new` | Criar disciplina no curso atual |
| `/admin/courses/[courseId]/subjects/[subjectId]/edit` | Editar disciplina validando seu curso |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules` | Gerenciar módulos da disciplina |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules/new` | Criar módulo na disciplina atual |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/edit` | Editar módulo validando toda a hierarquia |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/lessons` | Listar e ordenar aulas do módulo |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/lessons/new` | Criar aula em rascunho |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/lessons/[lessonId]/edit` | Editar conteúdo e metadados da aula |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/lessons/[lessonId]/preview` | Visualizar a aula como conteúdo renderizado |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/lessons/[lessonId]/questions` | Gerenciar questões e alternativas da aula |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/lessons/[lessonId]/questions/[questionId]` | Visualizar questão, resposta correta e explicação |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/lessons/[lessonId]/assessments` | Gerenciar avaliações da aula |
| `/admin/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/lessons/[lessonId]/assessments/[assessmentId]` | Selecionar, ordenar e configurar questões da avaliação |

Cursos, disciplinas, módulos, aulas, questões e avaliações oferecem criação, edição, listagem, publicação, despublicação e arquivamento. Não há exclusão física de questões ou avaliações. Todas as mutações são Server Actions explícitas e executam `requireAdmin()` antes de validar ou persistir dados.

### Publicação e vínculos

Cada entidade usa individualmente o enum `ContentStatus`: `DRAFT`, `PUBLISHED` ou `ARCHIVED`. Alterar o status de um pai não publica, despublica, arquiva ou remove seus filhos.

Uma disciplina recebe o `courseId` da rota e só pode ser manipulada dentro desse curso. Módulos, aulas, questões e avaliações recebem toda a hierarquia da rota, e as consultas confirmam os vínculos `Course > Subject > Module > Lesson > Question/Assessment`. Combinações inválidas são rejeitadas no servidor.

### Conteúdo de aulas

O campo `Lesson.content` armazena Markdown CommonMark. O editor administrativo oferece comandos para títulos, ênfase, listas, citações, links, separadores e imagens incorporadas, além de alternância imediata entre edição e preview.

O renderer usa `react-markdown`, ignora HTML bruto e restringe links e imagens aos protocolos HTTP e HTTPS. A imagem principal fica separada no campo opcional `Lesson.imageUrl`; não existe upload de arquivos nesta sprint. Novas aulas são sempre criadas como `DRAFT`, e publicação, despublicação e arquivamento exigem ações explícitas.

### Questões e alternativas

Questões pertencem a uma aula, utilizam `SINGLE_CHOICE` ou `TRUE_FALSE` e possuem dificuldade `EASY`, `MEDIUM` ou `HARD`. Alternativas permanecem no modelo `Answer`, com ordem e exatamente uma resposta correta. Escolha única aceita de duas a oito alternativas; verdadeiro ou falso exige duas.

O enunciado é tratado como texto simples, sem HTML. A explicação é administrativa durante esta sprint, mas obrigatória para publicar. Remover uma alternativa já referenciada por `AttemptAnswer` é rejeitado para preservar o histórico.

### Avaliações

Avaliações pertencem a uma aula e referenciam questões existentes por `AssessmentQuestion`, sem copiar seu conteúdo. A mesma questão pode participar de várias avaliações, com ordem e peso independentes em cada uma. A seleção lista somente questões da aula atual.

`Assessment.maxScore` define a nota máxima, `passingPercentage` define o percentual mínimo de aprovação entre 0 e 100 (70 por padrão) e `timeLimitMinutes` representa um limite opcional entre 1 e 1.440 minutos. Para publicar, a avaliação precisa ter ao menos uma questão publicada e válida, e a soma dos pesos positivos deve ser exatamente igual à nota máxima. Alterações estruturais em conteúdo publicado retornam a entidade afetada para rascunho; avaliações publicadas dependentes de uma questão alterada também voltam para rascunho.

### Ordenação

Disciplinas são ordenadas dentro do curso, módulos dentro da disciplina, aulas e questões dentro da aula, e questões selecionadas dentro de cada avaliação. Os controles movem um item uma posição por vez. A troca ocorre em transação serializável, usa uma posição temporária positiva e respeita as constraints únicas e de ordem positiva existentes no banco.

## Área do estudante

O dashboard em `/student` lista somente cursos publicados associados a matrículas `ACTIVE` ou `COMPLETED`. Matrículas canceladas não concedem acesso. Cursos concluídos continuam disponíveis, e o estado vazio não oferece catálogo ou matrícula automática.

O progresso exibido é derivado dos registros de `Progress` por aula publicada. A plataforma não cria progresso ao abrir uma aula nem conclui conteúdo automaticamente. O estudante pode marcar explicitamente uma aula como concluída; a Server Action valida novamente sessão, matrícula, hierarquia e publicação antes de criar ou atualizar o registro de progresso de forma idempotente. Essa ação não altera XP, streak, conquistas ou o status da matrícula.

A página da aula permite navegar para o conteúdo publicado anterior ou seguinte na sequência global do curso. A ação **Continuar estudando** prioriza uma aula `IN_PROGRESS`, depois a primeira aula ainda não concluída e, por fim, a primeira aula publicada disponível.

| Rota | Finalidade |
| --- | --- |
| `/student` | Dashboard, cursos matriculados, progresso e continuação |
| `/student/courses/[courseId]` | Visão do curso e disciplinas publicadas |
| `/student/courses/[courseId]/subjects/[subjectId]` | Disciplina e módulos publicados |
| `/student/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]` | Módulo, aulas publicadas e estados de progresso |
| `/student/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/lessons/[lessonId]` | Conteúdo Markdown publicado da aula |
| `/student/courses/[courseId]/subjects/[subjectId]/modules/[moduleId]/lessons/[lessonId]/assessments/[assessmentId]` | Início, execução e resultado de uma avaliação publicada |

Cada página valida no servidor a sessão, o papel `STUDENT`, a matrícula, o vínculo completo `Course > Subject > Module > Lesson` e o status `PUBLISHED` de todos os níveis consultados. IDs manipulados, conteúdo não publicado e recursos fora da matrícula retornam o mesmo estado de conteúdo indisponível, sem revelar dados parciais. Listagens carregam apenas metadados; o campo `Lesson.content` é consultado somente na página da aula.

### Execução de avaliações

Uma avaliação publicada só pode ser iniciada por um estudante com matrícula `ACTIVE` ou `COMPLETED` na hierarquia publicada correta. O início cria uma `Attempt` ou retoma a única tentativa `IN_PROGRESS` existente para a mesma matrícula e avaliação. Cada seleção é salva imediatamente por upsert em `AttemptAnswer`, permitindo alterar a resposta e retomar a execução após refresh sem duplicá-la.

As questões seguem `AssessmentQuestion.order`. O cliente recebe apenas enunciado, tipo e alternativas; `Answer.isCorrect`, `Question.explanation`, pesos e regras de correção permanecem no servidor. Questões não respondidas são corrigidas como incorretas, com aviso antes da finalização. Nesta sprint o resultado é geral e não inclui revisão detalhada nem explicações.

Na submissão, o servidor compara as respostas persistidas, soma os pesos das questões corretas e limita a nota ao intervalo de zero a `Assessment.maxScore`. O percentual é `score / maxScore * 100`, arredondado para duas casas decimais com metade para cima. O aluno é aprovado quando o percentual é maior ou igual ao `Assessment.passingPercentage` configurado.

A submissão altera a `Attempt` de `IN_PROGRESS` para `SUBMITTED` e persiste nota, nota máxima, percentual, limite de aprovação, aprovado/reprovado, acertos, total de questões, tempo configurado e data de submissão. Esses snapshots preservam o resultado histórico contra alterações posteriores na avaliação. Tentativas submetidas não são recalculadas e continuam consultáveis.

Quando há limite de tempo, a expiração deriva de `startedAt` mais o limite copiado para a tentativa. O contador do navegador é apenas visual e é reconstruído após refresh; toda resposta e submissão revalidam o prazo no servidor. Ao expirar, as respostas já salvas são corrigidas e a tentativa é finalizada com segurança. Avaliações sem limite não exibem contador.

## Escopo funcional

A Sprint 12 implementa iniciar ou retomar uma avaliação, persistir respostas, controlar prazo, corrigir no servidor e preservar/exibir resultados de tentativas. Matrícula pelo aluno, catálogo, limites complexos de tentativa, revisão detalhada, consolidação de progresso de curso/disciplina/módulo, gamificação, certificados e relatórios permanecem fora do escopo.
