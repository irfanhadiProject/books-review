import axios from 'axios';
import sharp from 'sharp';

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

export async function getFinalCoverUrl(isbn, apiURL) {
  const mediumCoverUrl = `${apiURL}/${isbn}-M.jpg`;
  const largeCoverUrl = `${apiURL}/${isbn}-L.jpg`;
  const smallCoverUrl = `${apiURL}/${isbn}-S.jpg`;

  // Mengecek gambar secara paralel
  const [isLargeValid, isMediumValid, isSmallValid] = await Promise.all([
    isValidImage(largeCoverUrl),
    isValidImage(mediumCoverUrl),
    isValidImage(smallCoverUrl),
  ]);

  // Menentukan URL final berdasarkan validitas dan prioritas
  let finalUrl = null;
  if (isLargeValid) {
    finalUrl = await getFinalRedirectUrl(largeCoverUrl); // Mendapatkan URL final setelah redirect
  } else if (isMediumValid) {
    finalUrl = await getFinalRedirectUrl(mediumCoverUrl);
  } else if (isSmallValid) {
    finalUrl = await getFinalRedirectUrl(smallCoverUrl);
  }

  if (!finalUrl) {
    finalUrl = 'https://placehold.co/150x220?text=No+Cover&font=roboto';
  }

  return finalUrl; // Mengembalikan URL akhir atau null jika tidak valid
}
