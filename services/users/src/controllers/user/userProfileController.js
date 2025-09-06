import { User } from '../../models/User.js';

class UserProfileController {
  // Get user profile
  async getProfile(req, res) {
    try {
      res.json({
        success: true,
        data: {
          user: req.user.toJSON()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: error.message
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, email, avatar } = req.body;
      const user = req.user;

      // Check if email is being changed and if it's already taken
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
        user.email = email;
        user.isEmailVerified = false; // Reset email verification if email changed
      }

      if (name) user.name = name;
      if (avatar) user.avatar = avatar;

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      // Check if user has a password (not OAuth only)
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change password for OAuth-only accounts'
        });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message
      });
    }
  }

  // Delete account
  async deleteAccount(req, res) {
    try {
      const { password } = req.body;
      const user = req.user;

      // Verify password if user has one
      if (user.password) {
        if (!password) {
          return res.status(400).json({
            success: false,
            message: 'Password is required to delete account'
          });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Password is incorrect'
          });
        }
      }

      // Soft delete - deactivate account
      user.isActive = false;
      user.refreshToken = null;
      await user.save();

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete account',
        error: error.message
      });
    }
  }
}

export default new UserProfileController();