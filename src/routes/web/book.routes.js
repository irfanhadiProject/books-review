import express from 'express'
import {
  renderUserBooksPage,
  getBookById,
  searchBooks,
  filterByGenre,
  // sortBooks,
  submitAddBookForm,
  submitUpdateBookReviewForm,
  deleteBook,
} from '../../controllers/web/books.controller.js'

const router = express.Router()

router.get('/', renderUserBooksPage)
router.get('/search-book', searchBooks)
router.get('/filter-by', filterByGenre)
// router.get('/sort-by', sortBooks);
router.post('/add-book', submitAddBookForm)
router.get('/:id', getBookById)
router.patch('/:id', submitUpdateBookReviewForm)
router.delete('/:id', deleteBook)

export default router
