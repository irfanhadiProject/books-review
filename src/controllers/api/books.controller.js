import { addBookToUserCollection } from '../../services/domain/addBookToUserCollection.service.js'
import { getUserBooks } from '../../services/domain/getUserBooks.service.js'
import { updateUserBookReview } from '../../services/domain/updateUserBookReview.service.js'
import { getUserBookDetail } from '../../services/domain/getUserBookDetail.service.js'
import { deleteUserBook } from '../../services/domain/deleteUserBook.service.js'

import { AuthError } from '../../http/errors/AuthError.js'
import { mapDomainErrorToHttpError } from '../../utils/mapDomainErrorToHttpError.js'

// GET /user-books
export async function getUserBookCollection(req, res, next) {
  const userId = req.session?.userId

  if(!userId) {
    return next(new AuthError('Session expired, please login'))
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
    return next(new AuthError('Session expired, please login'))
  }

  try {
    const result = await addBookToUserCollection({
      userId,
      title,
      author,
      isbn,
      summary
    })

    const reviewState = result.reviewState

    return res.status(201).json({
      status: 'success',
      message: reviewState === 'FILLED' 
        ? 'Book added successfully' 
        : 'Book added, but no review yet' ,
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
    return next(new AuthError('Session expired, please login'))
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

// GET /user-books/{id}
export async function getUserBookDetailHandler(req, res, next) {
  const userId = req.session?.userId

  if(!userId) {
    return next(new AuthError('Session expired, please login'))
  }

  try {
    const userBookId = req.params.id

    const data = await getUserBookDetail(userId, userBookId)

    return res.status(200).json({
      status: 'success',
      data
    })
  } catch (err) {
    next(mapDomainErrorToHttpError(err))
  }
}

export async function deleteUserBookHandler(req, res, next) {
  const userId = req.session?.userId

  if (!userId) {
    return next(new AuthError('Session expired, please login'))
  }

  try {
    const userBookId = req.params.id

    await deleteUserBook(userId, userBookId)

    return res.status(200).json({
      status: 'success',
      message: 'Operation successful',
      data: {}
    })
  } catch (err) {
    next(mapDomainErrorToHttpError(err))
  }
}