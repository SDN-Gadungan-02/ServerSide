import express from 'express';
import { login, verify, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Pastikan path tidak mengandung URL lengkap
router.post('/login', login);          // BENAR
router.get('/verify', authenticate, verify);  // BENAR
router.post('/logout', logout);        // BENAR
export default router;