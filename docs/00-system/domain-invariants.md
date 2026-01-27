# Domain Invariants - Books Review

## Scope

This domain governs the relationship between a user, the books they own, and the reviews associated with those books.

This domain does not cover:
- authenticatin details (e.g. password hashing, session implementation)
- UI rendering or presentation logic
- external cover fetching or enrichment mechanisms

## Aggregate Model

### Aggregate Root

**UserBook** is the only aggregate root in this domain.

- All write operations originate from UserBook creation or mutation.
- Book entities are supporting entities.
- User entities are external and treated as opaque references.

No domain operation mutates Book state after creation.

As a consequence:
- Book entities are immutable within this domain after creation.
- This domain does not manage book catalog quality or normalization.

## Core Domain Rules

### 1. User-Book Relation is Unique
- A user may have only one relationship with a given book.
- This rule is enforced by:
  - a database-level unique constraint on `(user_id, book_id)`
  - domain-level conflict handling based on persistence error

### 2. Book Can Exist Without Review
- A book may exist without any user review.
- Review belong to the user-book relationship, not to the book itself.

### 3. Book Identity Rules
- ISBN is optional.
- When ISBN is present:
  - It is treated as a strong identity.
  - Book creation is retry-safe (best-effort).
- When ISBN is absent:
  - No deduplication is attempted.
  - Each request creates a new Book entity.
  - Retry is NOT idempotent.

This is an explicit domain decision.

### 4. No Partial Persistence State
- Partial writes are forbidden.
- Any operation that creates or mutates multiple entities must be transactional.
- If any step fails:
  - All previous changes must be rolled back.

Example forbidden state:
- Book exists but corresponding UserBook does not.

### 5. External Enrichment is Non-Critical
- External metadata (e.g. cover image) is non-essential.
- Failure in enrichment must not invalidate the main use case.
- Enrichment may only occur after a successful commit.
- Enrichment must not mutate core domain invariants.
- Enrichment failures may be silently ignored and must not be retried synchronously.

## Ownership and Authorization Rules

### 1. User Ownership is Mandatory
- All operations on `user_books` must be scoped by `user_id`.
- Cross-user access is not permitted.

### 2. Authorization is All-or-Nothing
- An operation is either allowed or forbidden.
- Partial visibility is not supported.

### 3. Non-Existence vs Forbidden Access are Distinct
- A resource not existing is conceptually different from a resource not owned by the user.
- At the domain level, both cases are treated as *not accessible*.
- Transport-layer distinctions are handled elsewhere.

## Data Consistency Rules

### 1. Read Operations are Side-Effect Free
- Read operations must not:
  - update timestamps
  - trigger asynchronous jobs
  - mutate any persistent state

### 2. Deterministic Ordering
- user books listings must be returned using a consistent ordering rule as defined by the use case.

## Out of Scope

This domain does not:
- guarantee global book catalog deduplication
- define retry behavior for non-ISBN inputs
- dictate redirect or navigation behavior
- support partial visibility or soft authorization
- guarantee the quality or availability of external metadata
- define administrator or moderator roles