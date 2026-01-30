# System Architecture

## 1. System Overview

This system is a user-centric Book Review application that allows authenticated users to manage and review books they own.
The application uses Server-Side Rendering (SSR) for the frontend and a REST-based backend API for business logic and data access.
The system is designed to clearly separate presentation concerns from domain and persistence concerns, even though it is deployed as a single repository.

## 2. Architectural Style

The system follows a logically separated frontend–backend architecture.
The backend exposes a REST API that represents the system’s domain and business rules.
The frontend, implemented using SSR with EJS templates, acts as an API consumer and is not allowed to directly access the database.
All data exchange between frontend and backend is governed by explicit API contracts.

## 3. System Boundaries

### Frontend (SSR – EJS)

The frontend layer is responsible for:
- Handling browser requests and routing for page rendering
- Fetching data from the backend via HTTP calls
- Rendering HTML views using EJS templates
- Managing presentation state only

The frontend must not contain domain rules, authorization logic, or database access.

### Backend (REST API)

The backend layer is responsible for:
- Implementing domain logic and business rules
- Performing authorization and access control
- Accessing and mutating persistent data
- Mapping domain errors to HTTP responses

The backend does not render HTML and does not manage presentation concerns.

### Boundary Violations to Avoid

- Controller must not contain domain logic
- Rendering layer must not infer authorization
- Domain services must not return presentation decisions

## 4. High-Level Data Flow

At a high level, the system operates as follows:
1. A browser sends a request for a page to the frontend.
2. The frontend issues an HTTP request to the backend API.
3. The backend processes the request and interacts with the database.
4. The backend returns a JSON response.
5. The frontend renders the final HTML response to the browser.

## 5. Key Architectural Decisions

- Server-Side Rendering (SSR) is used to simplify deployment and reduce frontend complexity.
- REST API is chosen to clearly define system boundaries and enable future frontend replacement.
- Domain logic is centralized in the backend to avoid duplication.
- Direct database access from the frontend is explicitly forbidden.

## 6. Out of Scope

The following concerns are explicitly out of scope for this system:
- Microservices architecture
- Real-time communication
- Advanced caching strategies
- External authentication providers
