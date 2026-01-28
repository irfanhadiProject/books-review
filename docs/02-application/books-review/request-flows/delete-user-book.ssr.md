# Delete User Book — Request Flow (SSR)

This document describes the application-level request flow for removing
a book from a user's collection in an SSR-based architecture.

It focuses on request orchestration, boundary handling, and error mapping.
All domain command behavior is delegated to the domain layer.

## Intent

Handle an authenticated request to remove a book from a user’s collection
by invoking the appropriate domain command and returning a transport-level response.

This flow does not define domain rules, persistence behavior, or invariants.

## Preconditions

- A valid authenticated session exists.
- `userId` is resolved from the session context.

## Input

Request parameters:
- userBookId (required)

Context:
- `userId` (derived from authenticated session)

## Application Flow

1. Receive HTTP request.
    - Validate session.
    - Extract `userId` from session context.
    - Extract `userBookId` from request parameters.

2. Invoke domain command.
    - Call `DeleteUserBook` with:
      - `userId`
      - `userBookId`

3. Handle domain result.
    - On success, prepare SSR response state.
    - On domain error, map error using application error-mapping rules.

4. Send response.
    - No redirects or view rendering are defined here.
    - Presentation decisions are handled by the caller.

## Domain Delegation

All domain command behavior is defined in:

`01-domains/books-review/domain-use-cases/delete-user-book.md`

Including but not limited to:
- Ownership enforcement
- Atomic deletion guarantees
- Non-idempotent semantics

This document must not duplicate those rules.

## Error Handling

Domain errors are mapped to HTTP responses according to:

`02-application/books-review/error-mapping.md`

This flow does not interpret domain errors directly.

## Postconditions (on success)

- The domain command has completed successfully.
- A consistent application response is returned.
- Persistent state reflects the deletion.

## Notes

- This flow is SSR-oriented but transport-agnostic.
- No persistence logic is defined here.
- No domain assumptions should be inferred from this document.
