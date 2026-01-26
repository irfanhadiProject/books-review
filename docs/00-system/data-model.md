# Data Model - Books Review

## Purpose

This document defines the core domain data structures and their relationships.

It describes the shape and semantics of domain entities as used by domain services and exposed through read models.

This document is implementation-agnostic and does not prescribe database schema or storage technology.

## Core Entities

### User

Represents an authenticated account in the system.

Fields:
- id (opaque identifier)
- email
- status (active | inactive)

Notes:
- User identity is managed by the authentication subsystem.
- This domain does not manage user lifecycle.
- User identifiers are treated as opaque and stable.
- No domain behavior mutates User state directly.

### Book

Represents a logical book entity.

Fields: 
- id (opaque identifier)
- title
- author
- isbn (optional)
- coverUrl (optional)

Notes: 
- A book may exist without any associated review.
- ISBN is optional and not guaranteed to be unique at the domain level.
- Persistence layer may enforce best-effort deduplication when ISBN is present.
- Cover URL is non-critical metadata.
- Book entities are review-agnostic and contain no user-specific state.

### UserBook

Represents the ownership and review state of a book for a specific user.

Fields:
- id (opaque identifier)
- userId
- bookId
- summary (optional)
- createdAt
- updatedAt
- readAt (optional)

Notes:
- This is the aggregate root for user-book interactions.
- Review data belongs to UserBook, not to Book.
- A user cannot have more than one UserBook for the same Book.
- Logical identity is defined bu the (userId, bookId) pair.
- The id field is a technical identifier and does not define domain identity.
- UserBooks governs invariants related to review ownership and lifecycle.
- Review content cannot exist without an owning UserBook.

## Relationships

- A User can have many UserBooks.
- A Book can be associated with many UserBooks.
- A UserBook belongs to exactly one User and one Book.

Constraints:
- (userId, bookId) must be unique.

## Derived / Computed Fields

Some fields exposed in read models are derived and not persisted directly.

Examples:
- reviewState
  - Derived from the presence and completeness of summary.
  - Possible values: EMPTY | FILLED

Derived fields:
- must be deterministic
- must not depend on external systems
- must not mutate persisted state

## Persistence Notes

- Persistence is relational but not prescribed by this document.
- All identifiers are treated as opaque strings.
- Timestamp fields use server time.
- Read operations must not mutate persistence state.

## Out of Scope

This document does not:
- define database schema or migrations
- describe indexing strategies
- specify ORM or query implementation
- define caching or denormalization strategies