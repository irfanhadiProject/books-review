# Delete User Book — Request Flow (SSR)

This document describes the end-to-end request flow for removing a book from a user's collection in the current SSR-based architecture.

It intentionally combines domain command behavior and HTTP concerns to keep delete semantics explicit during early implementation.

## Intent

Remove an existing UserBook relationship owned by the authenticated user.

This operation deletes the ownership and review state for a book. It does not delete the underlying Book entity.

## Preconditions

- User is authenticated.
- A valid userId is available to the caller.
- A userBookId is provided.
- Authorization and session validation are handled outside the domain.

## Input

- userId (required, opaque identifier)
- userBookId (required)

## Core Behavior

1. Accept userId as an opaque identifier. User existence is NOT validated.
2. Enforce ownership:
    - Attempt to delete the user_books record identified by userBookId and owned by the given userId.
    - If no such record exists, the operation fails.
3. Apply deletion atomically:
    - The UserBook record is removed.
    - No other records are affected.
    - No partial state is allowed.

## Postconditions (on success)

- The specified UserBook record no longer exists.
- The underlying Book entity remains intact.
- No other UserBook records are modified.
- Persistent state is consistent.

## Idempotency and Retry Semantics

- This operation is not idempotent. Repeating the request after success results in a not-found condition.
- Retrying after a transient failure is safe.

## Failure Cases

| Condition                                | Domain Error                | HTTP |
|------------------------------------------|-----------------------------|------|
| User does not own the user_books entry   | UserBookNotFoundError       | 404  |
| Authentication missing or invalid        | AuthenticationError       | 401  |
| Unexpected persistence failure           | DatabaseError               | 500  |

## Domain Invariants Applied

- A user may only delete their own UserBook records.
- No partial persistence state is allowed.
- Book entities are immutable and not deleted by this operation.
- Authorization is all-or-nothing.

## Notes

- This operation does not render views or perform redirects.
- HTTP status mapping is handled outside the domain.
- This command does not validate Book existence independently.

This document is expected to be split into domain command and transport
documentation once the architecture stabilizes.