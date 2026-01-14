/**
 * Domain Command Service: Add Book to User Collection
 * 
 * Responsibilities
 * - Coordinate creation of book and user_books relation
 * - Enforce basic domain invariants for this use case
 * - Guarantee no partial persistence state
 * 
 * This service does NOT:
 * - Know about HTTP
 * - Know about sessions
 * - Know about views or redirects
 */

import db from '../utils/db.js'
import {
  findBookByISBN,
  insertNewBook,
  insertUserBook
} from '../models/bookModel.js'
import { fetchCoverAsync } from '../utils/fetchCoverAsync.js'
import { ValidationError } from '../domain/errors/ValidationError.js'
import { DatabaseError } from '../domain/errors/DatabaseError.js'
import { mapToDomainError } from '../utils/mapToDomainError.js'

/**
 * addBookToUserCollection
 * 
 * Invariants:
 * 1. userId must reference an existing user (existence is guaranteed by the caller or enforced at the persistence layer)
 * 2. title must not be empty
 * 3. a user can have only one relationship with a given book
 * 4. no partial state is allowed:
 *    - books succeeds but user_books fails -> rollback
 * 5. ISBN is optional:
 *    - when present, it is the primary deduplication identity
 *    - when absent, the book is always treated as a new entity
 * 6. cover fetching must not affect the main operation outcome
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
 * Output:
 * {
 *  bookId: string | number,
 *  userBookId: string | number,
 *  reviewState: 'EMPTY' | 'FILLED'
 * }
 * 
 * Errors (domain-level):
 * - ValidationError
 * - UserAlreadyHasBookError
 * - DatabaseError
 * 
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
    
    userBookId = userBookResult.rows[0].id

    // 5. commit transaction
    await client.query('COMMIT')
    committed = true

    // 6. trigger async side effect (cover fetch, best-effort)
    if (isbn) {
      try {
        Promise.resolve(
          fetchCoverAsync({bookId, isbn})
        ).catch(() => {})
      } catch (err) {
        console.error('cover fetch failed', { bookId, isbn, err })
      }
    }

    // 7. return ids 
    const reviewState = summary && summary.trim() ? 'FILLED' : 'EMPTY'

    return {
      bookId,
      userBookId,
      reviewState
    }
  } catch (err) {
    if (!committed) {
      await client.query('ROLLBACK')
    }
    throw mapToDomainError(err)
  } finally {
    client.release()
  }
}

