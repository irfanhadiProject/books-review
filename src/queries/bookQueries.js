import db from '../utils/db.js'

export async function getAllBooksByUser(userId) {
  return db.query(
    `SELECT 
      ub.id AS user_book_id,
      b.id AS book_id,
      b.title,
      b.author,
      b.cover, 
      ub.summary 
     FROM user_books ub
     JOIN books b ON ub.book_id = b.id
     WHERE ub.user_id = $1
     ORDER BY ub.read_at DESC, ub.id DESC`,
    [userId]
  )
}

export async function queryUserBookDetailByUser(userId, userBookId) {
  return db.query(
    `SELECT
        ub.id AS user_book_id,
        ub.summary AS summary,
        ub.created_at AS created_at,
        ub.updated_at AS updated_at,

        b.id AS book_id,
        b.title AS title,
        b.author AS author,
        b.cover AS cover
     FROM user_books ub
     JOIN books b ON ub.book_id = b.id
     WHERE ub.id = $1 
       AND ub.user_id = $2`,
    [userBookId, userId]
  )
}

export async function searchBooksByTitle(userId, title) {
  return db.query(
    `SELECT 
        books.*, 
        user_books.setting,
        user_books.readability,
        user_books.words,
        user_books.summary,
        user_books.read_at, 
        user_books.id AS user_book_id
        FROM user_books
        JOIN books ON user_books.book_id = books.id
        WHERE user_books.user_id = $1
        AND books.title ILIKE $2
        ORDER BY user_books.read_at DESC`,
    [userId, `%${title}%`]
  )
}

export async function filterBooksByGenre(userId, genre) {
  return db.query(
    `SELECT
            books.*, 
            user_books.setting,
            user_books.readability,
            user_books.words,
            user_books.summary,
            user_books.read_at, 
            user_books.id AS user_book_id
           FROM user_books
           JOIN books ON user_books.book_id = books.id
           WHERE user_books.user_id = $1
           AND books.genre ILIKE $2
           ORDER BY user_books.read_at DESC`,
    [userId, `%${genre}%`]
  )
}

export async function checkUserBook(userBookId, userId) {
  return db.query('SELECT * FROM user_books WHERE id = $1 AND user_id = $2', [
    userBookId,
    userId,
  ])
}

export async function findUserBookByIdAndUser(client, userBookId, userId) {
  return client.query(
    'SELECT id FROM user_books WHERE id = $1 AND user_id = $2',
    [userBookId, userId]
  )
}
