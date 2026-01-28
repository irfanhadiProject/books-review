# Get User Books — Domain Use Case

## Intent

Retrieve the collection of books owned by a user along with their review state.

This use case represents a pure read operation over the Books Review domain. It does not validate user existence and does not mutate any domain state.

## Input

- userId (opaque identifier)

## Core Domain Behavior

1. Select UserBook entities associated with the given userId.
    - Only relations owned by the user are visible.
    - Cross-user access is forbidden.

2. For each UserBook:
    - Resolve its associated Book entity.
    - Derive reviewState from review content.

3. Return the resulting collection.
    - The collection may be empty.

## Postconditions

- No domain state is created, modified, or deleted.
- Returned data reflects the current persisted state.
- Absence of data is a valid result.

## Domain Rules Applied

- Read operations are side-effect free.
- Authorization is ownership-based.
- Non-existence and forbidden access are not distinguished at the domain level.

## Notes

- Ordering is not a domain invariant.
- Projection shape is not prescribed here.
- Transport and query optimization concerns are handled elsewhere.
