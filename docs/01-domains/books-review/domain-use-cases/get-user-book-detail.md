# Get User Book Detail — Domain Use Case

## Intent

Retrieve detailed information for a single book that belongs to a user.

This use case represents a pure read operation over a single UserBook.
It does not validate user existence and does not mutate any domain state.

## Actor

- Authenticated User (identified by userId)

## Input

- userId (opaque identifier)
- userBookId (identifier)

## Preconditions 

- userId is present and valid.
- userBook is provided.

## Core Domain Behavior

1. Resolve the UserBook relationship.
    - The UserBook must exist.
    - The UserBook must belong to the given userId.
    - Cross-user access is forbidden.
    - User existence is not validated.

2. Resolve the associated Book entity.
    - Book data is loaded as a supporting entity.
    - Book identity and existence are inferred from the UserBook relation.

3. Project the result into a read model.
    - Represents a single UserBook projection.
    - Book data is embedded as a nested object.
    - Review state is derived from summary content.

## Output

A single UserBook projection:

```json
{
  "id": "user_book_id",
  "book": {
    "id": "book_id",
    "title": "string",
    "author": "string | null",
    "genre": "string | null",
    "coverUrl": "string | null"
  },
  "summary": "string | null",
  "setting": "string | null",
  "readability": "string | null",
  "words": "string | null",
  "reviewState": "EMPTY | FILLED",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Postconditions

- A UserBook projection is returned.
- The returned record belongs to the given user.
- No domain state is created, modified, or deleted.
- No side effects occur.

## Domain Errors

| Condition                                    | Domain Error                |
|----------------------------------------------|-----------------------------|
| UserBook not found or belong to another user | UserBookNotFoundError       |
| Unexpected persistence failure               | DatabaseError               |

## Idempotency and Retry Semantics

- This operation is fully idempotent.
- Repeating the command results in the same resource projection as long as the underlying state is unchanged.
- Retrying after a transient failure is safe and has no side effects.

## Domain Rules Applied

- Read operations are side-effect free.
- Authorization is ownership-based.
- Book entities are treated as immutable.
- Non-existence and forbidden access are not distinguished at the domain level.

## Explicitly Out of Scope

- Formatting of dates for the UI.
- Handling of expired sessions.
- Sorting or filtering.