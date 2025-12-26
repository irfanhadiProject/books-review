/**
 * Domain Service: Authentication / Login
 * 
 * Responsibilities:
 * - Enforce login invariants
 * - Provide a deterministic authentication decision
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
import db from '../utils/db.js'
import bcrypt from 'bcrypt'
import { findUserByUsername } from '../models/authModel.js'
import { ValidationError } from '../domain/errors/ValidationError.js'
import { UserNotFoundError } from '../domain/errors/UserNotFoundError.js'
import { UserInactiveError } from '../domain/errors/UserInactiveError.js'
import { InvalidPasswordError } from '../domain/errors/InvalidPasswordError.js'
import { mapToDomainError } from '../utils/mapToDomainError.js'

export async function loginUser(input) {
  const { username, password } = input

  if (!username || !password) {
    throw new ValidationError('username and password are required')
  }

  let client

  try {
    client = await db.connect()
    // 1. fetch user by username
    const result = await findUserByUsername(client, username)
    
    if (result.rowCount === 0) {
      throw new UserNotFoundError()
    }
    
    // 2. check if user active
    const user = result.rows[0]

    if (!user.is_active) {
      throw new UserInactiveError()
    }

    // 3. check password hash
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!isMatch) {
      throw new InvalidPasswordError()
    } 
    // 4. return user data or token/session
    return {
      userId: user.id,
      username,
      role: user.role
    }
  } catch (err) {
    throw mapToDomainError(err)
  } finally {
    if (client) client.release()
  }
}