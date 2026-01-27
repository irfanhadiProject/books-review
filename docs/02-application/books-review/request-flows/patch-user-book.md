# Update User Book Review — Request Flow (SSR)

This document describes the end-to-end request flow for updating a user's book review (summary) in the current SSR-based architecture.

It intentionally combines domain command behavior and HTTP concerns to keep write semantics explicit during early implementation.

## Intent

Update the review content (summary) of a book that already belongs to the authenticated user.

This operation mutates an existing UserBook relationship. It does not create new Book or UserBook entities.

## Preconditions

- User is authenticated.
- A valid userId is available to the caller.
- A userBookId is provided.
- Authorization and session validation are handled outside the domain.

## Input

- userId (required, opaque identifier)
- userBookId (required)
- summary (optional, string or null)

## Core Behavior

1. Accept userId as an opaque identifier. User existence is not validated.
2. Validate input:
    - summary is optional.
    - If provided:
      - must be a string
      - must not be an empty or whitespace-only string.
    - summary may be explicitly set to null to clear the review.
3. Enforce ownership:
    - Attempt to update the user_books record identified by userBookId and owned by the given userId.
    - if no such record exist, the operation fails.
4. Apply the update atomically:
    - summary is updated (or set to null).
    - No partial update is allowed.

## Postconditions (on success)

- The user_books record exists and belongs to the given user.
- The summary field reflects the provided value (or null).
- No other fields are modified.
- No additional records are created.
- Persistent state is consistent.

## Idempotency and Retry Semantics

- This operation is idempotent with respect to summary value. Repeating the operation with the same input results in the same state.
- Retrying after a transient failure is safe.

## Failure Cases

| Condition                              | Domain Error                | HTTP |
|----------------------------------------|-----------------------------|------|
| Invalid summary value                  | ValidationError             | 422  |
| User does not own the user_books entry | UserBookNotFoundError       | 404  |
| Authentication missing or invalid      | AuthenticationError         | 401  |
| Unexpected persistence failure         | DatabaseError               | 500  |

## Domain Invariants Applied

- A user may only update their own UserBook records.
- Summary content must be valid or explicitly null.
- No partial updates are allowed.
- Read-only fields must not be mutated.

## Notes

- This operation does not render views or perform redirects.
- HTTP status mapping is handled outside the domain.
- This command does not validate Book existence independently.
- Clearing a review (summary = null) is a valid domain action.

This document is expected to be split into domain command and transport documentation once the architecture stabilizes.