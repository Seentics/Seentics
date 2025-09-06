import { User } from '../../models/User.js';
import { Subscription } from '../../models/Subscription.js';
import { generateTokens, verifyToken, generateTokenPayload } from '../../utils/jwt.js';
import { getGoogleUserInfo, getGithubUserInfo } from '../../utils/oauth.js';

class AuthController {
  // Register
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create user
      const user = new User({
        email,
        password,
        name,
        isEmailVerified: false
      });

      await user.save();

      // Create default subscription
      const subscription = new Subscription({
        userId: user._id,
        lemonSqueezyId: `free_${user._id}`,
        orderId: `free_${user._id}`,
        productId: 'free',
        plan: 'free',
        status: 'active'
      });

      await subscription.save();

      // Generate tokens
      const payload = generateTokenPayload(user, subscription);
      const { accessToken, refreshToken } = generateTokens(payload);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: user.toJSON(),
          subscription: subscription.toJSON(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Get subscription
      const subscription = await Subscription.findOne({ userId: user._id });

      // Generate tokens
      const payload = generateTokenPayload(user, subscription);
      const { accessToken, refreshToken } = generateTokens(payload);

      // Save refresh token and update login tracking
      user.refreshToken = refreshToken;
      await user.updateLoginTracking();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          subscription: subscription?.toJSON(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = verifyToken(refreshToken, true);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Get subscription
      const subscription = await Subscription.findOne({ userId: user._id });

      // Generate new tokens
      const payload = generateTokenPayload(user, subscription);
      const tokens = generateTokens(payload);

      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        error: error.message
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      // Clear refresh token
      req.user.refreshToken = null;
      await req.user.save();

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const subscription = await Subscription.findOne({ userId: req.userId });

      res.json({
        success: true,
        data: {
          user: req.user.toJSON(),
          subscription: subscription?.toJSON()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user info',
        error: error.message
      });
    }
  }

  // Validate JWT token
  async validateToken(req, res) {
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
  }
}

export default new AuthController();