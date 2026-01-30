# Get User Books — Request Flow (SSR)

This document describes the application-level request flow for retrieving
a user's book collection in an SSR-based architecture.

It focuses on request orchestration, boundary handling, and error mapping.
All domain query behavior is delegated to the domain layer.

## Intent

Handle an authenticated request to retrieve a user’s book collection
by invoking the appropriate domain query and returning a transport-level response.

This flow does not define domain rules, persistence behavior, or invariants.

## Preconditions

- A valid authenticated session exists.
- `userId` is resolved from the session context.

## Input

Request parameters:
- None explicitly.

Context:
- `userId` (derived from authenticated session)

## Application Flow

1. Receive HTTP request.
    - Validate session.
    - Extract `userId` from session context.

2. Invoke domain query.
    - Call `GetUserBooks` with:
      - `userId`

3. Handle domain result.
    - On success, prepare SSR response state.
    - On domain error, map error using application error-mapping rules.

4. Send response.
    - No redirects or view rendering are defined here.
    - Presentation decisions are handled by the caller.

## Domain Delegation

All domain query behavior is defined in:

`01-domains/books-review/domain-use-cases/get-user-books.md`

Including but not limited to:
- Ownership scoping
- Read-only guarantees
- Deterministic ordering
- Empty result semantics

This document must not duplicate those rules.

## Error Handling

Domain errors are mapped to HTTP responses according to:

`02-application/books-review/error-mapping.md`

This flow does not interpret domain errors directly.

## Postconditions (on success)

- The domain query has completed successfully.
- A consistent application response is returned.
- No persistent state has been modified.

## Notes

- This flow is SSR-oriented but transport-agnostic.
- No persistence logic is defined here.
- No domain assumptions should be inferred from this document.
