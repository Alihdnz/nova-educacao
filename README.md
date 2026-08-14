# Nova Educação

Plataforma de pré-curso com fundação visual e domínio educacional persistido. A Sprint 04 implementa somente banco e domínio; autenticação, CRUD, dashboards e engines de aprendizagem ainda não fazem parte da aplicação.

## Stack

- Next.js 16.3.1 com App Router
- React 19.2.8
- TypeScript 5.9 em modo estrito
- Tailwind CSS 4.3 e PostCSS
- shadcn/ui 4.18 com Base UI e preset Nova
- Prisma ORM 7.9 com driver adapter PostgreSQL
- PostgreSQL / Prisma Postgres
- ESLint 9

## Requisitos

- Node.js 20.9 ou superior
- npm
- Uma instância PostgreSQL acessível
- `DATABASE_URL` válida

## Configuração local

1. Instale as dependências. O `postinstall` gera o Prisma Client automaticamente:

   ```bash
   npm install
   ```

2. Crie o arquivo de ambiente local:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Substitua os placeholders de `DATABASE_URL` em `.env` pelos dados do PostgreSQL.

4. Aplique as migrations pendentes:

   ```bash
   npx prisma migrate dev
   ```

5. Carregue os dados representativos de desenvolvimento:

   ```bash
   npx prisma db seed
   ```

6. Inicie a aplicação:

   ```bash
   npm run dev
   ```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build de produção |
| `npm run start` | Executa a build de produção |
| `npm run lint` | Executa o ESLint |
| `npx prisma validate` | Valida schema e configuração |
| `npx prisma generate` | Gera o Prisma Client |
| `npx prisma migrate dev` | Cria ou aplica migrations de desenvolvimento |
| `npx prisma migrate deploy` | Aplica migrations pendentes em produção |
| `npx prisma migrate status` | Compara banco e histórico local |
| `npx prisma db seed` | Executa o seed idempotente |

## Domínio educacional

A hierarquia de conteúdo é genérica e suporta diferentes áreas de conhecimento:

```text
Course
└── Subject
    └── Module
        └── Lesson
            ├── Question
            │   └── Answer
            └── Assessment
                └── AssessmentQuestion → Question
```

O domínio do aluno e da gestão futura contém:

- `User`, com roles `STUDENT`, `ADMIN` e `COURSE_MANAGER`;
- `CourseManager`, vínculo de responsabilidade entre usuário e curso;
- `Enrollment`, vínculo único entre usuário e curso;
- `Progress`, estado de uma aula dentro da matrícula;
- `Attempt`, tentativa numerada de uma avaliação;
- `AttemptAnswer`, alternativa selecionada para cada questão da tentativa.

A persistência mínima de gamificação contém `XPTransaction`, `Achievement`, `UserAchievement` e `StudyStreak`. Não existe engine de gamificação nesta etapa.

## Integridade dos dados

- Slugs de cursos, avaliações e conquistas são globais; slugs hierárquicos são únicos dentro do pai.
- Ordem de disciplinas, módulos, aulas, questões e alternativas possui constraints e unicidade contextual.
- Matrícula é única por usuário e curso.
- Progresso é único por matrícula e aula.
- Número de tentativa é único por matrícula e avaliação.
- A FK composta de `AttemptAnswer` garante que a alternativa pertence à questão respondida.
- Dados educacionais e históricos utilizam `RESTRICT`; cascata fica limitada a vínculos dependentes.

## Migration

A migration inicial do domínio está em:

```text
prisma/migrations/20260814192047_init_educational_domain/migration.sql
```

Em produção, aplique migrations com `npx prisma migrate deploy`. Não execute `migrate dev` contra o banco de produção.

## Seed

O seed em `prisma/seed.ts` cria um conjunto pequeno e coerente:

- curso de Economia com 2 disciplinas, 3 módulos e 4 aulas;
- 2 questões, 5 alternativas e 1 avaliação;
- usuários aluno, gestor e administrador;
- vínculo de gestor, matrícula, progresso, tentativa e respostas;
- transação de XP, conquista e streak.

O seed utiliza identificadores únicos e `upsert`, podendo ser executado novamente sem duplicar os registros representativos.

## Reset de desenvolvimento

Somente em um banco local ou dedicado ao desenvolvimento, é possível recriar tudo com:

```bash
npx prisma migrate reset
```

Esse comando apaga todos os dados do banco configurado. Nunca o execute em produção ou em um ambiente compartilhado.

## Estrutura relevante

```text
app/
├── admin/page.tsx
├── student/page.tsx
├── layout.tsx
└── page.tsx
components/
├── layout/
├── shared/
└── ui/
lib/
├── generated/prisma/  # gerado localmente
├── prisma.ts
└── utils.ts
prisma/
├── migrations/
├── schema.prisma
└── seed.ts
```

As rotas `/student` e `/admin` continuam como placeholders. Nenhuma autenticação, autorização funcional, API, formulário ou interface de domínio foi implementada.

## Segurança de ambiente

Arquivos `.env*` são ignorados pelo Git, com exceção de `.env.example`, que contém apenas placeholders. Credenciais reais devem existir somente no ambiente local ou no provedor de implantação.
