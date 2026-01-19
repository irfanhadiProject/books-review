import express from 'express'
import {
  getBooks,
  getBookById,
  searchBooks,
  filterByGenre,
  // sortBooks,
  addBook,
  updateBookReview,
  deleteBook,
} from '../../controllers/booksController.js'

const router = express.Router()

router.get('/', getBooks)
router.get('/search-book', searchBooks)
router.get('/filter-by', filterByGenre)
// router.get('/sort-by', sortBooks);
router.post('/add-book', addBook)
router.get('/:id', getBookById)
router.patch('/:id', updateBookReview)
router.delete('/:id', deleteBook)

export default router
