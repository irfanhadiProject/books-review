# Domain Invariants - Books Review

## Scope

This domain governs the relationship between a user the books they own, and the reviews associated with those books.

This domain does not cover:
- authenticatin details (e.g. password hashing, session implementation)
- UI rendering or presentation logic
- external cover fetching or enrichment mechanisms

## Core Domain Rules

### 1. User-Book Relation is Unique
- A user may have only one relationship with a given book.
- This rule is enforced by:
  - a database-level unique constraint on `(user_id, book_id)`
  - explicit domain-level validation

### 2. Book Can Exist Without Review
- A book may exist without any user review.
- Review belong to the user-book relationship, not to the book itself.

### 3. Book Identity is Best-Effor
- ISBN is optional.
- When ISBN is present, it is used for deduplication.
- When ISBN is absent, deduplication is not guaranteed.

### 4. Cover Data is Non-Critical
- Cover availability does not affect the validity of a book or a review.
- Failure to fetch cover data must not invalidate the main use case.

## Ownership and Authorization Rules

### 1. User Ownership is Mandatory
- All operations on `user_books` must be scoped by `user_id`.
- Cross-user access is not permitted.

### 2. Authorization is Binary
- An operation is either allowed or forbidden.
- Partial visibility is not supported.

### 3. Non-Existence vs Forbidden Access are Distinct
- A resource not existing is conceptually different from a resource not owned by the user.
- At the domain level, both cases are treated as *not accessible*.
- Transport-layer distinctions are handled elsewhere.

## Data Consistency Rules

### 1. No partial State
- Partial persistance is not allowed:
  - Example: a book insert succeeds while the corresponding `user_books` insert fails.
- All multi-step write operations must be executed within a transaction.

### 2. Read Operations are Side-Effect Free
- Read operations must not:
  - update timestamps
  - trigger asynchronous jobs
  - mutate any persistent state

### 3. Deterministic Ordering
- user books listings must always be returned using a consistent, deterministic ordering rule.

## Out of Scope

This domain does not:
- define UI empty state wording
- dictate redirect or navigation behavior
- guarantee the quality or availability of external metadata
- define administrator or moderator roles