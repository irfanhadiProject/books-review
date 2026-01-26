# Error Mapping - Books Review

## Purpose

This document defines how domain-level errors are translated into transport-level errors for the Books Review system.

Domain services emit only domain errors. Controller and middleware are responsible for mapping those errors to HTTP responses in a consistent and predictable manner.

## Domain Error Taxonomy
 
The following domain errors may be produced by domain services:

- **AuthenticationError**

  Thrown when a valid user context is required but not present.

- **AuthorizationError**
  
  Thrown when a user attempts to access or modify a resource they do not own.

- **ResourceNotFoundError**
  
  Thrown when a requested domain entity does not exist.

- **ConflictError**
  
  Thrown when a domain invariant is violated (e.g duplicate user-book relationship).

- **ValidationError**
  
  Thrown when input data violates domain validation rules.

- **DatabaseError**
  
  Thrown when an unexpected persistence failure occurs.

### Error Specialization Notes

Concrete domain errors may exist as specializations of the domain error categories defined above.

For example:
- `InvalidPasswordError`, `UserInactiveError`, and `UserNotFoundError` are treated as **AuthenticationError** at the transport level.
- `UserAlreadyHasBookError` is treated as **ConflictError**.
- `UserBookNotFoundError` is treated as **ResourceNotFoundError**.

These concrete errors are internal to the domain layer and are not exposed as part of the external contract.

### Authentication vs Authorization Mapping

In this system, authentication-related failures and authorization failures are intentionally mapped to the same transport-level error.

Reasons:
- All protected operations require a valid user session.
- The system does not expose fine-grained authorization states to the client.
- From the client perspective, both cases require re-authentication.
- This avoids leaking resource existence or ownership information.

As a result:
- `AuthenticationError` and `AuthorizationError` are both translated to HTTP 401.
- The distinction remains at the domain level but is intentionally collapsed at the transport layer.

## HTTP Mapping

| Domain Error            | HTTP Status | Notes |
|------------------------|-------------|-------|
| **AuthenticationError**    | 401         | Session missing, expired, invalid, or access not permitted |
| **AuthorizationError**     | 401         | Intentionally collapsed with AuthenticationError |
| **ResourceNotFoundError**  | 404         | Resource does not exist |
| **ConflictError**          | 409         | Domain invariant violation |
| **ValidationError**        | 422         | Semantically invalid input |
| **DatabaseError**          | 500         | Unexpected server failure |

## FE Handling Expectations

- FE must rely on HTTP status codes, not error message strings.
- Error messages returned by the API are not guaranteed to be stable.
- Empty results (e.g. no user books) are not treated as errors.
- FE is responsible for deciding presentation behavior (redirects, messaging, UI states).

## Non-Goals

This document does not:
- define UI copy or user-facing error messages
- specify redirect or navigation behavior
- prescribe error logging or monitoring strategies
- define retry or recovery mechanisms

