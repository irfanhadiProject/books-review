/**
 * Domain Command Service: Update User Book Review
 *
 * Use case:
 * - Update review (summary) for a user-owned book entry
 *
 * Responsibilities:
 * - Enforce ownership (user can only update their own review)
 * - Validate domain rules for review updates
 * - Coordinate persistence changes atomically
 */

import { updateUserReview } from '../../repositories/userBooks.repository.js'
import { ValidationError } from '../../domain/errors/ValidationError.js'
import { UserBookNotFoundError } from '../../domain/errors/UserBookNotFoundError.js'

/**
 * updateUserBookReview
 * 
 * This service does NOT:
 * - Know about HTTP semantics (status codes, redirects)
 * - Know about sessions or authentication mechanisms
 * - Know about views or routing
 *
 * Input:
 * {
 *   userId: string | number,
 *   userBookId: string | number,
 *   summary?: string | null
 * }
 *
 * Domain rules:
 * - summary is optional
 * - when provided, summary must not be an empty string
 * - user must own the user_books record
 *
 * Errors (domain-level):
 * - ValidationError
 * - UserBookNotFoundError
 * - DatabaseError 
 *
 * Guarantees on success:
 * - user_books row exists and belongs to user
 * - summary is updated (or explicitly set to null)
 * - no partial update occurs
*/
export async function updateUserBookReview({
  userId,
  userBookId,
  summary
}) {
  if (summary !== undefined && summary !== null) {
    if (typeof summary !== 'string' || summary.trim() === '') {
      throw new ValidationError('Invalid input', { summary: 'summary must be a non-empty string or null' })
    }
  }

  const result = await updateUserReview({
    userId,
    userBookId,
    summary
  })
  
  if(!result) {
    throw new UserBookNotFoundError()
  }
}
