# Add User Book — Domain Use Case

## Intent

Create a UserBook relationship between a user and a book.

This use case establishes ownership and review state. It does not manage or normalize a global book catalog.

## Actor

- Authenticated User (identified by userId)

  *notes*: authentication mechanism is out of scope; the domain assumes a valid user identity is provided.

## Input

- userId (opaque identifier)
- title (required)
- author (optional)
- isbn (optional)
- genre (optional)
- summary (optional)
- setting (optional)
- readability (optional)
- words (optional)

## Preconditions

- userId is present and valid.
- Title is provided.

## Core Domain Behavior

1. Validate input
    - title must not be empty.
2. Resolve or create Book entity
    - If ISBN is provided
      - Attempt to create a Book using ISBN as identity.
      - If a uniqueness conflict occurs:
        - Retrieve the existing Book by ISBN.
      - Any other failure aborts the operation.
    - If ISBN is not provided
      - Always create a new Book entity.
      - No deduplication is attempted.
      - The operation is not retry-safe.
3. Create UserBook aggregate
    - Create a UserBook linking userId and bookId.
    - Enforce uniqueness of (userId, bookId).
4. Persist atomically
    - Book (if created) and UserBook must be persisted in a single transaction.
    - Partial persistence is forbidden.
5. Post-commit side effects
    - If ISBN is present, optional enrichment (e.g. cover fetching) may be triggered.
    - Enrichment failures do not affect domain success.

## Output

```json
{
  "bookId": "string | number",
  "userBookId": "string | number",
  "reviewState": "EMPTY | FILLED"
}
```

## Postconditions

- A UserBook aggregate exists.
- The UserBook is associated with exactly one Book.
- No orphan Book exists.
- Review state is derived deterministically from summary.

## Domain Errors

| Condition                              | Domain Error                |
|----------------------------------------|-----------------------------|
| Missing or empty title                 | ValidationError             |
| User already has the book              | UserAlreadyHasBookError     |
| Unexpected persistence failure         | DatabaseError               |

Authentication and authorization errors are not raised by this use case.
They are enforced before invocation.

## Idempotency and Retry Semantics

- This operation is not idempotent.
- Repeating the command after success may result in a uniqueness conflict or duplicate entries is ISBN is absent.
- Retrying after a transient failure is safe if ISBN is provided.

## Domain Rules Applied

- A user can own a book only once.
- No partial persistence state is allowed.
- Book identity is strong only when ISBN is present.
- External enrichment is non-critical.

## Explicitly Out of Scope

- HTTP status codes
- Session or cookie handling
- Redirects or UI behavior
- Authorization semantics
- Retry orchestration