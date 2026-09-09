# Module: public-site

Created: 2026-09-08
Author: Xupyter One Account
Linear: —
Domain: [vault](../../domains/vault.md)

## Boundary

Renders all unauthenticated pages: landing, login, and future public tools (password generator, blogs). Never accesses private vault data. Links to private routes but does not guard them — guard lives in auth.

## Dependencies

- auth — for login action and to show correct CTA (sign in vs go to dashboard).
- HeroUI + Tailwind — visual system; no custom component library.

## Key Decisions

- Landing highlights spaces and the public/private split to set expectations early; it uses only HeroUI primitives to stay consistent with the private UI.
- Login is a single Google button; no forms, keeping the public surface minimal.
- Future public tools are referenced as placeholders to reserve routes without building them now.
