import express from 'express'
import {
  getUserBookCollection,
  // getBookById,
  addUserBook,
  updateBookReview,
  // deleteUserBook,
} from '../../controllers/api/books.controller.js'

const router = express.Router()

router.get('/', getUserBookCollection)
router.post('/', addUserBook)
// router.get('/:id', getBookById)
router.patch('/:id', updateBookReview)
// router.delete('/:id', deleteUserBook)

export default router