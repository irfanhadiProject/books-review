import db from '../../src/utils/db.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetDb } from '../helpers/db.js'
import { getUserBookDetail } from '../../src/services/bff/getUserBookDetail.service.js'
import { UserBookNotFoundError } from '../../src/domain/errors/UserBookNotFoundError.js'

describe('getUserBookDetail', () => {
  beforeEach(async () => {
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
    summary = null,
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

  it('returns user book detail projection', async () => {
    const userId = await seedUser()
    const userBookId = await seedUserBook({ userId })

    const result = await getUserBookDetail(userId, userBookId)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('book')
    expect(result.book).toHaveProperty('id')
    expect(result.book).toHaveProperty('title')
    expect(result).toHaveProperty('reviewState')
    expect(result).toHaveProperty('createdAt')
    expect(result).toHaveProperty('updatedAt')
  })

  it('returns FILLED reviewState when summary exists', async () => {
    const userId = await seedUser()
    const userBookId = await seedUserBook({
      userId,
      summary: 'Great book'
    })

    const result = await getUserBookDetail(userId, userBookId)

    expect(result.reviewState).toBe('FILLED')
  })

  it('returns EMPTY reviewState when summary is null', async () => {
    const userId = await seedUser()
    const userBookId = await seedUserBook({
      userId,
      summary: null
    })

    const result = await getUserBookDetail(userId, userBookId)

    expect(result.reviewState).toBe('EMPTY')
  })

  it('throws UserBookNotFoundError when user book does not exist', async () => {
    const userId = await seedUser()
    const nonExistentUserBookId = 999999

    await expect(
      getUserBookDetail(userId, nonExistentUserBookId)
    ).rejects.toBeInstanceOf(UserBookNotFoundError)
  })

  it('does not allow access to another user book', async () => {
    const userA = await seedUser('userA')
    const userB = await seedUser('userB')

    const userBookId = await seedUserBook({ userId: userB })

    await expect(
      getUserBookDetail(userA, userBookId)
    ).rejects.toBeInstanceOf(UserBookNotFoundError)
  })

  it('returns EMPTY reviewState when summary is empty string', async () => {
    const userId = await seedUser()
    const userBookId = await seedUserBook({
      userId,
      summary: ' '
    })

    const result = await getUserBookDetail(userId, userBookId)

    expect(result.reviewState).toBe('EMPTY')
  })
})