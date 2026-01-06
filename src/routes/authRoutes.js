import express from 'express'
import {
  showLoginPage,
  login,
  showSignUpPage,
  handleLogout,
  handleSignUp,
} from '../controllers/authController.js'

const router = express.Router()

router.get('/login', showLoginPage)
router.post('/login', login)
router.get('/signup', showSignUpPage)
router.post('/signup', handleSignUp)
router.get('/logout', handleLogout)

export default router
