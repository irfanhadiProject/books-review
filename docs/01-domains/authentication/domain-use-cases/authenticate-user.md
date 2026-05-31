# Authenticate User — Domain Use Case

## Intent

Verify user credentials and produce an authentication decision.

This use case represents a pure authentication operation. It does not create sessions, cookies, or tokens.

## Actor

- Anonymous User (attempting to identify themselves)

## Input

- username (string)
- password (string)

## Core Domain Behavior

1. Validate input.
    - username must be non-empty.
    - password must be non-empty.

2. Resolve user identity.
    - Fetch user by username.
    - If not found, authentication fails.

3. Enforce user state.
    - User must be active.

4. Verify credentials.
    - Compare provided password with stored password hash.
    - Plaintext passwords are never exposed.

5. Produce authentication result.
    - On success, return authenticated identity attributes.

## Output

```json
{
  "userId": "opaque identifier",
  "username": "string",
  "role": "string"
}
```

## Postconditions

- No domain state is mutated.
- Authentication decision is deterministic.

## Domain Errors

| Condition                           | Domain Error                |
|-------------------------------------|-----------------------------|
| Empty username or password          | ValidationError             |
| Password is not match               | InvalidPasswordError        |
| User account is not exist           | UserNotFoundError           |
| User account is not active          | UserInactiveError           |
| Unexpected lookup failure           | DatabaseError               |

## Idempotency

- Fully idempotent.

## Domain Rules Applied

- Username uniquely identifies a user.
- Only active users may authenticate.
- Password verification is cryptographically secure.

## Explicitly Out of Scope

- Token issuance and session storage.
- Rate limiting or brute-force protection.
- Cookie management or HTTP header implementation.
- Password reset or recovery flows.