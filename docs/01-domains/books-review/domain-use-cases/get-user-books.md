# Get User Books — Domain Use Case

## Intent

Retrieve the collection of books owned by a user along with their review state.

This use case represents a pure read operation over the Books Review domain. It does not validate user existence and does not mutate any domain state.

## Actor

- Authenticated User (identified by userId)

## Input

- userId (opaque identifier)

## Preconditions

- userId is present and valid.

## Core Domain Behavior

1. Select UserBook entities associated with the given userId.
    - Only relations owned by the user are visible.
    - Cross-user access is forbidden.

2. For each UserBook:
    - Resolve its associated Book entity.
    - Derive reviewState from review content.

3. Return the resulting collection, ordered by last read date (`read_at`), followed by the record ID in descending order.
    - The collection may be empty.

## Output

A collection of UserBook summary projections:

```json
{
  "data": [
    {
      "id" : "user_book_id",
      "book": {
        "id": "book_id",
        "title": "string",
        "author": "string | null",
        "genre": "string | null",
        "coverUrl": "string | null"
      },
      "reviewState": "EMPTY | FILLED"
    }
  ],
  "meta": {
    "total": "number"
  }
}
```

## Postconditions

- No domain state is created, modified, or deleted.
- Returned data reflects the current persisted state.
- Absence of data is a valid result.

## Domain Errors

| Condition                      | Domain Error                |
|--------------------------------|-----------------------------|
| Unexpected persistence failure | DatabaseError               |

Since an empty collection is a valid domain state, "Not Found" is not considered an error here.

## Idempotency and Retry Semantics

- This operation is fully idempotent.
- Repeating the command results in the same collection projection as long as the underlying state is unchanged.
- Retrying after a transient failure is safe and has no side effects.

## Domain Rules Applied

- Read operations are side-effect free.
- Authorization is ownership-based.
- Non-existence and forbidden access are not distinguished at the domain level.

## Explicitly Out of Scope

- Pagination, sorting, or complex filtering.
- HTTP-specific response structures.
- Full review content.
