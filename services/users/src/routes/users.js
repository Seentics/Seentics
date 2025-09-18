import express from 'express';
import UserProfileController from '../controllers/user/userProfileController.js';
import { authenticate } from '../middleware/auth.js';
import { updateProfileValidation } from '../middleware/validation.js';
import { Website } from '../models/Website.js';

const router = express.Router();

// Profile management routes
router.get('/profile', authenticate, UserProfileController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, UserProfileController.updateProfile);

// Account security routes
router.put('/password', authenticate, UserProfileController.changePassword);
router.delete('/account', authenticate, UserProfileController.deleteAccount);

// Internal API endpoint for analytics service to get user websites
router.get('/users/:userId/websites', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get all websites for this user
    const websites = await Website.find({ userId });
    
    res.json({
      success: true,
      data: websites.map(w => ({
        _id: w._id.toString(),
        name: w.name,
        domain: w.domain,
        userId: w.userId.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching user websites:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;