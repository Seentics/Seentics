import express from 'express';
import UserProfileController from '../controllers/user/userProfileController.js';
import { authenticate } from '../middleware/auth.js';
import { updateProfileValidation } from '../middleware/validation.js';

const router = express.Router();

// Profile management routes
router.get('/profile', authenticate, UserProfileController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, UserProfileController.updateProfile);

// Account security routes
router.put('/password', authenticate, UserProfileController.changePassword);
router.delete('/account', authenticate, UserProfileController.deleteAccount);

export default router;