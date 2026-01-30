# Authentication Domain Boundary

## Purpose

Define the responsibility boundary of the Authentication domain.

This domain is responsible for verifying user identity and producing a deterministic authentication decision.

It is NOT responsible for:
- session creation
- session invalidation
- cookies
- tokens
- redirects
- transport concerns

## Domain Responsibility

- Validate authentication credentials.
- Enforce user eligibility for authentication.
- Produce authenticated identity attributes on success.

## Invariants

- Authentication must not mutate user state.
- Authentication must not leak credential material.
- Authentication result must be deterministic.

## Explicitly Out of Scope

- Session lifecycle management
- Logout semantics
- Authentication persistence
- Rate limiting
- Transport-level security concerns

