import db from '../utils/db.js';

// Tampilkan halaman login
export function showLoginPage(req, res) {
  res.render('pages/login', {
    layout: 'layout',
    title: 'Login',
    showHeader: false,
    showFooter: false,
    error: null,
  });
}

// Tangani proses login
export async function handleLogin(req, res) {
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
        error: 'User not found!',
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
        error: 'Username or password wrong!',
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
}

// Tangani Logout
export function handleLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}
