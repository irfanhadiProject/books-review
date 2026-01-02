import { loginUser } from '../services/auth.service.js'
import { handleError, handleSuccess } from '../helpers/responseHandler.js'
import { mapDomainErrorToHttpError } from '../utils/mapDomainErrorToHttpError.js'

// Tampilkan halaman login
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
export async function login(req, res, next) {
  const { username, password } = req.body

  try {
    const user = await loginUser({ username, password })

    req.session.userId = user.userId
    req.session.role = user.role

    return handleSuccess(
      res,
      {
        userId: user.userId,
        username: user.username,
        role: user.role
      },
      'Login successful'
    )
  } catch (err) {
    return handleError(next, mapDomainErrorToHttpError(err))
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
