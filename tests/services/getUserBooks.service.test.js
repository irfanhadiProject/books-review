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
    summary = null,
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
       VALUES ($1, $2, $3, $4)`,
      [userId, book.rows[0].id, summary,readAt]
    )
  }

  it('returns books wrapped in data/meta structure', async () => {
    const userId = await seedUser()
    await seedBookForUser({ userId })

    const result = await getUserBooks(userId)

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('meta')
    expect(Array.isArray(result.data)).toBe(true)
    expect(result.meta.total).toBe(1)
  })

  it('returns correct book shape', async () => {
    const userId = await seedUser()
    await seedBookForUser({ userId, summary: 'some review'})

    const { data } = await getUserBooks(userId)
    const item = data[0]

    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('book')
    expect(item.book).toHaveProperty('id')
    expect(item.book).toHaveProperty('title')
    expect(item).toHaveProperty('reviewState')
    expect(item.reviewState).toBe('FILLED')
  })

  it('returns EMPTY reviewState when summary is null', async () => {
    const userId = await seedUser()
    await seedBookForUser({ userId, summary: null})

    const { data } = await getUserBooks(userId)

    expect(data[0].reviewState).toBe('EMPTY')
  })

  it('returns empty data array for user with no books', async () => {
    const userId = await seedUser()

    const result = await getUserBooks(userId)

    expect(result.data).toEqual([])
    expect(result.meta.total).toBe(0)
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

    const { data } = await getUserBooks(userId)

    expect(data.map(d => d.book.title)).toEqual(['New Book', 'Old Book'])
  })

  it('orders books deterministically when read_at is equal', async () => {
    const userId = await seedUser()
    const sameDate = new Date('2024-01-01T10:00:00Z')

    await seedBookForUser({ userId, title: 'Older', isbn:'1', readAt: sameDate})
    await seedBookForUser({ userId, title: 'Newer', isbn:'2', readAt: sameDate})

    const { data } = await getUserBooks(userId)

    expect(data.map(d => d.book.title)).toEqual(['Newer', 'Older'])
  })

  it('does not leak books from other users', async () => {
    const userA = await seedUser('userA')
    const userB = await seedUser('userB')

    await seedBookForUser({ userId: userA, title: 'Book A', isbn:'123'})
    await seedBookForUser({ userId: userB, title: 'Book B', isbn:'456'})

    const { data } = await getUserBooks(userA)
    
    expect(data).toHaveLength(1)
    expect(data[0].book.title).toBe('Book A')
    expect(data.map(d => d.book.title)).not.toContain('Book B')
  })
})