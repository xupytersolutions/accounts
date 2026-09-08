# AGENTS — Vaulta

> Start here. This is the agent start/exit gate.

## Project

- **Name:** Vaulta (Accounts)
- **Stack:** ts — Next.js + HeroUI + Prisma + Postgres + NextAuth (Google only)
- **Repo:** C:\main\projects\accounts
- **Docs:** `.docs/index.md` is the source of truth for modules/domains. Read it before coding.

## Rules

1. **Read `.docs/index.md` first** on every task — it links every module and domain.
2. **Read the target module doc** (`.docs/modules/<name>/<name>.md`) before editing that module. Respect its Boundary / Dependencies / Key Decisions.
3. **Read the linked domain doc** for business context — no code details there.
4. **Do not invent HeroUI components** — only use https://heroui.com/en/docs/react/components . Keep UI clean, minimal, HeroUI primitives only.
5. **Auth:** Google only via NextAuth. Do not add manual auth. Public routes: `/`, `/login` (and future `/generator`, `/blog`). Private: `/dashboard`, `/spaces/*` guarded by `middleware.ts`.
6. **DB:** Prisma + Postgres only. Schema in `prisma/schema.prisma`. Generate to `src/generated/prisma`. Never edit generated files.
7. **Package manager:** pnpm only.
8. **No code references in docs** — module/domain docs stay conceptual.

## Start

- `pnpm install` then `pnpm prisma generate` + `pnpm prisma migrate dev`
- `pnpm dev` → http://localhost:3000
- Build gate: `pnpm build` must pass before handoff.

## Exit

- Update the touched module doc if boundary/decisions changed.
- Ensure `pnpm build` and `pnpm lint` pass.
- Reference Linear issue and Outline docs in PR body (use `format_pr_body`).

## Stack notes

- Fonts: Geist Sans / Geist Mono via `next/font/google` — theme tokens in `src/app/globals.css` + `tailwind.config.ts` (HeroUI plugin).
- Providers: `src/components/providers.tsx` (HeroUIProvider + SessionProvider).
- Auth config split: `src/auth.config.ts` (edge-safe) + `src/auth.ts` (Prisma adapter).
