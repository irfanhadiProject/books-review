/**
 * UserBooksRepository
 *
 * Persistence boundary for user_books aggregate.
 * - Owns transactions
 * - Combines read + write
 * - No domain validation
 * - No HTTP knowledge
 */

import db from '../utils/db.js'
import { 
  findUserBookByIdAndUser, 
  queryUserBookDetailByUser 
} from '../queries/bookQueries.js'
import { updateUserBookSummary } from '../models/bookModel.js'
import { DatabaseError } from '../domain/errors/DatabaseError.js'

export async function updateUserReview({
  userBookId,
  userId,
  summary
}) {
  const client = await db.connect()

  try {
    await client.query('BEGIN')

    // 1. ownership check
    const found = await findUserBookByIdAndUser(
      client, 
      userBookId, 
      userId
    )

    if (found.rowCount === 0) {
      return null
    }

    // 2. update
    const result = await updateUserBookSummary(client, {
      userBookId,
      summary
    })

    if (result.rowCount === 0) {
      throw new DatabaseError('Update failed unexpectedly')
    }

    await client.query('COMMIT')
    return { updated: true}
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function findUserBookDetailByUser(userId, userBookId) {
  const { rows } = await queryUserBookDetailByUser(
    userId,
    userBookId
  )

  return rows[0] ?? null
}