/**
 * Domain Service: Authentication / Login
 * 
 * Responsibilities:
 * - Enforce login invariants
 * - Provide an atomic authentication operation
 * 
 * This service Does Not:
 * - Know about HTTP / request / response
 * - Know about session, cookies, or redirects
 * - Perform view or navigation logic 
 */

/**
 * loginUser
 * 
 * Invariants: 
 * 1. username must uniquely identify a single user in the database
 * 2. provided password must match the stored password hash
 * 3. only active users are allowed to log in
 * 4. password hash is never exposed outside the service
 * 
 * Input:
 * {
 *  username: string,
 *  password: string
 * }
 * 
 * Output:
 * {
 *  userId: string | number,
 *  username: string,
 *  role: string
 * }
 * 
 * Errors (domain-level):
 * - UserNotFoundError
 * - InvalidPasswordError
 * - UserInactiveError
 * - DatabaseError
 */

/**
 * Domain decisions:
 * - Password comparison is done via hash comparison
 * - Session creation or token issuance is handled by the controller layer
 * - Authentication does not mutate user state
 * 
 * Guarantess on success:
 * - Returned user data is valid and authenticated
 * - No partial or side effects occur
 * - Safe to retry without changing system state
 */