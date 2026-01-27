# User Login — Authentication Flow (SSR)

This document describes the end-to-end authentication flow for logging a user into the system in the current SSR-based architecture.

It intentionally combines domain authentication rules and HTTP concerns to make login behavior explicit during early implementation.

## Intent

Authenticate a user using username and password and produce a deterministic authentication decision.

This operation verifies credentials and user status. It does not create sessions, cookies, or tokens.

## Preconditions

- Login request is initiated by an unauthenticated client.
- Authentication state is managed outside this service.
- User persistence exists.

## Input

- username (required, string)
- password (required, string)

## Core Behavior

1. Validate input:
    - username must be provided and non-empty.
    - password must be provided and non-empty.
    - Invalid input fails immediately.

2. Resolve user identity:
    - Fetch user by username.
    - If no user exists, authentication fails.

3. Enforce user state:
    - User must be active.
    - Inactive users are not allowed to authenticate.

4. Verify credentials:
    - Compare provided password against stored password hash.
    - Plaintext passwords are never exposed or returned.

5. Produce authentication decision:
    - On success, return authenticated user identity attributes.
    - No session, cookie, or token is created at this stage.

## Postconditions (on success)

- User credentials are verified.
- Returned user data represents an authenticated identity.
- No persistent state is mutated.
- No side effects occur.

## Output Shape

```json
{
  "userId": "string | number",
  "username": "string",
  "role": "string"
}
```

## Idempotency and Retry Semantics

- This operation is fully idempotent.
- Repeating the request does not change system state.
- Safe to retry on transient failures.

## Failure Cases

| Condition                              | Domain Error                | HTTP |
|----------------------------------------|-----------------------------|------|
| Missing or invalid input               | ValidationError             | 422  |
| User not found                         | UserNotFoundError           | 404  |
| User inactive                          | UserInactiveError           | 403  |
| Invalid password                       | InvalidPasswordError        | 401  |
| Unexpected persistence failure         | DatabaseError               | 500  |


## Domain Invariants Applied

- Username uniquely identifies a single user.
- Only active users may authenticate.
- Password verification uses secure hash comparison.
- Authentication does not mutate user state.
- Password hashes are never exposed.

## Notes

- This operation does not:
  - create sessions
  - set cookies
  - issue tokens
  - perform redirects
  - Session and transport concerns are handled by the controller layer.
- This document is expected to be split into:
  - authentication domain documentation
  - transport / session handling documentation once the architecture stabilizes.