# User Login — Request Flow (SSR)

This document describes the application-level request flow for authenticating
a user in an SSR-based architecture.

It focuses on request orchestration, boundary handling, and error mapping.
All authentication rules are delegated to the authentication domain.

## Intent

Handle an unauthenticated login request by invoking the authentication
domain use case and returning a transport-level response.

This flow does not define authentication rules, credential validation logic,
or domain invariants.

## Preconditions

- The client is unauthenticated.
- User persistence exists.
- Session handling is managed outside the domain.

## Input

Request payload:
- username (required)
- password (required)

## Application Flow

1. Receive HTTP request.
    - Ensure request is unauthenticated.
    - Parse request payload.

2. Validate request payload.
    - Ensure required fields are present.
    - Reject structurally invalid input early.

3. Invoke domain use case.
    - Call `AuthenticateUser` with:
      - username
      - password

4. Handle domain result.
    - On success:
      - Establish authenticated session.
      - Prepare SSR response state.
    - On domain error:
      - Map error using application error-mapping rules.

5. Send response.
    - No redirects or rendering decisions are defined here.
    - Presentation is handled by the caller.

## Domain Delegation

All authentication behavior is defined in:

`01-domains/authentication/domain-use-cases/authenticate-user.md`

Including but not limited to:
- Credential verification
- User state validation
- Authentication decision semantics

This document must not duplicate those rules.

## Error Handling

Domain errors are mapped to HTTP responses according to:

`02-application/authentication/error-mapping.md`

This flow does not interpret domain errors directly.

## Postconditions (on success)

- An authenticated session is established.
- A consistent application response is returned.
- No domain state is mutated.

## Notes

- This flow is SSR-oriented but transport-agnostic.
- No credential or user rules should be inferred from this document.
- Session and cookie mechanics are handled outside the domain.
