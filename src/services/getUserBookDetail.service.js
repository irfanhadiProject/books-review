/**
 * Domain Query Service: Get User Book Detail
 *
 * Characteristics:
 * - Read-only
 * - Ownership invariant enforced via repository
 * - No transactions
 * - No side effects
 * - User ID treated as opaque identifier
 */

import { findUserBookDetailByUser } from '../repositories/userBooks.repository.js'
import { UserBookNotFoundError } from '../domain/errors/UserBookNotFoundError.js'

/**
 * getUserBookDetail
 *
 * Invariants:
 * 1. The UserBook must belong to the given userId
 * 2. Cross-user access is forbidden
 * 3. User existence is not validated
 * 4. Non-existence and forbidden access are not distinguished
 *
 * Input:
 *  - userId: opaque identifier
 *  - userBookId: identifier
 *
 * Output:
 *  {
 *    id: 'user_book_id',
 *    book: {
 *      id: 'book_id',
 *      title: string,
 *      author: string | null,
 *      coverUrl: string | null
 *    },
 *    summary: string | null,
 *    reviewState: 'EMPTY' | 'FILLED',
 *    createdAt: Date,
 *    updatedAt: Date
 * }
 */

export async function getUserBookDetail(userId, userBookId) {
  // 1. Resolve ownership-bound UserBook + Book
  const row = await findUserBookDetailByUser(
    userId,
    userBookId
  )

  // 2. Non-existence and forbidden access are treated the same
  if (!row) {
    throw new UserBookNotFoundError('User book not found')
  }

  // 3. Derive review state (domain projection concern)
  const reviewState = 
    row.summary && row.summary.trim() !== ''
      ? 'FILLED'
      : 'EMPTY'
  
  // 4. Project to read model
  return {
    id: row.user_book_id,
    book: {
      id: row.book_id,
      title: row.title,
      author: row.author,
      coverUrl: row.cover
    },
    summary: row.summary,
    reviewState,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}