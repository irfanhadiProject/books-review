import db from '../../src/utils/db.js'

export async function resetDb() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('resetDb is only allowed in test environment')
  }

  await db.query('BEGIN')
  try {
    await db.query('TRUNCATE user_books, books, users RESTART IDENTITY CASCADE')
    await db.query('COMMIT')
  } catch (err) {
    await db.query('ROLLBACK')
    throw err
  }
}
