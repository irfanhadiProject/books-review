import { describe, it, beforeEach, expect, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

import { addBook, getBooks } from '../../src/controllers/booksController.js'
import { errorHandler } from '../../src/middleware/errorHandler.js'
import * as bookCollectionService from '../../src/services/bookCollection.service.js'
import * as bookReadService from '../../src/services/bookRead.service.js'

import { ValidationError } from '../../src/domain/errors/ValidationError.js'
import { UserAlreadyHasBookError } from '../../src/domain/errors/UserAlreadyHasBookError.js'
import { DatabaseError } from '../../src/domain/errors/DatabaseError.js'

// App with authenticated session
const app = express()
app.use(express.json())
app.use((req, res, next) => {
  req.session = { userId: 1}
  next()
})
app.get('/books', getBooks)
app.post('/books', addBook)
app.use(errorHandler)

// App without session (unauthenticated)
const appNoSession = express()
appNoSession.use(express.json())
appNoSession.get('/books', getBooks)
appNoSession.post('/books', addBook)
appNoSession.use(errorHandler)

describe('addBook Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('success - book added with filled review', async () => {
    vi.spyOn(bookCollectionService, 'addBookToUserCollection').mockResolvedValue({
      bookId: 1,
      userBookId: 1,
      reviewState: 'FILLED'
    })

    const res = await request(app)
      .post('/books')
      .send({title: 'Test Book', author: 'Author', isbn: '123', summary:'Great book'})
    
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.data.reviewState).toBe('FILLED')
      expect(res.body.message).toBe('Book added successfully')
  })

  it('success - book added with empty review', async () => {
    vi.spyOn(bookCollectionService, 'addBookToUserCollection').mockResolvedValue({
      bookId: 2,
      userBookId: 2, 
      reviewState: 'EMPTY'
    })

    const res = await request(app)
      .post('/books')
      .send({title: 'Empty Review Book', author: 'Author', isbn: '124', summary: ''})

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('success')
    expect(res.body.data.reviewState).toBe('EMPTY')
    expect(res.body.message).toBe('Book added, but no review yet')
  })

  it('Validation error - title missing', async () => {
    vi.spyOn(bookCollectionService, 'addBookToUserCollection').mockImplementation(() => {
      throw new ValidationError('title is required')
    })

    const res = await request(app)
      .post('/books')
      .send({title: '', author: 'Author'})

    expect(res.status).toBe(422)
    expect(res.body.error).toBe('VALIDATION_ERROR')
    expect(res.body.message).toBe('title is required')
  })

  it('Conflict error - user already has book', async () => {
    vi.spyOn(bookCollectionService, 'addBookToUserCollection').mockImplementation(() => {
      throw new UserAlreadyHasBookError('User already has this book')
    })

    const res = await request(app)
      .post('/books')
      .send({title: 'Duplicate Book', author: 'Author', isbn: '123'})
    
    expect(res.status).toBe(409)
    expect(res.body.error).toBe('CONFLICT')
    expect(res.body.message).toBe('User already has this book')
  })

  it('Auth error - user not logged in', async () => {
    const res = await request(appNoSession)
      .post('/books')
      .send({ title: 'Auth test'})

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('AUTH_ERROR')
  })

  it('Database error - unexpected DB failure', async () => {
    vi.spyOn(bookCollectionService, 'addBookToUserCollection').mockImplementation(() => {
      throw new DatabaseError('Internal DB failure')
    })

    const res = await request(app)
      .post('/books')
      .send({ title: 'DB Error Book', author: 'Author', isbn:'999'})
    
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB_ERROR')
    expect(res.body.message).toBe('Internal server error')
  })
})

describe('getBooks controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('success - returns list of user books', async () => {
    vi.spyOn(bookReadService, 'getUserBooks').mockResolvedValue([
      {
        id: 1,
        title: 'Book A',
        user_book_id: 10,
        summary: 'Summary A'
      },
      {
        id: 2,
        title: 'Book B',
        user_book_id: 9,
        summary: 'Summary B'
      }
    ])

    const res = await request(app).get('/books')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.data[0].title).toBe('Book A')
  })

  it('success - returns empty array when user has no books', async () => {
    vi.spyOn(bookReadService, 'getUserBooks').mockResolvedValue([])

    const res = await request(app).get('/books')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data).toEqual([])
  })

  it('Auth error - user not authenticated', async () => {
    const res = await request(appNoSession).get('/books')

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('AUTH_ERROR')
    expect(res.body.message).toBe('User not authenticated')
  })

  it('Database error - unexpected failure', async () => {
    vi.spyOn(bookReadService, 'getUserBooks').mockImplementation(() => {
      throw new DatabaseError('DB exploded')
    })

    const res = await request(app).get('/books')

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB_ERROR')
    expect(res.body.message).toBe('Internal server error')
  })
})
