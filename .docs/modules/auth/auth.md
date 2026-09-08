# Module: auth

Created: 2026-09-08
Author: Vaulta
Linear: —
Domain: [vault](../../domains/vault.md)

## Boundary

Provides Google-only sign-in and session. Exposes sign-in, sign-out and current session. Guards private routes via middleware. Does not manage vault data; only supplies identity to other modules.

## Dependencies

- prisma/postgres — stores users, accounts and sessions via the Prisma adapter.
- next-auth — Google provider, JWT session strategy.

## Key Decisions

- Google is the sole provider — no password flow, reducing attack surface and UX complexity.
- Adapter stores NextAuth tables alongside vault tables in the same database to keep deployment simple (single Postgres).
- Middleware is edge-safe and does not import the database client; auth config is split into an edge-safe part and a node part with the adapter.
- Public/private route split is enforced in middleware rather than per-page checks to keep protection consistent.
