export async function findBookByISBN(client, isbn) {
  return client.query('SELECT id FROM books WHERE isbn = $1 FOR SHARE', [isbn])
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
     ON CONFLICT (isbn) WHERE isbn IS NOT NULL
     DO NOTHING
     RETURNING id`,
    [title, author, finalCoverUrl, isbn, genre]
  )
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
    RETURNING id`,
    [userId, bookId, setting, readability, words, summary]
  )
}

export async function updateUserBookReview(client, {
  userBookId,
  summary
}) {
  return client.query(
    `UPDATE user_books
        SET summary = $1
        WHERE id = $2`,
    [ summary, userBookId ]
  )
}

export async function deleteUserBook(client, userBookId) {
  return client.query('DELETE FROM user_books WHERE id = $1', [userBookId])
}
