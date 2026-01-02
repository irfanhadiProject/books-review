import db from '../../src/utils/db.js'

export async function resetDb() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('resetDb is only allowed in test environment')
  }

  await db.query('DELETE FROM user_books')
  await db.query('DELETE FROM books')
  await db.query('DELETE FROM users')
}
