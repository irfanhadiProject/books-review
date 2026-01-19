import express from 'express'
import {
  getBooks,
  // getBookById,
  addBook,
  updateBookReview,
  // deleteUserBook,
} from '../../controllers/booksController.js'

const router = express.Router()

router.get('/', getBooks)
router.post('/', addBook)
// router.get('/:id', getBookById)
router.patch('/:id', updateBookReview)
// router.delete('/:id', deleteUserBook)

export default router