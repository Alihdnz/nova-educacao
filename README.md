# Nova Educação

Plataforma de pré-curso com domínio educacional persistido, autenticação por email e senha e áreas protegidas para estudantes e administradores.

## Stack

- Next.js 16.3 com App Router e `proxy.ts`
- React 19 e TypeScript em modo estrito
- Tailwind CSS 4 e shadcn/ui com Base UI
- Better Auth 1.6 com adaptador Prisma
- Prisma ORM 7.9 com PostgreSQL

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

Não existe cadastro público. O usuário `COURSE_MANAGER` permanece no domínio, mas não recebe acesso a `/admin` nesta sprint.

## Autenticação e autorização

O Better Auth gerencia credenciais, sessões persistentes, cookies e logout. O Prisma mantém as tabelas `User`, `Session`, `Account` e `Verification` no mesmo PostgreSQL do domínio educacional.

As regras atuais são:

| Rota | Acesso |
| --- | --- |
| `/login` | Público; sessões existentes são redirecionadas para sua área |
| `/student` | Somente `STUDENT` |
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
- `20260814195346_add_authentication`: campos e tabelas centrais do Better Auth.

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

Cursos, disciplinas e módulos oferecem criação, edição, listagem, publicação, despublicação e arquivamento. Não há exclusão física nesses fluxos. Todas as mutações são Server Actions explícitas e executam `requireAdmin()` antes de validar ou persistir dados.

### Publicação e vínculos

Cada entidade usa individualmente o enum `ContentStatus`: `DRAFT`, `PUBLISHED` ou `ARCHIVED`. Alterar o status de um pai não publica, despublica, arquiva ou remove seus filhos.

Uma disciplina recebe o `courseId` da rota e só pode ser manipulada dentro desse curso. Um módulo recebe `courseId` e `subjectId` do contexto e as consultas confirmam que a disciplina pertence ao curso e que o módulo pertence à disciplina. Combinações inválidas são rejeitadas no servidor.

### Ordenação

Disciplinas são ordenadas dentro do curso e módulos dentro da disciplina. Os controles movem um item uma posição por vez. A troca ocorre em transação serializável, usa uma posição temporária positiva e respeita as constraints únicas e de ordem positiva existentes no banco.

## Escopo funcional

A Sprint 06 cobre somente a estrutura `Course > Subject > Module`. Aulas, conteúdo, questões, avaliações, alunos, matrículas, progresso, gamificação, relatórios e gestão de `COURSE_MANAGER` não possuem CRUD administrativo nesta etapa.
