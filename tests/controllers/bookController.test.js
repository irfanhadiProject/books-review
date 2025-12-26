import { describe, it, beforeEach, expect, vi } from "vitest";
import request from "supertest";
import express from "express"
import { addBook } from "../../src/controllers/booksController";
import { errorHandler } from "../../src/middleware/errorHandler";
import * as bookService from '../../src/services/books.service'
import { ValidationError } from "../../src/domain/errors/ValidationError";
import { UserAlreadyHasBookError } from "../../src/domain/errors/UserAlreadyHasBookError";
import { DatabaseError } from "../../src/domain/errors/DatabaseError";

const app = express()
app.use(express.json())
app.use((req, res, next) => {
  req.session = { userId: 1}
  next()
})
app.post('/books', addBook)
app.use(errorHandler)

const appNoSession = express()
appNoSession.use(express.json())
appNoSession.post('/books', addBook)
appNoSession.use(errorHandler)

describe('addBook Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('success - book added with filled review', async () => {
    vi.spyOn(bookService, 'addBookToUserCollection').mockResolvedValue({
      bookId: 1,
      userBookId: 1,
      reviewState: 'FILLED'
    })

    const res = await request(app)
      .post('/books')
      .send({title: 'Test Book', author: 'Author', isbn: '123', summary:'Great book'})
      .set('Cookie', ['connect.sid=sessid'])
    
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.data.reviewState).toBe('FILLED')
      expect(res.body.message).toBe('Book added successfully')
  })

  it('success - book added with empty review', async () => {
    vi.spyOn(bookService, 'addBookToUserCollection').mockResolvedValue({
      bookId: 2,
      userBookId: 2, 
      reviewState: 'EMPTY'
    })

    const res = await request(app)
      .post('/books')
      .send({title: 'Empty Review Book', author: 'Author', isbn: '124', summary: ''})
      .set('Cookie', ['connect.sid=sessid'])

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('empty')
    expect(res.body.data).toEqual([])
    expect(res.body.message).toBe('Book added but no review yet')
  })

  it('Validation error - title missing', async () => {
    vi.spyOn(bookService, 'addBookToUserCollection').mockImplementation(() => {
      throw new ValidationError('title is required')
    })

    const res = await request(app)
      .post('/books')
      .send({title: '', author: 'Author'})
      .set('Cookie', ['connect.sid=sessid'])

    expect(res.status).toBe(422)
    expect(res.body.error).toBe('VALIDATION_ERROR')
    expect(res.body.message).toBe('title is required')
  })

  it('Conflict error - user already has book', async () => {
    vi.spyOn(bookService, 'addBookToUserCollection').mockImplementation(() => {
      throw new UserAlreadyHasBookError('User already has this book')
    })

    const res = await request(app)
      .post('/books')
      .send({title: 'Duplicate Book', author: 'Author', isbn: '123'})
      .set('Cookie', ['connect.sid=sessid'])
    
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
    vi.spyOn(bookService, 'addBookToUserCollection').mockImplementation(() => {
      throw new DatabaseError('Internal DB failure')
    })

    const res = await request(app)
      .post('/books')
      .send({ title: 'DB Error Book', author: 'Author', isbn:'999'})
      .set('Cookie', ['connect.sid=sessid'])
    
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB_ERROR')
    expect(res.body.message).toBe('Internal server error')
  })
})