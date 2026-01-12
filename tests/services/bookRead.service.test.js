import db from '../../src/utils/db.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetDb } from '../helpers/db.js'
import { getUserBooks } from '../../src/services/getUserBooks.service.js'

describe('getUserBooks', () => {
  beforeEach(async () => {
    await resetDb()
  })

  async function seedUser(username = 'user1') {
    const result = await db.query(
      `INSERT INTO users (username, password_hash, is_active, role)
       VALUES ($1, 'hash', true, 'user')
       RETURNING id`,
       [username]
    )
    return result.rows[0].id
  }

  async function seedBookForUser({ 
    userId, 
    title = 'Book A', 
    isbn = '111',
    readAt = null,
  }) {
    const book = await db.query(
      `INSERT INTO books (title, isbn)
       VALUES ($1, $2)
       RETURNING id`,
      [title, isbn]
    )

    await db.query(
      `INSERT INTO user_books (user_id, book_id, summary, read_at)
       VALUES ($1, $2, 'summary', $3)`,
      [userId, book.rows[0].id, readAt]
    )
  }

  it('returns list of books for user', async () => {
    const userId = await seedUser()
    await seedBookForUser({ userId })

    const books = await getUserBooks(userId)

    expect(Array.isArray(books)).toBe(true)
    expect(books.length).toBe(1)

    const book = books[0]
    expect(book).toHaveProperty('id')
    expect(book).toHaveProperty('title')
    expect(book).toHaveProperty('user_book_id')
    expect(book).toHaveProperty('summary')
  })

  it('returns empty array if user has no books', async () => {
    const userId = await seedUser()
    const books = await getUserBooks(userId)

    expect(books).toEqual([])
  })

  it('returns books ordered by read_at desc', async () => {
    const userId = await seedUser()
    const oldDate = new Date('2024-01-01T00:00:00Z')
    const newDate = new Date('2024-01-02T00:00:00Z')


    await seedBookForUser({
      userId,
      title: 'Old Book',
      isbn: '1',
      readAt: oldDate
    })

    await seedBookForUser({
      userId,
      title: 'New Book',
      isbn: '2',
      readAt: newDate
    })

    const books = await getUserBooks(userId)

    expect(books.map(b => b.title)).toEqual(['New Book', 'Old Book'])
  })

  it('orders books deterministically when read_at is equal', async () => {
    const userId = await seedUser()
    const sameDate = new Date('2024-01-01T10:00:00Z')

    await seedBookForUser({ userId, title: 'Book 1', isbn:'1', readAt: sameDate})
    await seedBookForUser({ userId, title: 'Book 2', isbn:'2', readAt: sameDate})

    const books = await getUserBooks(userId)

    expect(books.map(b => b.title)).toEqual(['Book 2', 'Book 1'])
  })

  it('does not leak books from other users', async () => {
    const userA = await seedUser('userA')
    const userB = await seedUser('userB')

    await seedBookForUser({ userId: userA, title: 'Book A', isbn:'123'})
    await seedBookForUser({ userId: userB, title: 'Book B', isbn:'456'})

    const books = await getUserBooks(userA)
    
    expect(books).toHaveLength(1)
    expect(books[0].title).toBe('Book A')
    expect(books.map(b => b.title)).not.toContain('Book B')
  })
})