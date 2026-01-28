# Update User Book — Request Flow (SSR)

This document describes the application-level request flow for updating
a user's book review in an SSR-based architecture.

It focuses on request orchestration, boundary handling, and error mapping.
All domain mutation behavior is delegated to the domain layer.

## Intent

Handle an authenticated request to update a user’s book review
by invoking the appropriate domain use case and returning a transport-level response.

This flow does not define domain rules, persistence behavior, or invariants.

## Preconditions

- A valid authenticated session exists.
- `userId` is resolved from the session context.

## Input

Request parameters:
- userBookId (required)

Request payload:
- summary (optional, string or null)

Context:
- `userId` (derived from authenticated session)

## Application Flow

1. Receive HTTP request.
    - Validate session.
    - Extract `userId` from session context.
    - Extract `userBookId` from request parameters.

2. Validate request payload.
    - Ensure payload structure is valid.
    - Reject structurally invalid input early.

3. Invoke domain use case.
    - Call `UpdateUserBook` with:
      - `userId`
      - `userBookId`
      - `summary`

4. Handle domain result.
    - On success, prepare SSR response state.
    - On domain error, map error using application error-mapping rules.

5. Send response.
    - No redirects or view rendering are defined here.
    - Presentation decisions are handled by the caller.

## Domain Delegation

All domain mutation behavior is defined in:

`01-domains/books-review/domain-use-cases/update-user-book.md`

Including but not limited to:
- Ownership enforcement
- Summary validation rules
- Atomic update guarantees
- Idempotency semantics

This document must not duplicate those rules.

## Error Handling

Domain errors are mapped to HTTP responses according to:

`02-application/books-review/error-mapping.md`

This flow does not interpret domain errors directly.

## Postconditions (on success)

- The domain use case has completed successfully.
- The user’s book review state has been updated.
- A consistent application response is returned.

## Notes

- This flow is SSR-oriented but transport-agnostic.
- No persistence logic is defined here.
- No domain assumptions should be inferred from this document.
