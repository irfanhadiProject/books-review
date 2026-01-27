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

Represents a supporting entity describing a book.

Fields: 
- id (opaque identifier)
- title
- author
- isbn (optional)
- coverUrl (optional)

Notes: 
- Book is not an aggregate root.
- Book entities are immutable within this domain after creation.
- No domain operation mutates Book state after creation.
- ISBN is optional:
  - When present, it acts as a strong identity hint.
  - When absent, no identity guarantee is provided.
- Deduplication behavior is best-effort and handled at the persistence layer.
- Cover URL is non-critical metadata and may be populated asynchronously.
- Book entities contain no user-specific or review-related state.

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
- UserBook is the solo aggregate root in this domain.
- All write operations must originate from UserBook creation or mutation.
- Review data belongs exclusively to UserBook.
- A User cannot have more than one UserBook for the same book.
- Domain identity is defined by the (userId, bookId) pair.
- The id field is a technical identifier and does not define domain identity.
- Review content cannot exist without an owning UserBook.

## Relationships

- A User can have many UserBooks.
- A Book can be associated with many UserBooks.
- A UserBook belongs to exactly one User and one Book.

Constraints:
- (userId, bookId) must be unique.
- Creation of Book without a corresponding UserBook is forbidden.

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