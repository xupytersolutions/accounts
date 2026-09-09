# Vaulta — Accounts

| Meta | Value |
|------|-------|
| Stack | ts — Next.js 16, HeroUI 2.8, Tailwind 4, Prisma 6, Postgres, NextAuth 5 (Google) |
| Package manager | pnpm |
| Node | >= 20 |

## Prerequisites

- Node 20+, pnpm 10+
- Postgres 16+ (local or Docker)
- Google OAuth credentials (Cloud Console → OAuth client, authorized redirect `http://localhost:3000/api/auth/callback/google`)

## Run

```bash
cp .env.example .env
# edit .env: DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET

pnpm install        # also runs prisma generate via postinstall
pnpm db:migrate:dev --name init  # create & apply migration (dev only)
pnpm dev
# http://localhost:3000  public landing at / , auth at /login, vault at /dashboard
```

Docker Postgres alternative:

```bash
docker compose up -d db
```

Generate auth secret:

```bash
openssl rand -hex 32
```

## Database (Prisma + Postgres)

Schema: `prisma/schema.prisma` — client generated to `src/generated/prisma` (never edit generated files).

| Command | When to use |
|---------|-------------|
| `pnpm db:generate` | Regenerate client after schema changes |
| `pnpm db:migrate:dev --name <name>` | **Dev**: create a new migration and apply it locally |
| `pnpm db:migrate:deploy` | **Prod/CI**: apply pending migrations non-interactively (no new migration created) |
| `pnpm db:studio` | Open Prisma Studio GUI |

Dev flow (after editing `prisma/schema.prisma`):

```bash
pnpm db:migrate:dev --name add_foo
pnpm db:generate
```

Prod / deploy flow (e.g. Dockerfile, CI, Vercel build):

```bash
pnpm db:migrate:deploy
# build already runs `prisma generate && next build`
```

## Test

```bash
pnpm build   # type + production build check
pnpm lint
```

## Docs

- Agent gate: [AGENTS.md](./AGENTS.md)
- Module index: [.docs/index.md](./.docs/index.md)
- Outline PRD / SOP: (Outline collection — MCP token expired, see .docs)
