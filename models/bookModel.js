import db from '../utils/db.js';

export async function getAllBooksByUser(userId) {
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
        ORDER BY user_books.read_at DESC`,
    [userId]
  );
}

export async function getBookByUserBookId(userBookId, userId) {
  return db.query(
    `SELECT
        books.title,
        books.author,
        books.isbn,
        books.genre,
        books.cover,
        user_books.setting,
        user_books.readability,
        user_books.words,
        user_books.summary
        FROM user_books
        JOIN books ON user_books.book_id = books.id
        WHERE user_books.id = $1 AND user_books.user_id = $2`,
    [userBookId, userId]
  );
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
  );
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
  );
}

export async function sortBooksByClause(userId, orderByClause) {
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
        ${orderByClause}`,
    [userId]
  );
}

export async function findBookByISBN(isbn) {
  return db.query(`SELECT id FROM books WHERE isbn = $1`, [isbn]);
}

export async function insertNewBook({
  title,
  author,
  finalCoverUrl,
  isbn,
  genre,
}) {
  return db.query(
    `INSERT INTO books(title, author, cover, isbn, genre)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;`,
    [title, author, finalCoverUrl, isbn, genre]
  );
}

export async function insertUserBook({
  userId,
  bookId,
  setting,
  readability,
  words,
  summary,
}) {
  return db.query(
    `INSERT INTO user_books (user_id, book_id, setting, readability, words, summary, read_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
        ON CONFLICT DO NOTHING`, // Jika ada koflik (duplikat pasangan userId dan book Id) do nothing
    [userId, bookId, setting, readability, words, summary]
  );
}

export async function checkUserBook(userBookId, userId) {
  return db.query(`SELECT * FROM user_books WHERE id = $1 AND user_id = $2`, [
    userBookId,
    userId,
  ]);
}

export async function updateUserBookReview({
  setting,
  readability,
  words,
  summary,
  userBookId,
}) {
  return db.query(
    `UPDATE user_books
        SET setting = $1,
            readability = $2,
            words = $3,
            summary = $4
        WHERE id = $5`,
    [setting, readability, words, summary, userBookId]
  );
}

export async function deleteUserBook(userBookId) {
  return db.query(`DELETE FROM user_books WHERE id = $1`, [userBookId]);
}
