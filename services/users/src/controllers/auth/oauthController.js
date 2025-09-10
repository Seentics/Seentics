import { User } from '../../models/User.js';
import { generateTokens, generateTokenPayload } from '../../utils/jwt.js';
import { getGoogleUserInfo, getGithubUserInfo } from '../../utils/oauth.js';
import { config } from '../../config/config.js';

// Google OAuth
export const googleAuth = async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Authorization code is required'
        });
      }


      // Get user info from Google
      const googleUser = await getGoogleUserInfo(code);

      // Validate user data
      if (!googleUser.email || !googleUser.googleId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user data received from Google'
        });
      }

      // Find or create user using the new method
      let user = await User.findOrCreateOAuthUser('google', googleUser);
      
      // Validate OAuth user data
      try {
        user.validateOAuthData();
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError.message
        });
      }

      // Generate tokens
      const payload = generateTokenPayload(user);
      const { accessToken, refreshToken } = generateTokens(payload);

      // Save refresh token and update login tracking
      user.refreshToken = refreshToken;
      await user.updateLoginTracking();

      res.json({
        success: true,
        message: 'Google OAuth successful',
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      console.error('Google OAuth error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Google OAuth failed',
        error: error.message
      });
    }
};

// GitHub OAuth
export const githubAuth = async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Authorization code is required'
        });
      }


      // Get user info from GitHub
      const githubUser = await getGithubUserInfo(code);

      // Validate user data
      if (!githubUser.email || !githubUser.githubId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user data received from GitHub'
        });
      }

      // Find or create user using the new method
      let user = await User.findOrCreateOAuthUser('github', githubUser);
      
      // Validate OAuth user data
      try {
        user.validateOAuthData();
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError.message
        });
      }

      // Generate tokens
      const payload = generateTokenPayload(user);
      const { accessToken, refreshToken } = generateTokens(payload);

      // Save refresh token and update login tracking
      user.refreshToken = refreshToken;
      await user.updateLoginTracking();

      res.json({
        success: true,
        message: 'GitHub OAuth successful',
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      console.error('GitHub OAuth error:', error.message);
      res.status(500).json({
        success: false,
        message: 'GitHub OAuth failed',
        error: error.message
      });
    }
};

// Health check for OAuth configuration
export const healthCheck = async (req, res) => {
    try {
      const health = {
        google: {
          configured: !!(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET),
          clientId: config.GOOGLE_CLIENT_ID ? 'configured' : 'missing',
          clientSecret: config.GOOGLE_CLIENT_SECRET ? 'configured' : 'missing'
        },
        github: {
          configured: !!(config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET),
          clientId: config.GITHUB_CLIENT_ID ? 'configured' : 'missing',
          clientSecret: config.GITHUB_CLIENT_SECRET ? 'configured' : 'missing'
        },
        frontend: {
          url: config.FRONTEND_URL,
          redirectUris: {
            google: `${config.FRONTEND_URL}/auth/google/callback`,
            github: `${config.FRONTEND_URL}/auth/github/callback`
          }
        }
      };

      res.json({
        success: true,
        message: 'OAuth health check',
        data: health
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
};