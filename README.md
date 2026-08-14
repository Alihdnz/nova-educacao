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

## Escopo funcional

O painel gestor oferece layout responsivo, navegação preparada, breadcrumbs, resumo leve do banco e estados de carregamento, erro e vazio. Os itens de cursos, disciplinas, módulos, aulas, avaliações, usuários, relatórios e gamificação permanecem desabilitados até suas respectivas sprints; nenhum CRUD foi antecipado.
