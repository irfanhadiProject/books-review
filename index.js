import express from 'express';
import session from 'express-session';
import ejsLayouts from 'express-ejs-layouts';
import bodyParser from 'body-parser';
import axios from 'axios';
import pg from 'pg';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env', // Memastikan pemilihan file .env yang benar
});

const app = express();
const port = process.env.PORT;
const apiURL = process.env.API_URL;
const { Client } = pg;
let db;

if (process.env.DATABASE_URL) {
  db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // agar cocok dengan Railway
  });
} else {
  db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}
db.connect();

app.set('view engine', 'ejs');
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(ejsLayouts);
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  const openPaths = ['/login', '/logout'];
  const protectedPrefix = ['/books'];

  if (openPaths.includes(req.path)) return next(); // Akses route login dan logout tanpa perlu login

  if (req.path === '/') {
    if (req.session && req.session.loggedIn) {
      return next();
    } else {
      return res.redirect('/login');
    }
  }

  if (protectedPrefix.some((prefix) => req.path.startsWith(prefix))) {
    if (req.session && req.session.loggedIn) {
      return next();
    } else {
      // Redirect ke login page jika belum login
      return res.redirect('/login');
    } // Akses route lain hanya bisa setelah login
  }

  res.status(404).render('pages/404', {
    title: '404 Not Found',
    layout: 'layout',
    showHeader: false,
    showFooter: false,
  });
});

async function isValidImage(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    // Periksa apakah konten berupa gambar
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('image')) {
      return false; // Bukan gambar
    }

    // Cek apakah gambar berukuran 1x1px
    const buffer = Buffer.from(response.data);
    const imageSize = await getImageSize(buffer); // Fungsi untuk mengambil metadata gambar

    if (imageSize.width === 1 && imageSize.height === 1) {
      return false; // Gambar 1x1px dianggap sebagai placeholder
    }

    return true; // Gambar valid
  } catch (error) {
    console.error('Error checking image:', error.message);
    return false; // Jika gagal mendapatkan gambar, anggap invalid
  }
}

async function getImageSize(buffer) {
  // Menggunakan sharp untuk mendapatkan ukuran gambar
  return sharp(buffer)
    .metadata()
    .then((metadata) => metadata);
}

async function getFinalCoverUrl(isbn, apiURL) {
  const coverUrl = `${apiURL}/${isbn}-M.jpg`;
  const largeCoverUrl = `${apiURL}/${isbn}-L.jpg`;
  const smallCoverUrl = `${apiURL}/${isbn}-S.jpg`;

  // Mengecek gambar secara paralel
  const [isLargeValid, isMediumValid, isSmallValid] = await Promise.all([
    isValidImage(largeCoverUrl),
    isValidImage(coverUrl),
    isValidImage(smallCoverUrl),
  ]);

  // Menentukan URL final berdasarkan validitas dan prioritas
  let finalUrl = null;
  if (isLargeValid) {
    finalUrl = await getFinalRedirectUrl(largeCoverUrl); // Mendapatkan URL final setelah redirect
  } else if (isMediumValid) {
    finalUrl = await getFinalRedirectUrl(coverUrl); // Mendapatkan URL final setelah redirect
  } else if (isSmallValid) {
    finalUrl = await getFinalRedirectUrl(smallCoverUrl); // Mendapatkan URL final setelah redirect
  }

  return finalUrl; // Mengembalikan URL akhir atau null jika tidak valid
}

// Fungsi untuk mendapatkan URL akhir setelah redirect
async function getFinalRedirectUrl(url) {
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      maxRedirects: 5,
    });
    return res.request.res.responseUrl; // Mengembalikan URL final setelah redirect
  } catch (err) {
    console.error(`Error fetching final URL from ${url}:`, err.message);
    return null;
  }
}

// Tampilkan halaman login
app.get('/login', (req, res) => {
  res.render('pages/login', {
    layout: 'layout',
    title: 'Login',
    showHeader: false,
    showFooter: false,
    error: null,
  });
});

// Route proses login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(
      'SELECT id, password_hash FROM users WHERE username =$1',
      [username]
    );

    // Cek username dan password
    if (result.rows.length === 0) {
      return res.status(401).render('pages/login', {
        layout: 'layout',
        title: 'Login',
        showHeader: false,
        showFooter: false,
        error: 'User tidak ditemukan',
      });
    }

    const user = result.rows[0];

    const match = password == user.password_hash;

    if (!match) {
      return res.status(401).render('pages/login', {
        layout: 'layout',
        title: 'Login',
        showHeader: false,
        showFooter: false,
        error: 'Username atau password salah!',
      });
    }

    req.session.loggedIn = true;
    req.session.username = username;
    req.session.userId = user.id;

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// Pertama kali memuat website
app.get('/', (req, res) => {
  const username = req.session.username;

  res.render('pages/home', {
    layout: 'layout',
    title: 'Homepage',
    showHeader: true,
    showFooter: false,
    user: username,
  });
});

