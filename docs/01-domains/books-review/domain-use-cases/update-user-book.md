# Update User Book — Domain Use Case

## Intent

Update the review content (summary) of a book that already belongs to a user.

This use case mutates an existing UserBook relationship.
It does not create or delete Book or UserBook entities.

## Input

- userId (opaque identifier)
- userBookId (identifier)
- summary (string or null)

## Core Domain Behavior

1. Resolve the UserBook relationship.
    - The UserBook must exist.
    - The UserBook must belong to the given userId.
    - User existence is not validated.

2. Validate summary input.
    - summary may be:
        - a non-empty string, or
        - null (to explicitly clear the review).
    - Empty or whitespace-only strings are invalid.

3. Apply the update atomically.
    - Update the summary field with the provided value.
    - No other fields are modified.
    - Partial updates are not allowed.

4. Persist the updated state.

## Postconditions

- The UserBook exists and is owned by the given user.
- The summary reflects the provided value or is cleared (null).
- No additional domain entities are created.
- Persistent state is consistent.

## Domain Rules Applied

- Ownership is strictly enforced.
- Mutations are scoped to a single UserBook.
- Summary content must be valid or explicitly null.
- Repeating the operation with the same input yields the same state (idempotent).

## Notes

- Authorization is ownership-based.
- Book existence is assumed through the UserBook relation.
- Transport concerns and error mapping are handled outside the domain.
