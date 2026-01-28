# Error Mapping - Books Review

## Purpose

This document defines how domain-level errors are translated into transport-level errors for the Books Review system.

Domain services emit only domain errors. Controllers and middleware are responsible for mapping those errors to HTTP responses in a consistent and predictable manner.

This mapping follows the public API contract defined in `openapi.yaml` and `API_CONTRACT.md`.


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

### Authentication vs Authorization Semantics

Authentication and authorization are distinct and are intentionally
mapped to different transport-level behaviors.

Reasons:
- The API must not leak information about resource existence or ownership.
- Clients must not distinguish between "not found" and "not accessible".

As a result:
- Authentication Failures:
  - Missing session
  - Invalid session
  - Expired session

  Translated to **401 Unauthorized**

- Authorization Failures:
  - User is authenticated
  - Resource exists
  - Resource is not owned or accessible by the user

  Translated to **404 Not Found**

## HTTP Mapping

| Domain Error               | HTTP Status | Notes                                 |
|----------------------------|-------------|---------------------------------------|
| **AuthenticationError**    | 401         | Session missing, invalid, or expired  |
| **AuthorizationError**     | 404         | Resource exists but is not accessible |
| **ResourceNotFoundError**  | 404         | Resource does not exist               |
| **ConflictError**          | 409         | Domain invariant violation            |
| **ValidationError**        | 422         | Semantically invalid input            |
| **DatabaseError**          | 500         | Unexpected server failure             |

## FE Handling Expectations

- FE must rely on HTTP status codes, not error message strings.
- Error messages returned by the API are not guaranteed to be stable.
- `404` must be treated as a terminal "not available" state.
- Empty results (e.g. no user books) are not treated as errors.
- FE is responsible for deciding presentation behavior (redirects, messaging, UI states).

## Non-Goals

This document does not:
- define UI copy or user-facing error messages
- specify redirect or navigation behavior
- prescribe error logging or monitoring strategies
- define retry or recovery mechanisms

