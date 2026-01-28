# Delete User Book — Domain Use Case

## Intent

Remove an existing UserBook relationship owned by a user.

This use case represents a destructive command that deletes ownership
and review state for a book. It does not delete the underlying Book entity.

## Input

- userId (opaque identifier)
- userBookId (identifier)

## Core Domain Behavior

1. Resolve the UserBook relationship.
    - The UserBook must exist.
    - The UserBook must belong to the given userId.
    - Cross-user deletion is forbidden.
    - User existence is not validated.

2. Delete the UserBook record.
    - The deletion is applied atomically.
    - No other records are affected.

## Postconditions

- The specified UserBook record no longer exists.
- The associated Book entity remains intact.
- No other UserBook records are modified.
- Domain state is consistent.

## Idempotency and Retry Semantics

- This operation is not idempotent.
- Repeating the command after success results in a not-found condition.
- Retrying after a transient failure is safe.

## Domain Rules Applied

- A user may only delete their own UserBook records.
- Book entities are immutable and never deleted by this operation.
- No partial persistence state is allowed.
- Authorization is ownership-based.

## Notes

- This use case does not distinguish between:
  - a non-existing UserBook
  - a UserBook not owned by the user
- Transport, authentication, and error mapping concerns are handled elsewhere.
