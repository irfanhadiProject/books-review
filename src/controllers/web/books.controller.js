import dotenv from 'dotenv'
dotenv.config()

import { renderBooksPage } from '../../utils/renderBooksPage.js'
import {
  updateUserBookSummary,
  deleteUserBook,
} from '../../models/bookModel.js'
import {
  getBookByUserBookId,
  searchBooksByTitle,
  filterBooksByGenre,
  checkUserBook,
} from '../../queries/bookQueries.js'

import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api/v1'


// GET /books
export async function renderUserBooksPage(req, res) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user-books`,
      {
        headers: {
          cookie: req.headers.cookie
        }
      }
    )

    return res.render('pages/books', {
      layout: 'layout',
      title: 'My Books',
      books: response.data.data,
      total: response.data.meta.total
    })
  } catch(err) {
    if (err.response?.status === 401) {
      return res.redirect('/login')
    }

    throw err
  }
}

// Mendapatkan data buku dengan id
export async function getBookById(req, res) {
  const userBookId = req.params.id
  const userId = req.session.userId

  try {
    const result = await getBookByUserBookId(userBookId, userId)

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Book not found or access denied' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// Mendapatkan data buku berdasarkan judul melalui fitur search
export async function searchBooks(req, res) {
  const title = req.query.search
  const userId = req.session.userId
  const username = req.session.username

  try {
    const result = await searchBooksByTitle(userId, title)

    res.render(
      'pages/books',
      renderBooksPage({
        user: username,
        booksData: result.rows,
      })
    )
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
}

// Mendapatkan data buku berdasarkan genre melalui fitur filter genre
export async function filterByGenre(req, res) {
  const genre = req.query.genre
  const userId = req.session.userId
  const username = req.session.username

  try {
    const result = await filterBooksByGenre(userId, genre)

    res.render(
      'pages/books',
      renderBooksPage({
        user: username,
        booksData: result.rows,
      })
    )
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Internal Server Error')
  }
}

// Add book to database
export async function submitAddBookForm(req, res) {
  const { title, author, isbn, summary } = req.body

  try {
    await axios.post(
      `${API_BASE_URL}/user-books`,
      { title, author, isbn, summary},
      {
        headers: {
          cookie: req.headers.cookie
        }
      }
    )

    return res.redirect('/books')
  } catch (err) {
    if(err.response?.status === 401) {
      return res.redirect('/login')
    }

    return res.render('pages/add-book', {
      layout: 'layout',
      title: 'Add Book',
      error: 'Invalid input'
    })
  }
}

// Mengubah isi review buku
export async function submitUpdateBookReviewForm(req, res) {
  const { summary } = req.body
  const userBookId = req.params.id

  try {
    await axios.patch(
      `${API_BASE_URL}/user-books/${userBookId}`,
      { summary },
      {
        headers: {
          cookie: req.headers.cookie
        }
      }
    )

    return res.redirect('/books')
  } catch (err) {
    if (err.response?.status === 401) {
      return res.redirect('/login')
    }

    if (err.response?.status === 404) {
      return res.status(404).render('pages/404')
    }

    return res.status(400).send('Failed to update review')
  }

}

// Menghapus buku dari database user_books
export async function deleteBook(req, res) {
  const userBookId = req.params.id

  try {
    await deleteUserBook(userBookId)
    res.status(200).send('Book deleted')
  } catch (err) {
    console.error('Error deleting book:', err.message)
    res.status(500).send('Error deleting book')
  }
}

// Mengurutkan data buku
// export async function sortBooks(req, res) {
//   const sort = req.query.sort || '';
//   const userId = req.session.userId;
//   const username = req.session.username;

//   const sortOptions = {
//     'title-asc': { column: 'books.title', direction: 'ASC' },
//     'title-desc': { column: 'books.title', direction: 'DESC' },
//     'date-newest': { column: 'user_books.read_at', direction: 'DESC' },
//     'date-oldest': { column: 'user_books.read_at', direction: 'ASC' },
//     'author-asc': { column: 'books.author', direction: 'ASC' },
//     'author-desc': { column: 'books.author', direction: 'DESC' },
//   };

//   const selectedSort = sortOptions[sort] || {
//     column: 'books.created_at',
//     direction: 'DESC',
//   };
//   const orderByClause = `ORDER BY ${selectedSort.column} ${selectedSort.direction}`;

//   try {
//     const result = await sortBooksByClause(userId, orderByClause);

//     res.render(
//       'pages/books',
//       renderBooksPage({
//         user: username,
//         booksData: result.rows,
//       })
//     );
//   } catch (err) {
//     console.error('Error executing query', err.stack);
//     res.status(500).send('Internal Server Error');
//   }
// }