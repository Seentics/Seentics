import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';

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

export const authorize = (requiredPlan = null) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({ userId: req.userId });
      
      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'No subscription found'
        });
      }

      req.subscription = subscription;

      if (requiredPlan) {
        const planHierarchy = ['free', 'standard', 'pro', 'enterprise', 'lifetime'];
        const userPlanIndex = planHierarchy.indexOf(subscription.plan);
        const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

        if (userPlanIndex < requiredPlanIndex) {
          return res.status(403).json({
            success: false,
            message: `${requiredPlan} plan required`
          });
        }
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

export const checkUsageLimit = (action) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({ userId: req.userId });
      
      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'No subscription found'
        });
      }

      if (!subscription.canPerformAction(action)) {
        return res.status(403).json({
          success: false,
          message: `Usage limit exceeded for ${action}`,
          limits: subscription.limits,
          usage: subscription.usage
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Usage limit check failed'
      });
    }
  };
};