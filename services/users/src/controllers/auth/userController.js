import { User } from '../../models/User.js';
import { verifyToken } from '../../utils/jwt.js';

// Get current user
export const getCurrentUser = async (req, res) => {
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
        message: 'Failed to get user info',
        error: error.message
      });
    }
};

// Validate JWT token (for protected route validation)
export const validateToken = async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token required'
        });
      }

      // Verify token
      const decoded = verifyToken(token);
      
      // Get user data
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Return user data for cache
      const userData = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        plan: user.plan || 'free',
        status: user.status || 'active',
        isActive: user.isActive
      };

      res.json(userData);
    } catch (error) {
      console.error('Token validation error:', error);
      
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
};