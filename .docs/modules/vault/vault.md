# Module: vault

Created: 2026-09-08
Author: Vaulta
Linear: —
Domain: [vault](../../domains/vault.md)

## Boundary

Owns spaces and vault entries. Responsible for creating/listing/deleting spaces and for creating/listing/deleting entries within a space. Does not handle authentication, session, or public marketing pages. No direct dependency on public-site.

## Dependencies

- auth — for owner identity; every write checks that the caller owns the target space.
- prisma/postgres — persistence for Space and VaultEntry.

## Key Decisions

- Space type is an enum (personal/company/client) to keep UI and filtering simple and to avoid free-form labels.
- Minimal entry fields (email, password, description) intentionally constrain scope; title and url are optional extensions that do not complicate the core form.
- Cascade delete for entries keeps data consistent without orphan cleanup.
- Server actions are used for mutations to keep client code free of data-access concerns and to allow revalidation of the relevant routes.
