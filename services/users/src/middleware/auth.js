import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

// Simple gateway-only authenticate middleware
export const authenticate = async (req, res, next) => {
  try {
    const userId = req.header('X-User-ID');
    const userEmail = req.header('X-User-Email');
    const userPlan = req.header('X-User-Plan');
    const userStatus = req.header('X-User-Status');
    const websiteId = req.header('X-Website-ID');



    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - request must come through gateway'
      });
    }

    // Set user info from gateway headers
    req.userId = userId;
    req.userEmail = userEmail;
    req.userPlan = userPlan || 'free';
    req.userStatus = userStatus || 'active';
    req.websiteId = websiteId;

    // Create user object for backward compatibility
    req.user = {
      _id: userId,
      id: userId,
      email: userEmail,
      plan: userPlan || 'free',
      status: userStatus || 'active'
    };


    next();
  } catch (error) {
    console.error('Gateway authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Simple authorization middleware for open-source version
export const authorize = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      // For open-source version, just check if user is authenticated
      // All authenticated users have access
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Simplified usage limit check for open-source version
export const checkUsageLimit = (action) => {
  return async (req, res, next) => {
    try {
      // For open-source version, no usage limits
      // Just proceed to next middleware
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Usage limit check failed'
      });
    }
  };
};