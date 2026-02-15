/**
 * Domain Query Service: Get User Books
 *
 * Characteristics:
 * - Read-only
 * - No invariant enforcement
 * - No transactions
 * - User ID treated as opaque identifier
 */

import { getAllBooksByUser } from '../../queries/bookQueries.js'

/**
 * getUserBooks
 * 
 * Invariants:
 * 1. userId is treated as an opaque identifier:
 *  - this function does NOT validate user existence
 *  - non-existing userId results in an empty list
 * 2. only books explicitly related to the given user are returned
 *  - no cross-user data leakage is allowed
 * 3. the function is read-only. It mustn't create, update, or delete any state
 * 4. ordering is deterministic:
 *  - primary: user_books.read_at DESC
 *  - secondary: user_books.id DESC
 *  - null read_at values are allowed and follow database ordering rules
 * 5. empty state is valid:
 *  - a user with no book must return an empty array
 * 
 * Input: 
 *  userId: sting | number
 * 
 * Output:
 *  Array<{
 *    id: string | number,
 *    title: string,
 *    author?: string | null,
 *    cover?: string | null,
 *    setting?: any | null,
 *    readability?: number | null,
 *    words?: number | null,
 *    summary?: string | null,
 *    read_at?: Date | null,
 *    user_book_id: string | number
 *  }>
 * 
 * Errors (domain-level):
 * - DatabaseError
 * 
 * Notes:
 * - This function is safe to call multiple times
 * - It does not distinguish between "user has no books" and "user does not exist"
 */
export async function getUserBooks(userId) {
  const { rows } = await getAllBooksByUser(userId)

  return {
    data: rows.map(r => ({
      id: r.user_book_id,
      book: {
        id: r.book_id,
        title: r.title,
        author: r.author,
        coverUrl: r.cover
      },
      reviewState: r.summary ? 'FILLED' : 'EMPTY'
    })),
    meta: {
      total: rows.length
    }
  }
}
