import db from '../../src/utils/db.js'
import bcrypt from 'bcrypt'
import { beforeEach, describe, it, expect } from 'vitest'
import { resetDb } from '../helpers/db.js'
import { loginUser } from '../../src/services/bff/login.service.js'
import { UserNotFoundError } from '../../src/domain/errors/UserNotFoundError.js'
import { InvalidPasswordError } from '../../src/domain/errors/InvalidPasswordError.js'
import { UserInactiveError } from '../../src/domain/errors/UserInactiveError.js'
import { ValidationError } from '../../src/domain/errors/ValidationError.js'

describe('loginUser', () => {
  let activeUser
  const password = 'secret123'

  beforeEach(async () => {
    await resetDb()

    const hash = await bcrypt.hash(password, 10)

    const active = await db.query(
      `INSERT INTO users (username, password_hash, is_active, role)
       VALUES ('active_user', $1, true, 'user')
       RETURNING id, username, role`,
       [hash]
    )

    await db.query(
      `INSERT INTO users (username, password_hash, is_active, role)
       VALUES ('inactive_user', $1, false, 'user')
       RETURNING id`,
       [hash]
    )

    activeUser = active.rows[0]
  })

  it('authenticates active user with correct password', async () => {
    const result = await loginUser({
      username: 'active_user',
      password
    })

    expect(result).toEqual({
      userId: activeUser.id,
      username: 'active_user',
      role: 'user'
    })
  })

  it('rejects when username does not extist', async () => {
    await expect(
      loginUser({
        username: 'unknown',
        password
      })
    ).rejects.toBeInstanceOf(UserNotFoundError)
  })

  it('rejects when password is incorrect', async () => {
    await expect(
      loginUser({
        username: 'active_user',
        password: 'wrong-password'
      })
    ).rejects.toBeInstanceOf(InvalidPasswordError)
  })

  it('rejects when user is inactive', async () => {
    await expect(
      loginUser({
        username: 'inactive_user',
        password
      })
    ).rejects.toBeInstanceOf(UserInactiveError)
  })

  it('rejects when username is missing', async () => {
    await expect(
      loginUser({
        password
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects when password is missing', async () => {
    await expect(
      loginUser({
        username: 'active_user'
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('does not mutate database state on failed login', async () => {
    await expect(
      loginUser({
        username: 'active_user',
        password: 'wrong'
      })
    ).rejects.toBeInstanceOf(InvalidPasswordError)

    const users = await db.query('SELECT * FROM users')
    expect(users.rowCount).toBe(2)
  })

  it('does not expose password hash in output', async () => {
    const result = await loginUser({
      username: 'active_user',
      password
    })

    expect(result.password_hash).toBeUndefined()
    expect(Object.values(result)).not.toContain(expect.stringContaining('$2b$'))
  })
})