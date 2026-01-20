
import { addBookToUserCollection } from '../../services/addBookToUserCollection.service.js'
import { getUserBooks } from '../../services/getUserBooks.service.js'
import { updateUserBookReview } from '../../services/updateUserBookReview.service.js'

import { AuthError } from '../../http/errors/AuthError.js'
import { mapDomainErrorToHttpError } from '../../utils/mapDomainErrorToHttpError.js'

// GET /user-books
export async function getUserBookCollection(req, res, next) {
  const userId = req.session?.userId

  if(!userId) {
    return next(new AuthError('User not authenticated'))
  }

  try {
    const { data, meta } = await getUserBooks(userId)

    return res.status(200).json({
      status: 'success',
      data,
      meta
    })
  } catch (err) {
    next(mapDomainErrorToHttpError(err))
  }
}

// POST /user-books
export async function addUserBook(req, res, next) {
  const { title, author, isbn, summary } = req.body
  const userId = req.session?.userId

  if(!userId) {
    return next(new AuthError('User not authenticated'))
  }

  try {
    const result = await addBookToUserCollection({
      userId,
      title,
      author,
      isbn,
      summary
    })

    return res.status(201).json({
      status: 'success',
      message: 'Book added successfully',
      data: {
        userBookId: result.userBookId,
        bookId: result.bookId
      }
    })
  } catch (err) {
    next(mapDomainErrorToHttpError(err))
  }
}

// PATCH /user-books/{id}
export async function updateBookReview(req, res, next) {
  const userId = req.session?.userId

  if(!userId) {
    return next(new AuthError('User not authenticated'))
  }

  try {
    const userBookId = req.params.id
    const summary = req.body.summary

    await updateUserBookReview({
      userBookId,
      userId,
      summary
    })

    return res.status(200).json({
      status: 'success',
      message: 'Operation successful',
      data: {}
    })
  } catch (err) {
    next(mapDomainErrorToHttpError(err))
  }
}