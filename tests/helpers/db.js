import db from '../../src/utils/db.js'

export async function resetDb() {
  await db.query('DELETE FROM user_books')
  await db.query('DELETE FROM books')
  await db.query('DELETE FROM users')
}