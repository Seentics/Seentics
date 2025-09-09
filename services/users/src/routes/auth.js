import express from 'express';
import { register, login, refreshToken, logout, getCurrentUser as authGetCurrentUser, validateToken as authValidateToken } from '../controllers/auth/authController.js';
import { googleAuth, githubAuth, healthCheck } from '../controllers/auth/oauthController.js';
import { getCurrentUser, validateToken } from '../controllers/auth/userController.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Authentication routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);

// OAuth routes
router.post('/google', googleAuth);
router.post('/github', githubAuth);
router.get('/oauth/health', healthCheck);

// User routes
router.get('/me', authenticate, getCurrentUser);
router.post('/validate', validateToken);

export default router;