app.get('/books', async (req, res) => {
  const userId = req.session.userId;
  const username = req.session.username;

  try {
    const result = await db.query(
      `SELECT books.*, user_books.read_at
       FROM user_books
       JOIN books ON user_books.book_id = books.id
       WHERE user_books.user_id = $1
       ORDER BY user_books.read_at DESC`,
      [userId]
    );

    res.render('pages/books', {
      layout: 'layout',
      title: 'Books Review',
      showHeader: true,
      showFooter: true,
      user: username,
      booksData: result.rows,
    });
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Internal Server Error');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Mendapatkan data buku berdasarkan judul melalui fitur search
app.get('/books/search-book', async (req, res) => {
  const search = req.query.search;
  const userId = req.session.userId;
  const username = req.session.username;

  try {
    const result = await db.query(
      `SELECT books.*, user_books.read_at
       FROM user_books
       JOIN books ON user_books.book_id = books.id
       WHERE user_books.user_id = $1
       AND books.title ILIKE $2
       ORDER BY user_books.read_at DESC`,
      [userId, `%${search}%`]
    );

    res.render('pages/books', {
      layout: 'layout',
      title: 'Books Review',
      showHeader: true,
      showFooter: true,
      user: username,
      booksData: result.rows,
    });
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Internal Server Error');
  }
});

// Mendapatkan data buku berdasarkan genre melalui fitur filter genre
app.get('/books/filter-by', async (req, res) => {
  const genre = req.query.genre;
  const userId = req.session.userId;
  const username = req.session.username;

  try {
    const result = await db.query(
      `SELECT books.*, user_books.read_at
       FROM user_books
       JOIN books ON user_books.book_id = books.id
       WHERE user_books.user_id = $1
       AND books.genre ILIKE $2
       ORDER BY user_books.read_at DESC`,
      [userId, `%${genre}%`]
    );
    res.render('pages/books', {
      layout: 'layout',
      title: 'Books Review',
      showHeader: true,
      showFooter: true,
      user: username,
      booksData: result.rows,
    });
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Internal Server Error');
  }
});

// Mengurutkan data buku
app.get('/books/sort-by', async (req, res) => {
  const sort = req.query.sort || '';
  const userId = req.session.userId;
  const username = req.session.username;

  const sortOptions = {
    'title-asc': { column: 'books.title', direction: 'ASC' },
    'title-desc': { column: 'books.title', direction: 'DESC' },
    'date-newest': { column: 'user_books.read_at', direction: 'DESC' },
    'date-oldest': { column: 'user_books.read_at', direction: 'ASC' },
    'author-asc': { column: 'books.author', direction: 'ASC' },
    'author-desc': { column: 'books.author', direction: 'DESC' },
  };

  const selectedSort = sortOptions[sort] || {
    column: 'books.created_at',
    direction: 'DESC',
  };
  const orderByClause = `ORDER BY ${selectedSort.column} ${selectedSort.direction}`;

  try {
    const result = await db.query(
      `SELECT books.*, user_books.read_at
       FROM user_books
       JOIN books ON user_books.book_id = books.id
       WHERE user_books.user_id = $1
       ${orderByClause}`,
      [userId]
    );
    res.render('pages/books', {
      layout: 'layout',
      title: 'Books Review',
      showHeader: true,
      showFooter: true,
      user: username,
      booksData: result.rows,
    });
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Internal Server Error');
  }
});

// Menambahkan buku ke database melalui fitur add book
app.post('/books/add-book', async (req, res) => {
  const { title, author, isbn, genre, setting, readability, words, summary } =
    req.body;
  const userId = req.session.userId;

  try {
    const finalCoverUrl = await getFinalCoverUrl(isbn, apiURL); // Mendapatkan URL gambar yang valid

    if (!finalCoverUrl) {
      return res.status(500).send('Error resolving image URL');
    }

    const existingBook = await db.query(
      `SELECT id FROM books WHERE isbn = $1`,
      [isbn]
    );

    let bookId;
    // Mendapatkan bookId
    if (existingBook.rows.length > 0) {
      bookId = existingBook.rows[0].id; // Dapatkan bookId dari database
    } else {
      const new_book = await db.query(
        `INSERT INTO books(title, author, cover, isbn, genre, setting, readability, words, summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id;`,
        [
          title,
          author,
          finalCoverUrl,
          isbn,
          genre,
          setting,
          readability,
          words,
          summary,
        ]
      );
      bookId = new_book.rows[0].id; // Tambahkan buku ke database dan dapatkan bookId
    }

    // Tambahkan userId dan bookId ke daftar buku yang sudah dibaca user
    await db.query(
      `INSERT INTO user_books(user_id, book_id, read_at)
       VALUES ($1, $2, NOW()) 
       ON CONFLICT DO NOTHING`, // Jika ada koflik (duplikat pasangan userId dan book Id) do nothing
      [userId, bookId]
    );

    res.redirect('/books');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
