# Delete User Book — Domain Use Case

## Intent

Remove an existing UserBook relationship owned by a user.

This use case represents a destructive command that deletes ownership
and review state for a book. It does not delete the underlying Book entity.

## Actor

- Authenticated User (identified by userId)

## Input

- userId (opaque identifier)
- userBookId (identifier)

## Preconditions

- userId is present and valid.
- userBookId is provided.

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

## Domain Errors

| Condition                                    | Domain Error                |
|----------------------------------------------|-----------------------------|
| UserBook not found or belong to another user | UserBookNotFoundError       |
| Unexpected persistence failure               | DatabaseError               |

## Idempotency and Retry Semantics

- This operation is not idempotent.
- Repeating the command after success results in a not-found condition.
- Retrying after a transient failure is safe.

## Domain Rules Applied

- A user may only delete their own UserBook records.
- Book entities are immutable and never deleted by this operation.
- No partial persistence state is allowed.
- Authorization is ownership-based.

## Explicitly Out of Scope

- HTTP status codes.
- Physical cleanup of orphan Book entities.
- Logging or auditing of deletion events.
- UI redirection after deletion.
