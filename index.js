import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import pg from 'pg';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

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

async function isValidImage(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    // Periksa apakah gambar berukuran 1x1px atau tidak valid
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

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// First Load
app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM books ORDER BY id DESC');
    res.render('index.ejs', { booksData: result.rows }); // ← pakai result.rows langsung
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/add-book', async (req, res) => {
  const { title, author, isbn, genre, setting, readability, words, summary } =
    req.body;

  try {
    const finalCoverUrl = await getFinalCoverUrl(isbn, apiURL); // Mendapatkan URL gambar yang valid
    console.log(finalCoverUrl);

    if (!finalCoverUrl) {
      return res.status(500).send('Error resolving image URL');
    }

    await db.query(
      'INSERT INTO books(title, author, cover, isbn, genre, setting, readability, words, summary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);',
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
    res.redirect('/');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
