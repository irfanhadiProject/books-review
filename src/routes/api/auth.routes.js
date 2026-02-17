import express from 'express'
import { 
  login, 
  logout 
} from '../../controllers/api/auth.controller.js'

const router = express.Router()

router.post('/login', login)
router.post('/logout', logout)
router.get('/me', (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({
      status: 'success',
      data: { 
        userId: req.session.userId,
        username: req.session.username,
        role: req.session.role 
      }
    })
  }
  return res.status(401).json({ status: 'fail', message: 'Unauthorized' })
})

export default router