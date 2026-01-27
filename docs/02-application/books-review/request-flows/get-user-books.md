# Get User Books — Request Flow (SSR)

This document describes the end-to-end request flow for retrieving
a user's book collection in the current SSR-based architecture.

It intentionally combines domain query behavior and HTTP concerns
to keep read semantics explicit during early implementation.

## Intent

Retrieve a list of books associated with a given user.

This operation reflects the user's collection and review state.
It does not validate user existence and does not perform any mutation.

## Preconditions

- A userId is provided by the caller.
- Authentication and session validation are handled outside the domain.

## Input

- userId (required, opaque identifier)

## Core Behavior

1. Accept userId as an opaque identifier.
   - User existence is NOT validated.

2. Query user-book relations:
   - Only books explicitly related to the given userId are returned.
   - No cross-user data leakage is allowed.

3. Apply deterministic ordering:
   - Primary: user_books.read_at DESC
   - Secondary: user_books.id DESC
   - Null read_at values are allowed and follow database ordering rules.

4. Project results into read models:
   - Each item represents a UserBook projection.
   - Book data is embedded as a nested object.

## Postconditions (on success)

- A list of UserBook projections is returned.
- The list may be empty.
- No persistent state is created or modified.
- Ordering is deterministic for identical datasets.

## Output Shape

```json
{
  "data": [
    {
      "id": "user_book_id",
      "book": {
        "id": "book_id",
        "title": "string",
        "author": "string | null",
        "coverUrl": "string | null"
      },
      "reviewState": "EMPTY | FILLED"
    }
  ],
  "meta": {
    "total": number
  }
}
```

## Idempotency and Retry Semantics

- This operation is fully idempotent.
- Repeated calls with the same userId return the same result set as long as underlying data is unchanged.

## Failure Cases

| Condition                              | Domain Error                | HTTP |
|----------------------------------------|-----------------------------|------|
| Unexpected query failure               | DatabaseError               | 500  |

## Domain Invariants Applied

- Read operations are side-effect free.
- Only user-owned data is returned.
- Empty result is a valid state.
- Ordering is deterministic.

## Notes

- This operation does not distinguish between:
  - a user with no books
  - a non-existing user
  
This document is expected to be split into domain query
and transport documentation once the architecture stabilizes.