import bcrypt from 'bcrypt';
import { findUser, createUser } from '../models/authModel.js';

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
    const result = await findUser(username);

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

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).render('pages/login', {
        layout: 'layout',
        title: 'Login',
        showHeader: false,
        showFooter: false,
        error: 'Incorrect username or password',
      });
    }

    req.session.loggedIn = true;
    req.session.username = username;
    req.session.userId = user.id;

    res.redirect('/books');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
}

// Tangani sign up
export function showSignUpPage(req, res) {
  res.render('pages/signup', {
    layout: 'layout',
    title: 'Sign Up',
    showHeader: false,
    showFooter: false,
    error: null,
  });
}

export async function handleSignUp(req, res) {
  const { username, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.render('pages/signup', {
        layout: 'layout',
        title: 'Sign Up',
        showHeader: false,
        showFooter: false,
        error: 'Password and confirmation do not match!',
      });
    }

    const existing = await findUser(username);
    if (existing.rows.length > 0) {
      return res.render('pages/signup', {
        layout: 'layout',
        title: 'Sign Up',
        showHeader: false,
        showFooter: false,
        error: 'Username already exist!',
      });
    }

    const newUser = await createUser(username, password);

    const userId = newUser.rows[0].id;

    req.session.loggedIn = true;
    req.session.username = username;
    req.session.userId = userId;

    res.redirect('/books');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send('Internal Server Error');
  }
}

// Tangani Logout
export function handleLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}
