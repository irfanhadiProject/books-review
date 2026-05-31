# Update User Book — Domain Use Case

## Intent

Update the review content (`summary`, `setting`, `readability`, `words`) of a book that already belongs to a user.

This use case mutates an existing UserBook relationship.
It does not create or delete Book or UserBook entities.

## Actor

- Authenticated User (identified by `userId`)

## Input

- `userId` (opaque identifier)
- `userBookId` (identifier)
- `summary` (string or null)
- `setting` (string or null)
- `readability` (string or null)
- `words` (string or null)

## Preconditions

- `userId` is present and valid.
- `userBookId` is provided.

## Core Domain Behavior

1. Resolve the UserBook relationship.
    - The UserBook must exist.
    - The UserBook must belong to the given `userId`.
    - User existence is not validated.

2. Validate review input (`summary`, `setting`, `readability`, `words`).
    - Each field is optional but must follow these rules if provided:
        - Allowed: a non-empty string or null.
        - Forbidden: Empty strings or strings containing only whitespace.
    - If any provided field violated this, abort with `ValidationError`

3. Apply the update atomically.
    - Update the `summary`, `setting`, `readability`, and `words` fields with the provided value.
    - The operation must ensure all provided fields are updated within a single transaction.
    - Provided values will overwrite existing data. Fields not present in the input should remain unchanged.

4. Persist the updated state.

## Postconditions

- The UserBook exists and is owned by the given user.
- All review fields (`summary`, `setting`, `readability`,`words`) reflect the provided values or are cleared (null).
- No additional domain entities are created.
- Persistent state is consistent.

## Domain Errors

| Condition                                    | Domain Error                |
|----------------------------------------------|-----------------------------|
| UserBook not found or belong to another user | UserBookNotFoundError       |
| Invalid input format                         | ValidationError             |
| Unexpected persistence failure               | DatabaseError               |

## Idempotency and Retry Semantics

- This operation is fully idempotent.
- Repeating the command with the same input results in the same persistent state.
- Retrying after a transient failure is safe.

## Domain Rules Applied

- Ownership is strictly enforced.
- Mutations are scoped to a single UserBook.
- Review content (`summary`, `setting`, `readability`,`words`) must be valid or explicitly null.
- Repeating the operation with the same input yields the same state (idempotent).

## Explicitly Out of Scope

- Validating the factual correctness of the review.
- Changing the associated Book entity.
- HTTP response codes or redirects.
