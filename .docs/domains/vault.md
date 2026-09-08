# Domain: Vault

Concept: a user owns spaces that model real contexts — personal, company, client. Each space holds vault entries, each entry representing one account credential (email + password + description). Spaces isolate credentials so personal and client secrets never mix.

## Business Rules

- Every space has a type: personal, company, or client. Type is a label for organization, not access control.
- Every vault entry belongs to exactly one space and must have an email and a password; title, url and description are optional.
- Only the owner of a space may view, create or delete its entries.
- Deleting a space deletes its entries (cascade).
- Auth is Google-only; no local passwords. The vault never stores the Google credential, only the managed account credentials.

## Lifecycle

User signs in with Google → creates a space (choose type) → adds entries (email/password/description) → browses by space → deletes entries or spaces as needed. Public site remains browsable without sign-in; private vault requires authentication.

## Module

- [vault](../modules/vault/vault.md)
- [auth](../modules/auth/auth.md) — provides identity for ownership.
