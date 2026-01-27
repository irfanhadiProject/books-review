# Add Book to User Collection — Request Flow (SSR)

This document describes the end-to-end request flow for the
Add Book use case in the current SSR-based architecture.

It intentionally combines domain behavior and HTTP concerns
to keep the flow explicit during early implementation.

## Intent

Create a user–book relationship (UserBook) for the authenticated user. This operation may also create a new Book entity as a supporting side effect.

The primary goal of this use case is to establish ownership and review state,
not to manage the global book catalog.

## Preconditions

- User is authenticated.
- A valid userId is provided by the caller.

## Input

- title (required)
- author (optional)
- isbn (optional)
- summary (optional)

## Core Behavior

1. Validate input:
   - title must not be empty.

2. Begin a database transaction.

3. Resolve or create Book:

   **If ISBN is provided**
   - Attempt to insert a new Book using ISBN as identity.
   - If insertion succeeds:
     - Use the newly created Book.
   - If insertion fails due to uniqueness:
     - Re-fetch the existing Book by ISBN.
   - Any other failure aborts the transaction.

   **If ISBN is not provided**
   - Always create a new Book entity.
   - No deduplication is attempted.
   - Retry may result in duplicate Book entities.

4. Create a UserBook relationship:
   - Insert a new user_books row linking userId and bookId.
   - If a relation already exists, the operation fails.

5. Commit the transaction.

6. After commit:
   - If ISBN is present, trigger asynchronous cover fetching (best-effort).
   - Failures in this step do not affect the operation outcome.

## Postconditions (on success)

- A UserBook record exists for the given user and book.
- A Book record exists.
- No partial persistence state exists.
- Review state is derived deterministically from summary.
- A Book entity created by this operation must always be associated
  with exactly one UserBook within the same transaction.


## Idempotency & Retry Semantics

- With ISBN:
  - Retrying the operation will not create duplicate Book entities.
  - Book identity is stable.
- Without ISBN:
  - Operation is not idempotent.
  - Retrying may create additional Book entities.

## Failure Cases

| Condition                               | Domain Error                | HTTP |
|----------------------------------------|-----------------------------|------|
| Missing or empty title                 | ValidationError             | 422  |
| User already has the book              | UserAlreadyHasBookError     | 409  |
| Unexpected persistence failure         | DatabaseError               | 500  |
| Authentication missing or invalid      | AuthenticationError         | 401  |

## Domain Invariants Applied

- A user can have only one relation to a given book.
- No partial state is allowed.
- Book identity is strong only when ISBN is present.
- External enrichment (cover) is non-critical.

## Notes

- This use case does not render views or perform redirects.
- Authorization and session validation are handled outside the domain.

This document is expected to be split into domain and transport
documentation once the architecture stabilizes.

