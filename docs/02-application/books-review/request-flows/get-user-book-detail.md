# Get User Book Detail — Request Flow (SSR)

This document describes the end-to-end request flow for retrieving a single user-owned book detail in the current SSR-based architecture.

It intentionally combines domain query behavior and HTTP concerns
to keep read semantics explicit during early implementation.

## Intent

Retrieve detailed information for a specific book that belongs to a given user.

This operation reflects ownership and review state for a single UserBook. It does not validate global book existence and does not perform any mutation.

## Preconditions

- A userId is provided by the caller.
- A userBookId is provided.
- Authentication and session validation are handled outside the domain.

## Input

- userId (required, opaque identifier)
- userBookId (required)

## Core Behavior

1. Accept userId as an opaque identifier. User existence is NOT validated.
2. Query user-book relation by identifiers:
    - Fetch the user_books record identified by userBookId and scoped to userId.
    - Cross-user access is not permitted.
3. Resolve associated Book data:
    - Book data is loaded as a supporting entity.
    - Book identity and existence are not validated outside the relation.
4. Project result into a read model:
    - The result represents a single UserBook projection.
    - Book data is embedded as a nested object.

Postconditions (on success)

- A UserBook projection is returned.
- The returned record belongs to the given user.
- No persistent state is created or modified.
- No side effects occur.

Output Shape

```json
{
  "id": "user_book_id",
  "book": {
    "id": "book_id",
    "title": "string",
    "author": "string | null",
    "coverUrl": "string | null"
  },
  "summary": "string | null",
  "reviewState": "EMPTY | FILLED",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
## Idempotency and Retry Semantics

- This operation is fully idempotent.
- Repeated calls with the same input return the same result as long as underlying data is unchanged.

## Failure Cases

| Condition                                | Domain Error                | HTTP |
|------------------------------------------|-----------------------------|------|
| UserBook not found or not owned by user  | UserBookNotFoundError       | 404  |
| Unexpected query failure                 | DatabaseError               | 500  |

## Domain Invariants Applied

- Read operations are side-effect free.
- Only user-owned data is accessible.
- Book entities are treated as immutable.
- Non-existence and forbidden access are not distinguished at the domain level.

## Notes

- This operation does not distinguish between:
  - a non-existing user_book
  - a user_book not owned by the user
- Authorization and routing concerns are handled outside the domain.

This document is expected to be split into domain query and transport documentation once the architecture stabilizes.