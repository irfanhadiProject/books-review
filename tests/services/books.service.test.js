import db from '../../src/utils/db.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetDb } from '../helpers/db.js'
import { addBookToUserCollection, getUserBooks } from '../../src/services/books.service.js'
import { UserAlreadyHasBookError } from '../../src/domain/errors/UserAlreadyHasBookError.js'
import { ValidationError } from '../../src/domain/errors/ValidationError.js'


describe('addBookToUserCollection', () => {
  let userId

  beforeEach(async () => {
    await resetDb()
    const res = await db.query(
      `INSERT INTO users(username, password_hash, is_active, role)
       VALUES ('test', 'hash', true, 'user') RETURNING id`
    )
    userId = res.rows[0].id
  })

  it('creates book and user_books when ISBN is new', async () => {
    const result = await addBookToUserCollection({
      userId,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884'
    })

    expect(result.bookId).toBeDefined()
    expect(result.userBookId).toBeDefined()

    const books = await db.query('SELECT * FROM books')
    const userBooks = await db.query('SELECT * FROM user_books')

    expect(books.rowCount).toBe(1)
    expect(userBooks.rowCount).toBe(1)
  })

  it('reuse existing book when ISBN already exists', async() => {
    const first = await addBookToUserCollection({
      userId,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884'
    })

    const secondUser = await db.query(
      `INSERT INTO users(username, password_hash, is_active, role)
       VALUES ('test2', 'hash', true, 'user') RETURNING id`
    )

    const second = await addBookToUserCollection({
      userId: secondUser.rows[0].id,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884'
    })

    expect(first.bookId).toBe(second.bookId)

    const books = await db.query('SELECT * FROM books')
    const userBooks = await db.query('SELECT * FROM user_books')

    expect(books.rowCount).toBe(1)
    expect(userBooks.rowCount).toBe(2)
  })

  it('throws UserAlreadyHasBookError when user adds same book twice', async () => {
    await addBookToUserCollection({
      userId,
      title: 'Clean Code',
      isbn: '9780132350884'
    })

    await expect(
      addBookToUserCollection({
        userId,
        title: 'Clean Code',
        isbn: '9780132350884'
      })
    ).rejects.toThrow(UserAlreadyHasBookError)

    const userBooks = await db.query('SELECT * FROM user_books')
    expect(userBooks.rowCount).toBe(1)
  })

  it('create new book every time when ISBN is absent', async() => {
    await addBookToUserCollection({
      userId,
      title: 'Some Book'
    })

    await addBookToUserCollection({
      userId,
      title: 'Some Book'
    })

    const books = await db.query('SELECT * FROM books')
    const userBooks = await db.query('SELECT * FROM user_books')

    expect(books.rowCount).toBe(2)
    expect(userBooks.rowCount).toBe(2)
  })

  it('rejects empty title', async() => {
    await expect(
      addBookToUserCollection({
        userId,
        title: '  '
      })
    ).rejects.toBeInstanceOf(ValidationError)

    const books = await db.query('SELECT * FROM books')
    expect(books.rowCount).toBe(0)
  })

  it('rolls back book insert if user_books fails', async () => {
    const book = await db.query(
      'INSERT INTO books(title, isbn) VALUES (\'Temp\', \'123\') RETURNING id'
    )

    await db.query(
      `INSERT INTO user_books(user_id, book_id, read_at)
       VALUES ($1, $2, NOW())`,
       [userId, book.rows[0].id]
    )

    await expect(
      addBookToUserCollection({
        userId,
        title: 'Temp',
        isbn: '123'
      })
    ).rejects.toThrow(UserAlreadyHasBookError)

    const books = await db.query('SELECT * FROM books WHERE isbn=\'123\'')
    expect(books.rowCount).toBe(1)
  })

  it('handles conccurrent insert with same ISBN safely', async () => {
    const secondUser = await db.query(
      `INSERT INTO users(username, password_hash)
       VALUES ('user2', 'hash') RETURNING id`
    )

    const payload1 = {
      userId,
      title: 'Concurrent Book',
      isbn: '999'
    }

    const payload2 = { 
      userId: secondUser.rows[0].id,
      title: 'Concurrent Book',
      isbn: '999'
    }

    const result = await Promise.allSettled([
      addBookToUserCollection(payload1),
      addBookToUserCollection(payload2)
    ])

    expect(result[0].status).toBe('fulfilled')
    expect(result[1].status).toBe('fulfilled')

    const books = await db.query('SELECT * FROM books WHERE isbn=\'999\'')
    const userBooks = await db.query('SELECT * FROM user_books')

    expect(books.rowCount).toBe(1)
    expect(userBooks.rowCount).toBe(2)
  })

  it('prevents duplicate user_books on concurrent request', async () => {
    const payload = {
      userId,
      title: 'Race Condition Book',
      isbn: '888'
    }

    const results = await Promise.allSettled([
      addBookToUserCollection(payload),
      addBookToUserCollection(payload)
    ])

    const fulfilled = results.filter(r => r.status === 'fulfilled')
    const rejected = results.filter(r => r.status === 'rejected')

    expect(fulfilled.length).toBe(1)
    expect(rejected.length).toBe(1)
    expect(rejected[0].reason).toBeInstanceOf(UserAlreadyHasBookError)

    const books = await db.query('SELECT * FROM books WHERE isbn=\'888\'')
    const userBooks = await db.query('SELECT * FROM user_books')

    expect(books.rowCount).toBe(1)
    expect(userBooks.rowCount).toBe(1)
  })
})

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

  async function seedBookForUser({ userId, title = 'Book A', isbn = '111'}) {
    const book = await db.query(
      `INSERT INTO books (title, isbn)
       VALUES ($1, $2)
       RETURNING id`,
      [title, isbn]
    )

    await db.query(
      `INSERT INTO user_books (user_id, book_id, summary)
       VALUES ($1, $2, 'summary')`,
      [userId, book.rows[0].id]
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

  it('returns emty array if user has no books', async () => {
    const userId = await seedUser()
    const books = await getUserBooks(userId)

    expect(books).toEqual([])
  })

  it('returns books ordered by read_at desc', async () => {
    const userId = await seedUser()

    const book1 = await db.query(
      `INSERT INTO books (title, isbn)
       VALUES ('Old Book', '1')
       RETURNING id`
    )

    await db.query(
      `INSERT INTO user_books (user_id, book_id, read_at)
       VALUES ($1, $2, NOW() - INTERVAL '1 day')`,
      [userId, book1.rows[0].id]
    )

    const book2 = await db.query(
      `INSERT INTO books (title, isbn)
       VALUES ('New Book', '2') RETURNING id`
    )

    await db.query(
      `INSERT INTO user_books (user_id, book_id, read_at)
       VALUES ($1, $2, NOW())`,
      [userId, book2.rows[0].id]
    )

    const books = await getUserBooks(userId)

    expect(books[0].title).toBe('New Book')
    expect(books[1].title).toBe('Old Book')
  })
})

