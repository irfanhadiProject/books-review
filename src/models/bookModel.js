export async function findBookByISBN(client, isbn) {
  return client.query(`SELECT id FROM books WHERE isbn = $1`, [isbn]);
}

export async function insertNewBook(client, {
  title,
  author,
  finalCoverUrl,
  isbn,
  genre,
}) {
  return client.query(
    `INSERT INTO books(title, author, cover, isbn, genre)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
    [title, author, finalCoverUrl, isbn, genre]
  );
}

export async function insertUserBook(client, {
  userId,
  bookId,
  setting,
  readability,
  words,
  summary,
}) {
  return client.query(
    `INSERT INTO user_books (
      user_id, 
      book_id, 
      setting, 
      readability, 
      words, 
      summary, 
      read_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
    ON CONFLICT DO NOTHING
    RETURNING id`,
    [userId, bookId, setting, readability, words, summary]
  );
}

export async function updateUserBookReview(client, {
  setting,
  readability,
  words,
  summary,
  userBookId,
}) {
  return client.query(
    `UPDATE user_books
        SET setting = $1,
            readability = $2,
            words = $3,
            summary = $4
        WHERE id = $5`,
    [setting, readability, words, summary, userBookId]
  );
}

export async function deleteUserBook(client, userBookId) {
  return client.query(`DELETE FROM user_books WHERE id = $1`, [userBookId]);
}
