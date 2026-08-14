# Nova Educação

Fundação técnica e visual de uma plataforma de pré-curso. O projeto está no encerramento da Sprint 03 e contém apenas a infraestrutura compartilhada da aplicação; autenticação e domínio educacional ficam fora deste escopo.

## Stack

- Next.js 16.3.1 com App Router
- React 19.2.8
- TypeScript 5.9 em modo estrito
- Tailwind CSS 4.3 e PostCSS
- shadcn/ui 4.18 com Base UI e preset Nova
- Prisma ORM 7.9
- PostgreSQL / Prisma Postgres
- ESLint 9

## Requisitos

- Node.js 20.9 ou superior
- npm
- Uma instância PostgreSQL acessível
- `DATABASE_URL` válida

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo de ambiente local a partir do exemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Substitua os placeholders de `DATABASE_URL` em `.env` pelos dados do seu PostgreSQL. Não versione esse arquivo.

4. Gere o Prisma Client:

   ```bash
   npx prisma generate
   ```

5. Inicie o ambiente de desenvolvimento:

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
| `npx prisma generate` | Gera o Prisma Client |
| `npx prisma validate` | Valida o schema e a configuração do Prisma |

## Prisma e banco

O datasource PostgreSQL é configurado em `prisma.config.ts` por meio de `DATABASE_URL`. O schema em `prisma/schema.prisma` está propositalmente sem modelos: o domínio educacional será definido em uma sprint posterior.

O client gerado fica em `lib/generated/prisma` e não é versionado. A instância compartilhada em `lib/prisma.ts` utiliza `@prisma/adapter-pg` e evita múltiplos clients durante o hot reload do Next.js.

## Estrutura

```text
app/
├── admin/page.tsx
├── student/page.tsx
├── globals.css
├── layout.tsx
└── page.tsx
components/
├── layout/
│   ├── container.tsx
│   └── site-header.tsx
├── shared/
│   └── page-header.tsx
└── ui/
    └── button.tsx
lib/
├── generated/prisma/  # gerado localmente
├── prisma.ts
└── utils.ts
prisma/
└── schema.prisma
```

As rotas `/student` e `/admin` são placeholders mínimos usados para validar a fundação visual. Elas ainda não contêm dashboards, autenticação, autorização, CRUD ou regras de domínio.

## Segurança de ambiente

Arquivos `.env*` são ignorados pelo Git, com exceção de `.env.example`, que contém apenas placeholders. Credenciais reais devem existir somente no ambiente local ou no provedor de implantação.
