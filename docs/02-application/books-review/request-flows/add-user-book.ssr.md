# Add Book to User Collection — Request Flow (SSR)

This document describes the application-level request flow for adding a book to a user's collection in an SSR-based architecture.

It focuses on request orchestration, boundary handling, and error mapping. All domain behavior is delegated to the domain layer.

## Intent

Handle an authenticated request to add a book to a user’s collection by invoking the appropriate domain use case and returning a transport-level response.

This flow does not define domain rules, persistence behavior, or invariants.

## Preconditions

- A valid authenticated session exists.
- `userId` is resolved from the session context.

## Input

Request payload:
- title (required)
- author (optional)
- isbn (optional)
- summary (optional)

## Application Flow

1. Receive HTTP request.
    - Validate session.
    - Extract `userId` from session context.

2. Validate request payload.
    - Ensure required fields are present.
    - Reject structurally invalid input early.

3. Invoke domain use case.
    - Call `AddUserBook` with:
      - `userId`
      - request payload

4. Handle domain result.
    - On success, prepare SSR response state.
    - On domain error, map error using application error-mapping rules.

5. Send response.
    - No redirects or view rendering are defined here.
    - Presentation decision are handled by the caller.

## Domain Delegation

All domain behavior is defined in:

`01-domains/books-review/domain-use-cases/add-user-book.md`

Including but not limited to:
- Book resolution and creation
- Transactional guarantees
- Idempotency rules
- Domain invariants

This document must not duplicate those rules.

## Error Handling

Domain errors are mapped to HTTP responses according to:

`02-application/books-review/error-mapping.md`

This flow does not interpret domain errors directly.

## Postconditions (on success)

- The domain use case has completed successfully.
- A consistent application response is returned.
- No partial application state exists.

## Notes

- This flow is SSR-oriented but transport-agnostic.
- No persistence logic is defined here.
- No domain assumptions should be inferred from this document.

