import express from 'express';
import AuthController from '../controllers/auth/authController.js';
import OAuthController from '../controllers/auth/oauthController.js';
import UserController from '../controllers/auth/userController.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Authentication routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);

// OAuth routes
router.post('/google', OAuthController.googleAuth);
router.post('/github', OAuthController.githubAuth);
router.get('/oauth/health', OAuthController.healthCheck);

// User routes
router.get('/me', authenticate, UserController.getCurrentUser);
router.post('/validate', UserController.validateToken);

export default router;