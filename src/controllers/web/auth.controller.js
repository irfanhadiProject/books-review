import axios from 'axios'

// GET /login
export function showLoginPage(req, res) {
  res.render('pages/login', {
    layout: 'layout',
    title: 'Login',
    showHeader: false,
    showFooter: false,
    error: null,
  })
}

// POST /auth/login
export async function handleLogin(req, res) {
  const { username, password } = req.body

  try {
   await axios.post(
    'http://localhost:3000/api/auth/login',
    { username, password },
    {
      withCredentials: true
    }
   )

    res.redirect('/books')
  } catch (err) {
    res.render('pages/login', {
      layout: 'layout',
      title: 'Login',
      error: 'Invalid credentials'
    })
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
  })
}

export async function handleSignUp(req, res) {
  const { username, password, confirmPassword } = req.body

  try {
    if (password !== confirmPassword) {
      return res.render('pages/signup', {
        layout: 'layout',
        title: 'Sign Up',
        showHeader: false,
        showFooter: false,
        error: 'Password and confirmation do not match!',
      })
    }

    const existing = await findUser(username)
    if (existing.rows.length > 0) {
      return res.render('pages/signup', {
        layout: 'layout',
        title: 'Sign Up',
        showHeader: false,
        showFooter: false,
        error: 'Username already exist!',
      })
    }

    const newUser = await createUser(username, password)

    const userId = newUser.rows[0].id

    req.session.loggedIn = true
    req.session.username = username
    req.session.userId = userId

    res.redirect('/books')
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).send('Internal Server Error')
  }
}

// Tangani Logout
export function handleLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login')
  })
}
