import { describe, it, beforeEach, expect, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import session from 'express-session'

import { login } from '../../src/controllers/authController.js'
import { errorHandler } from '../../src/middleware/errorHandler.js'
import * as authService from '../../src/services/auth.service.js'
import { ValidationError } from '../../src/domain/errors/ValidationError.js'

const app = express()

app.use(express.json())
app.use(
  session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: true
  })
)

app.post('/auth/login', login)
app.use(errorHandler)

describe('POST /auth/login - authController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('success - login sets session and returns authenticated user', async () => {
    vi.spyOn(authService, 'loginUser').mockResolvedValue({
      userId: 1,
      username: 'testuser',
      role: 'user'
    })

    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password'})

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data).toEqual({
      userId: 1,
      username: 'testuser',
      role: 'user'
    })
    expect(res.body.message).toBe('Login successful')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('validation error - missing username or password', async () => {
    vi.spyOn(authService, 'loginUser').mockImplementation(() => {
      throw new ValidationError('username and password are required')
    })

    const res = await request(app)
      .post('/auth/login')
      .send({ username: '', password: ''})

    expect(res.status).toBe(422)
    expect(res.body.error).toBe('VALIDATION_ERROR')
    expect(res.body.message).toBe('username and password are required')
  })
})