import db from '../../src/utils/db.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from '../helpers/db.js'
import { deleteUserBook } from '../../src/services/deleteUserBook.service.js'
import { UserBookNotFoundError } from '../../src/domain/errors/UserBookNotFoundError.js'

describe('deleteUserBook', () => {
  beforeEach( async () => {
    await resetDb()
  })

  async function seedUser(username = 'user') {
    const result = await db.query(
      `INSERT INTO users (username, password_hash, is_active, role)
       VALUES ($1, 'hash', true, 'user')
       RETURNING id`,
       [username]
    )
    return result.rows[0].id
  }

  async function seedUserBook({
    userId,
    title = 'Book A', 
    author = null,
    summary = null
  }) {
    const book = await db.query(
      `INSERT INTO books (title, author)
       VALUES ($1, $2)
       RETURNING id`,
       [title, author]
    )

    const userBook = await db.query(
      `INSERT INTO user_books (user_id, book_id, summary)
       VALUES ($1, $2, $3)
       RETURNING id`,
       [userId, book.rows[0].id, summary]
    )

    return userBook.rows[0].id
  }

  it('successfully delete user book relation', async () => {
    const userId = await seedUser('User A')
    const userBookId = await seedUserBook({ userId })

    await deleteUserBook(userId, userBookId)

    const res = await db.query(
      `SELECT user_id, book_id
       FROM user_books WHERE id = $1`,
       [userBookId]
    )

    expect(res.rowCount).toBe(0)
  })

  it('throws UserBookNotFoundError if user book does not exist', async () => {
    const userId = await seedUser('User A')
    const nonExistentUserBookId = 999999

    await expect(
      deleteUserBook(userId, nonExistentUserBookId)
    ).rejects.toBeInstanceOf(UserBookNotFoundError)
  })

  it('does not allow accesss to another user book', async () => {
    const userIdA = await seedUser('User A')
    const userIdB = await seedUser('User B')
    const userBookIdA = await seedUserBook({ userId: userIdA })

    await expect(
      deleteUserBook(userIdB, userBookIdA)
    ).rejects.toBeInstanceOf(UserBookNotFoundError)

    const res = await db.query(
      `SELECT user_id, book_id
       FROM user_books WHERE id = $1`,
       [userBookIdA]
    )

    expect(res.rowCount).toBe(1)
  })

  it('does not allow repeated deletion on the same resource', async () => {
    const userId = await seedUser('User A')
    const userBookId = await seedUserBook({ userId })

    await deleteUserBook(userId, userBookId)
    
    await expect(
      deleteUserBook(userId, userBookId)
    ).rejects.toBeInstanceOf(UserBookNotFoundError)
  })
})