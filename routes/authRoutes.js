import express from 'express';
import {
  showLoginPage,
  handleLogin,
  handleLogout,
} from '../controllers/authController.js';

const router = express.Router();

router.get('/login', showLoginPage);
router.post('/login', handleLogin);
router.get('/logout', handleLogout);

export default router;
