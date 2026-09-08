# Docs Index

## Domains

- [Vault](./domains/vault.md) — spaces and credential entries; the core business concept.

## Modules

- [vault](./modules/vault/vault.md) — spaces & vault entries CRUD, Prisma models Space / VaultEntry.
- [auth](./modules/auth/auth.md) — Google-only NextAuth, session + middleware.
- [public-site](./modules/public-site/public-site.md) — public marketing + future generator/blog.

## Conventions

- Stack: ts — Next.js App Router, HeroUI (React components only from heroui.com), Tailwind 4, Prisma 6, Postgres, NextAuth 5.
- Theme: tokens in `src/app/globals.css` + `tailwind.config.ts`; fonts Geist Sans/Mono; HeroUI plugin with light/dark themes.
- Docs are conceptual — no method/DTO/file names, no code blocks.
