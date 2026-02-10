import { describe, it, beforeEach, expect, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

import { getUserBookCollection, addUserBook, updateBookReview, getUserBookDetailHandler } from '../../../src/controllers/api/books.controller.js'
import { errorHandler } from '../../../src/middleware/errorHandler.js'
import * as addBookToUserCollectionService from '../../../src/services/addBookToUserCollection.service.js'
import * as getUserBooksService from '../../../src/services/getUserBooks.service.js'
import * as updateUserBookReviewService from '../../../src/services/updateUserBookReview.service.js'
import * as getUserBookDetailService from '../../../src/services/getUserBookDetail.service.js'

import { ValidationError } from '../../../src/domain/errors/ValidationError.js'
import { UserAlreadyHasBookError } from '../../../src/domain/errors/UserAlreadyHasBookError.js'
import { DatabaseError } from '../../../src/domain/errors/DatabaseError.js'
import { UserBookNotFoundError } from '../../../src/domain/errors/UserBookNotFoundError.js'

// App with authenticated session
const app = express()
app.use(express.json())
app.use((req, res, next) => {
  Object.assign(req, { session: { userId: 1 } })
  next()
})
app.get('/api/v1/user-books', getUserBookCollection)
app.post('/api/v1/user-books', addUserBook)
app.patch('/api/v1/user-books/:id', updateBookReview)
app.get('/api/v1/user-books/:id', getUserBookDetailHandler)
app.use(errorHandler)

// App without session (unauthenticated)
const appNoSession = express()
appNoSession.use(express.json())
appNoSession.get('/api/v1/user-books', getUserBookCollection)
appNoSession.post('/api/v1/user-books', addUserBook)
appNoSession.patch('/api/v1/user-books/:id', updateBookReview)
appNoSession.get('/api/v1/user-books/:id', getUserBookDetailHandler)
appNoSession.use(errorHandler)

describe('POST /api/v1/user-books - addUserBook', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('success - book added with filled review', async () => {
    vi.spyOn(addBookToUserCollectionService, 'addBookToUserCollection').mockResolvedValue({
      bookId: 1,
      userBookId: 1,
      reviewState: 'FILLED'
    })

    const res = await request(app)
      .post('/api/v1/user-books')
      .send({title: 'Test Book', author: 'Author', isbn: '123', summary:'Great book'})
    
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('Book added successfully')
      expect(res.body.data).toEqual({
        userBookId: 1,
        bookId: 1
      })
  })

  it('success - book added with empty review', async () => {
    vi.spyOn(addBookToUserCollectionService, 'addBookToUserCollection').mockResolvedValue({
      bookId: 2,
      userBookId: 2, 
      reviewState: 'EMPTY'
    })

    const res = await request(app)
      .post('/api/v1/user-books')
      .send({title: 'Empty Review Book', author: 'Author', isbn: '124', summary: ''})

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('success')
    expect(res.body.message).toBe('Book added, but no review yet')
    expect(res.body.data).toEqual({
      userBookId: 2,
      bookId: 2
    })
  })

  it('Validation error - title missing', async () => {
    vi.spyOn(addBookToUserCollectionService, 'addBookToUserCollection').mockImplementation(() => {
      throw new ValidationError('Invalid input', { title: 'title is required' })
    })

    const res = await request(app)
      .post('/api/v1/user-books')
      .send({title: '', author: 'Author'})

    expect(res.status).toBe(422)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Invalid input')
    expect(res.body.errors).toEqual({
      title: 'title is required'
    })
  })

  it('Conflict error - user already has book', async () => {
    vi.spyOn(addBookToUserCollectionService, 'addBookToUserCollection').mockImplementation(() => {
      throw new UserAlreadyHasBookError('User already has this book')
    })

    const res = await request(app)
      .post('/api/v1/user-books')
      .send({title: 'Duplicate Book', author: 'Author', isbn: '123'})
    
    expect(res.status).toBe(409)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('User already has this book')
  })

  it('Auth error - user not logged in', async () => {
    const res = await request(appNoSession)
      .post('/api/v1/user-books')
      .send({ title: 'Auth test'})

    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Session expired, please login')
  })

  it('Database error - unexpected DB failure', async () => {
    vi.spyOn(addBookToUserCollectionService, 'addBookToUserCollection').mockImplementation(() => {
      throw new DatabaseError('Internal DB failure')
    })

    const res = await request(app)
      .post('/api/v1/user-books')
      .send({ title: 'DB Error Book', author: 'Author', isbn:'999'})
    
    expect(res.status).toBe(500)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Internal server error')
  })
})

