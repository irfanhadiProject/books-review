import db from '../../src/utils/db.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from '../helpers/db.js'
import { updateUserBookReview } from '../../src/services/bff/updateUserBookReview.service.js'
import { ValidationError } from '../../src/domain/errors/ValidationError.js'
import { UserBookNotFoundError } from '../../src/domain/errors/UserBookNotFoundError.js'

describe('updateUserBookReview', () => {
  let userId
  let userBookId
  const initialSummary = 'Original summary'

  beforeEach(async () => {
    await resetDb()

    const user = await db.query(
      `INSERT INTO users (username, password_hash, is_active, role)
       VALUES ('testuser', 'hash', true, 'user')
       RETURNING id`
    )
    userId = user.rows[0].id
    
    const book = await db.query(
      `INSERT INTO books (title, author, isbn)
       VALUES ('Test Book', 'Author', '111')
       RETURNING id`
    )
    const bookId = book.rows[0].id
    
    const userBook = await db.query(
      `INSERT INTO user_books (user_id, book_id, summary)
       VALUES ($1, $2, $3)
       RETURNING id`,
       [userId, bookId, initialSummary]
    )
    userBookId = userBook.rows[0].id
  })

  it('successfully sets summary to null', async () => {
    await updateUserBookReview({
      userId,
      userBookId,
      summary: null
    })

    const res = await db.query(
      `SELECT summary 
       FROM user_books WHERE id = $1`, 
      [userBookId]
    )

    expect(res.rows[0].summary).toBeNull()
  })

  it('rejects when summary is an empty string', async () => {
    await expect(
      updateUserBookReview({
        userId,
        userBookId,
        summary: ''
      })
    ).rejects.toBeInstanceOf(ValidationError)

    const res = await db.query(
      `SELECT summary 
       FROM user_books WHERE id = $1`,
       [userBookId]
    )

    expect(res.rows[0].summary).toBe(initialSummary)
  })

  it('rejects when user does not own the book', async () => {
    const userB = await db.query(
      `INSERT INTO users (username, password_hash, is_active, role)
       VALUES ('testuserb', 'hash', true, 'user')
       RETURNING id`
    )
    const userBId = userB.rows[0].id

    await expect(
      updateUserBookReview({
        userId: userBId,
        userBookId,
        summary: 'Attempting Hack By User B'
      })
    ).rejects.toBeInstanceOf(UserBookNotFoundError)

    const res = await db.query(
      `SELECT summary 
       FROM user_books WHERE id = $1`,
      [userBookId]
    )
    expect(res.rows[0].summary).toBe(initialSummary)
  })

  it('rejects when userBookId does not exist', async () => {
    const nonExistentId = 99999

    await expect(
      updateUserBookReview({
        userId,
        userBookId: nonExistentId,
        summary: 'Irrelevant'
      })
    ).rejects.toBeInstanceOf(UserBookNotFoundError)
  })
})