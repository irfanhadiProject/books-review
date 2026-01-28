# Error Mapping – Authentication

## Purpose

This document defines how domain-level errors produced by the Authentication system are translated into transport-level errors.

Unlike resource-oriented domains (e.g. Books Review), Authentication acts as a system entry point and is responsible for establishing user identity. As such, its error semantics differ by design.

This mapping follows the public API contract defined in `openapi.yaml` and `API_CONTRACT.md`.

## Domain Error Taxonomy

The following domain errors may be produced by authentication domain services:

- **AuthenticationError**

  Thrown when authentication fails due to invalid or missing credentials, inactive accounts, or invalid identity state.

- **ValidationError**

  Thrown when authentication input data is syntactically or semantically invalid (e.g. missing fields, malformed email).

- **ConflictError**

  Thrown when an authentication-related invariant is violated (e.g. attempting to register an already-registered identity).

- **DatabaseError**

  Thrown when an unexpected persistence failure occurs.

### Error Specialization Notes

Concrete domain errors may exist as specializations of the domain error categories defined above.

For example:

- `InvalidPasswordError`
- `UserNotFoundError`
- `UserInactiveError`
- `SessionExpiredError`

All of the above are treated as AuthenticationError at the transport level. These concrete errors are internal to the authentication domain and are not exposed as part of the external contract.

### Authentication Semantics (Authentication Domain)

In the Authentication system, authentication failure is the primary domain concern, not an access-control side effect.

As a result:

- The system intentionally does not distinguish between:
  - invalid credentials
  - non-existent users
  - inactive accounts
- This prevents user enumeration and information leakage.

All such failures are treated uniformly.

## HTTP Mapping

| Domain Error               | HTTP Status | Notes                                  |
|----------------------------|-------------|----------------------------------------|
| **AuthenticationError**    | 401         | Invalid credentials or identity state  |
| **ValidationError**        | 422         | Invalid authentication input           |
| **ConflictError**          | 409         | Identity already exists                |
| **DatabaseError**          | 500         | Unexpected server failure              |

## Relationship to Other Domains

- The Authentication system is the source of user identity.
- Other domains (e.g. Books Review) must not re-interpret authentication failures.
- Once authentication succeeds, downstream domains rely on:
  - opaque userId
  - validated session or token

Authorization and ownership checks are explicitly out of scope for this domain.

## FE Handling Expectations

- FE must rely on HTTP status codes, not error message strings.
- `401` represents a terminal authentication failure.
- FE must not infer whether a user exists based on error responses.
- Retry behavior is a client concern.

## Non-Goals

This document does not:

- define password policy or credential rules
- define UI copy or user-facing error messages
- specify redirect behavior after login failure
- prescribe session storage or token strategy
- define authorization or resource access rules