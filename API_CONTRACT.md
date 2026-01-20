# API Contract – Frontend & Backend Agreement (v1)

This document defines **collaboration rules and behavioral guarantees**
between Frontend (FE) and Backend (BE).

The **technical specification** of endpoints, schemas, status codes,
and payload structures is defined in `openapi.yaml` and is the
**authoritative source of truth**.

This document captures **rules, constraints, and expectations**
that cannot be fully expressed in OpenAPI.

---

## 1. Source of Truth

- `openapi.yaml` is the canonical API specification.
- FE must rely **only** on:
  - documented endpoints
  - documented response shapes
  - documented HTTP status codes
- FE must not rely on:
  - database schema
  - ORM models
  - backend service-layer return values
- BE must not expose internal domain or persistence structures directly
  through API responses.

---

## 2. Authentication & Session Handling

- Authentication is **session-based** using HTTP-only cookies.
- No access token or session identifier is returned in any API response.
- Protected endpoints return:
  - `401 Unauthorized` when the session is missing or expired.

### FE Responsibilities
- Must include credentials (cookies) on authenticated requests.
- Must redirect the user to `/login` on any `401` response.
- Must not attempt to read, infer, or store authentication state
  outside of documented API responses.

### BE Responsibilities
- Must not include `userId`, `role`, or session identifiers in responses.
- Must not use `403 Forbidden` for authentication failures.
- Authorization failures are expressed as:
  - `404 Not Found` when a resource is not accessible by the user.

---

## 3. Read Models vs Write Models

- All responses under `/user-books` are **read models**.
- Read models may include **derived state**, such as:
  - `reviewState`
- Derived fields:
  - Are computed exclusively by the backend.
  - Are treated as **read-only** by FE.
  - Must not be inferred by FE from other fields (e.g. `summary`).

### Write Operations
- `POST`, `PATCH`, and `DELETE` endpoints:
  - Do not return derived or computed state.
  - Return only identifiers or a generic success envelope.
- FE must refresh read models via subsequent `GET` requests
  if updated state is required.

---

## 4. Error Handling Contract

- Error responses follow the `ErrorResponse` schema defined in OpenAPI.
- Status code semantics:

| Status | Meaning |
|------|--------|
| 401 | Authentication required or session expired |
| 404 | Resource not found or not accessible |
| 409 | Conflict with existing data |
| 422 | Validation error |
| 500 | Unexpected server error |

- `409 Conflict` is used when a request violates a uniqueness or
  existence constraint (e.g. adding a book that already exists
  in the user's collection).

- `500 Internal Server Error`:
  - Is **always possible** on any endpoint.
  - Is intentionally omitted from some OpenAPI path definitions
    to reduce noise.
- FE must handle `500` as a global failure state.

### Error Messages
- Error message strings:
  - Are intended for display only.
  - Are **not stable API identifiers**.
- FE must not branch logic based on exact message text.

---

## 5. Change Policy

- Any **breaking change** requires:
  - Updating `openapi.yaml`
  - API version increment (e.g. `/v1` → `/v2`)
  - Explicit documentation of FE impact
- Breaking changes include:
  - Removing or renaming fields
  - Changing field semantics
  - Changing status code meaning
  - Introducing new HTTP status codes on existing endpoints
- Non-breaking changes:
  - May add optional fields
  - Must not alter existing response shapes or meanings

---

## 6. Development Boundaries

### Frontend Must Not
- Access backend persistence or domain logic.
- Reimplement backend validation or business rules.
- Compute or infer derived backend state.

### Backend Must Not
- Encode UI flow assumptions.
- Depend on FE rendering or navigation behavior.
- Introduce FE-specific response formats.

---

## 7. Ownership

- Frontend owns:
  - UI rendering
  - client-side state
  - navigation and UX decisions
- Backend owns:
  - data integrity
  - authorization rules
  - derived state computation
  - API contract stability

---

## 8. API Versioning Guarantees

This document is versioned and released together with the corresponding OpenAPI specification and Git tag.

### Version Scope
- API version is encoded in the URL path (e.g. `/api/v1`).
- All endpoints under the same version share the same stability guarantees.

### Guaranteed Stable Within a Version
Within the same major version (`v1`):

- Existing endpoints will not be removed.
- Existing response fields will not be:
  - renamed
  - removed
  - change their semantic meaning.
- Existing status code meanings will not change.

### Allowed Changes Within a Version
The following changes are considered **non-breaking**:

- Adding new endpoints.
- Adding new optional fields to responses.
- Adding new error cases using **existing status codes**.
- Internal backend refactors with no API-visible effect.

### Breaking Changes (Require New Version)
A new major version (`v2`) is required when:

- An endpoint is removed or renamed.
- A response field is removed or renamed.
- Field semantics change (even if the type stays the same).
- Authentication or authorization behavior changes.
- Status code meaning changes.

### Deprecation Policy
- No endpoint is deprecated within the same major version.
- Deprecated behavior must be removed only in a new major version.
