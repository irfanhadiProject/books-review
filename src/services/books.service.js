/**
 * Domain Service: Book Collection
 * 
 * Tanggung jawab:
 * - Menjaga invariant relasi user <-> book
 * - Menyediakan operasi atomik (transactional)
 * 
 * Service ini Tidak:
 * - Tahu HTTP
 * - Tahu session
 * - Tahu view / redirect
 */

/**
 * addBookToUserCollection
 * 
 * Invariants:
 * 1. userId refer ke user yang ada (eksistensi dijamin oleh caller atau dipaksa dengan persistance layer)
 * 2. title tidak boleh kosong
 * 3. satu user hanya boleh punya satu relasi ke satu buku
 * 4. tidak boleh ada state setengah jadi:
 *    - books sukses tapi user_books gagal -> rollback
 * 5. ISBN opsional: 
 *    - jika ada, jadi identitas deduplikasi utama
 *    - jika tidak ada, buku selalu dianggap entitas baru
 * 6. Fetch cover tidak mempengaruhi keberhasilan utama
 * 
 * Input:
 * {
 *  userId: string | number,
 *  title: string,
 *  author?: string,
 *  isbn?: string,
 *  summary?: string, 
 * }
 * 
 * Output (success):
 * {
 *  bookId: string | number,
 *  userBookId: string | number
 * }
 * 
 * Errors (domain-level):
 * - ValidationError
 * - UserAlreadyHasBookError
 * - DatabaseError
 */

/**
 * Domain decision:
 * - ISBN present -> strong identity
 * - Without ISBN, book identity is not guaranteed to be unique
 * 
 * Guarantees on success:
 * - user_books row exists
 * - books row exists
 * - no partial state
 * - operation is safe to retry once when ISBN is provided
 * - retrying non-ISBN input may create a new book entity

*/
import db from '../utils/db.js'
import {
  findBookByISBN,
  insertNewBook,
  insertUserBook
} from '../models/bookModel.js'
import { fetchCoverAsync } from '../utils/fetchCoverAsync.js'
import { ValidationError } from '../domain/errors/ValidationError.js'
import { UserAlreadyHasBookError } from '../domain/errors/UserAlreadyHasBookError.js'
import { mapToDomainError } from '../utils/mapToDomainError.js'
import { DatabaseError } from '../domain/errors/DatabaseError.js'

export async function addBookToUserCollection(input) {
  const {userId, title, author, isbn, summary} = input
  // 1. validate input
  if (!title || title.trim() === '') {
    throw new ValidationError('title is required')
  }

  const client = await db.connect()
  let committed = false

  try {
    // 2. begin transaction
    await client.query('BEGIN')

    // 3. find or create book
    let bookId

    if (isbn) {
      const inserted = await insertNewBook(client, {
        title,
        author: author ?? null,
        isbn,
        finalCoverUrl: null,
        genre: null,
      })
    
      if (inserted.rowCount > 0) {
        bookId = inserted.rows[0].id
      } else {
        const found = await findBookByISBN(client, isbn)
    
        if (found.rowCount === 0) {
          throw new DatabaseError('Invariant broken: book exists but not visible')
        }
    
        bookId = found.rows[0].id
      }
    } else {
      // no ISBN (always create new book)
      const inserted = await insertNewBook(client, {
        title, 
        author: author ?? null, 
        isbn: null, 
        finalCoverUrl: null,
        genre: null
      })

      if (inserted.rowCount === 0) {
        throw new DatabaseError('Invariant broken: non-ISBN book not inserted')
      }
      
      bookId = inserted.rows[0].id
    }

    // 4. create user_books relation
    let userBookId
    const userBookResult = await insertUserBook(client, {
      userId,
      bookId,
      setting: null,
      readability: null,
      words: null,
      summary: summary ?? null,
    })
    
    if (userBookResult.rowCount === 0) {
      throw new UserAlreadyHasBookError()
    }
    
    userBookId = userBookResult.rows[0].id

    // 5. commit transaction
    await client.query('COMMIT')
    committed = true

    // 6. trigger async side effect (cover fetch, best-effort)
    if (isbn) {
      fetchCoverAsync({bookId, isbn})
    }

    // 7. return ids  
    return {
      bookId,
      userBookId 
    }
  } catch (err) {
    if (!committed) {
      await client.query('ROLLBACK');
    }
    throw mapToDomainError(err)
  } finally {
    client.release()
  }
}