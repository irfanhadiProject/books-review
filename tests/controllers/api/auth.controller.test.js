import { describe, it, beforeEach, expect, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import session from 'express-session'

import { login, logout } from '../../../src/controllers/api/auth.controller.js'
import { errorHandler } from '../../../src/middleware/errorHandler.js'
import * as loginService from '../../../src/services/domain/login.service.js'

import { ValidationError } from '../../../src/domain/errors/ValidationError.js'
import { UserNotFoundError } from '../../../src/domain/errors/UserNotFoundError.js'
import { InvalidPasswordError } from '../../../src/domain/errors/InvalidPasswordError.js'
import { UserInactiveError } from '../../../src/domain/errors/UserInactiveError.js'
import { DatabaseError } from '../../../src/domain/errors/DatabaseError.js'

// Without User Session
const appGuest = express()
appGuest.use(express.json())
appGuest.use(
  session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: true
  })
)
appGuest.post('/api/v1/auth/login', login)
appGuest.post('/api/v1/auth/logout', logout)
appGuest.use(errorHandler)

// Authenticated app
const appAuth = express()
appAuth.use(express.json())
appAuth.use((req, res, next) => {
  Object.assign(req, {
    session: {
      userId: 1,
      destroy: (cb) => cb(null)
    }
  })
  next()
})
appAuth.post('/api/v1/auth/logout', logout)
appAuth.use(errorHandler)

// App for Error destroy simulation
const appDestroyError = express()
appDestroyError.use(express.json())
appDestroyError.use((req, res, next) => {
  Object.assign(req, {
    session: {
      userId: 1,
      destroy: (cb) => cb(new Error('Database failure during destroy'))
    }
  })
  next()
})
appDestroyError.post('/api/v1/auth/logout', logout)
appDestroyError.use(errorHandler)

describe('POST /api/v1/auth/login - login', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('success - login sets session and returns authenticated user', async () => {
    vi.spyOn(loginService, 'loginUser').mockResolvedValue({
      userId: 1,
      username: 'testuser',
      role: 'user'
    })

    const res = await request(appGuest)
      .post('/api/v1/auth/login')
      .send({ username: 'testuser', password: 'password'})

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data).toEqual({})
    expect(res.body.message).toBe('Login successful')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('validation error - missing username or password', async () => {
    vi.spyOn(loginService, 'loginUser').mockImplementation(() => {
      throw new ValidationError('Invalid input', 
      { 
        username: 'username is required',
        password: 'password is required'
      })
    })

    const res = await request(appGuest)
      .post('/api/v1/auth/login')
      .send({ username: '', password: ''})

    expect(res.status).toBe(422)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Invalid input')
    expect(res.body.errors).toEqual({
      username: 'username is required',
      password: 'password is required'
    })
  })

  it('auth error - user not found', async () => {
    vi.spyOn(loginService, 'loginUser').mockImplementation(() => {
      throw new UserNotFoundError()
    })

    const res = await request(appGuest)
      .post('/api/v1/auth/login')
      .send({ username: 'unknown', password: 'password'})

    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Invalid username or password')
  })

  it('auth error - invalid password', async () => {
    vi.spyOn(loginService, 'loginUser').mockImplementation(() => {
      throw new InvalidPasswordError()
    })

    const res = await request(appGuest)
      .post('/api/v1/auth/login')
      .send({ username: 'testuser', password:'wrong'})
    
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Invalid username or password')
  })

  it('auth error - user inactive', async () => {
    vi.spyOn(loginService, 'loginUser').mockImplementation(() => {
      throw new UserInactiveError()
    })

    const res = await request(appGuest)
      .post('/api/v1/auth/login')
      .send({ username: 'inactive', password: 'password'})

    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Invalid username or password')
  })

  it('database error - unexpected DB failure', async () => {
    vi.spyOn(loginService, 'loginUser').mockImplementation(() => {
      throw new DatabaseError('DB failure')
    })

    const res = await request(appGuest)
      .post('/api/v1/auth/login')
      .send({ username: 'testuser', password: 'password'})
    
    expect(res.status).toBe(500)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Internal server error')
  })
})

describe('POST /api/v1/auth/logout - logout', () => {
  it('success - should return 200 when user is already logged in', async () => {
    const res = await request(appAuth).post('/api/v1/auth/logout')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.message).toBe('Logout successful')
    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.headers['set-cookie'][0]).toContain('connect.sid=;')
  })

  it('error - should return 401 when no session exists', async () => {
    const res = await request(appGuest).post('/api/v1/auth/logout')
    
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Session expired, please login')
  })

  it('error - should return 500 if session destruction fails', async () => {
    const res = await request(appDestroyError).post('/api/v1/auth/logout')
    
    expect(res.status).toBe(500)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toBe('Internal server error')
  })
})