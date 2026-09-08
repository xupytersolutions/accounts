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

pnpm install
pnpm prisma generate
pnpm prisma migrate dev --name init
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

## Test

```bash
pnpm build   # type + production build check
pnpm lint
```

## Docs

- Agent gate: [AGENTS.md](./AGENTS.md)
- Module index: [.docs/index.md](./.docs/index.md)
- Outline PRD / SOP: (Outline collection — MCP token expired, see .docs)