describe('GET /api/v1/user-books - getUserBookCollection', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('success - returns list of user books', async () => {
    vi.spyOn(getUserBooksService, 'getUserBooks').mockResolvedValue({
      data: [
      {
        id: 1,
        book: {
          id: 10,
          title: 'Book A',
          author: 'Author A',
          coverUrl: 'urlA'
        },
        reviewState: 'FILLED'
      },
      {
        id: 2,
        book: {
          id: 20,
          title: 'Book B',
          author: 'Author B',
          coverUrl: 'urlB'
        },
        reviewState: 'FILLED'
      },
    ],
  meta: {
    total: 2
  }})

    const res = await request(app).get('/api/v1/user-books')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.data[0].book).toEqual({
      id: 10,
      title: 'Book A',
      author: 'Author A',
      coverUrl: 'urlA'
    })
    expect(res.body.meta).toEqual({
      total: 2
    })
  })

  it('success - returns empty array when user has no books', async () => {
    vi.spyOn(getUserBooksService, 'getUserBooks').mockResolvedValue({
      data: [],
      meta: { total: 0 }
    })

    const res = await request(app).get('/api/v1/user-books')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data).toEqual([])
    expect(res.body.meta).toEqual({
      total: 0
    })
  })

  it('Auth error - user not authenticated', async () => {
    const res = await request(appNoSession).get('/api/v1/user-books')

    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Session expired, please login')
  })

  it('Database error - unexpected failure', async () => {
    vi.spyOn(getUserBooksService, 'getUserBooks').mockImplementation(() => {
      throw new DatabaseError('DB exploded')
    })

    const res = await request(app).get('/api/v1/user-books')

    expect(res.status).toBe(500)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Internal server error')
  })
})

describe('PATCH /api/v1/user-books/:id - updateBookReview', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('success - should return 200 when review is updated', async () => {
    vi.spyOn(updateUserBookReviewService, 'updateUserBookReview').mockResolvedValue(undefined)

    const res = await request(app)
      .patch('/api/v1/user-books/10')
      .send({ summary: 'Updated summary'})
    
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.message).toBe('Operation successful')
  })

  it('Validation error - should return 422 when summary is invalid', async () => {
    vi.spyOn(updateUserBookReviewService, 'updateUserBookReview').mockImplementation(() => {
      throw new ValidationError('Invalid input', { summary: 'summary must be a non-empty string'})
    })

    const res = await request(app)
      .patch('/api/v1/user-books/10')
      .send({ summary: '' })
    
    expect(res.status).toBe(422)
    expect(res.body.status).toBe('error')
    expect(res.body.errors.summary).toBe('summary must be a non-empty string')
  })

  it('Not Found error - should return 404 when book entry does not exist or wrong owner', async () => {
    vi.spyOn(updateUserBookReviewService, 'updateUserBookReview').mockImplementation(() => {
      throw new UserBookNotFoundError('Book not found in your collection')
    })

    const res = await request(app)
      .patch('/api/v1/user-books/999')
      .send({ summary: 'Valid summary' })
    
    expect(res.status).toBe(404)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Book not found in your collection')
  })

  it('Auth error - should return 401 when user is not logged in', async () => {
    const res = await request(appNoSession)
      .patch('/api/v1/user-books/10')
      .send({ summary: 'Some summary'})
    
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Session expired, please login')
  })
})

describe('GET /api/v1/user-books/:id - getUserBookDetail', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('success - returns user book detail', async () => {
    vi.spyOn(getUserBookDetailService, 'getUserBookDetail').mockResolvedValue({
      id: 1,
      book: {
        id: 10,
        title: 'Book A',
        author: 'Author A',
        coverUrl: 'urlA'
      },
      summary: 'This summary',
      reviewState: 'EMPTY',
      createdAt: 'now',
      updatedAt: 'now'
    })

    const res = await request(app).get('/api/v1/user-books/1')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data).toBeDefined()
    expect(getUserBookDetailService.getUserBookDetail).toHaveBeenCalledWith(1, '1')
  })

  it('Auth error - user not logged in', async () => {
    const res = await request(appNoSession).get('/api/v1/user-books/10')

    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Session expired, please login')
  })

  it('Not Found error - book not found', async () => {
    vi.spyOn(getUserBookDetailService, 'getUserBookDetail').mockImplementation(() => { throw new UserBookNotFoundError('Book not found in your collection') })

    const res = await request(app).get('/api/v1/user-books/999')

    expect(res.status).toBe(404)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Book not found in your collection')
  })

  it('Database error - unexpected failure', async () => {
    vi.spyOn(getUserBookDetailService, 'getUserBookDetail').mockImplementation(() => {
      throw new DatabaseError('DB exploded')
    })

    const res = await request(app).get('/api/v1/user-books/1')

    expect(res.status).toBe(500)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Internal server error')
  })
})

