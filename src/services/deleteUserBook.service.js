/**
 * Domain Command Service: Delete User Book
 *
 * Use case:
 * - Remove an existing user book relation owned by user
 *
 * Responsibilities:
 * - Enforce ownership (user can only delete their own user book)
 * - Validate domain rules for user book deletion
 * - Coordinate persistence changes atomically
 */

import { UserBookNotFoundError } from '../domain/errors/UserBookNotFoundError.js'
import { deleteUserBookRelation } from '../repositories/userBooks.repository.js'

/**
 * 
 * deleteUserBook
 * 
 * This service does NOT:
 * - Know about HTTP semantics (status codes, redirects)
 * - Know about sessions or authentication mechanisms
 * - Know about views or routing
 * 
 * Input:
 * {
 *   userId: string | number,
 *   userBookId: string | number
 * }
 * 
 * Domain Rules:
 * - user must own the user_books records
 * - book entities are immutable and never deleted by this operation
 * 
 * Errors (domain-level):
 * - UserBookNotFoundError
 * - DatabaseError
 * 
 * Guarantess on success:
 * - the specified user_books record no longer exist
 * - the associated Book entity remains intact
 */

export async function deleteUserBook(userId, userBookId) {
  const deleted = await deleteUserBookRelation(userId, userBookId)

  if (!deleted) {
    throw new UserBookNotFoundError()
  }
}
