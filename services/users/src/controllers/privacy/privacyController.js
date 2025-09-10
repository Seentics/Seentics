import path from 'path';
import { fileURLToPath } from 'url';
import PrivacyRequest from '../../models/PrivacyRequest.js';
import PrivacySettings from '../../models/PrivacySettings.js';
import { User } from '../../models/User.js';
import { Website } from '../../models/Website.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get user's privacy settings
export const getPrivacySettings = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const userId = req.user._id;

    // Validate user ID format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    let settings = await PrivacySettings.findOne({ userId });

    if (!settings) {
      settings = new PrivacySettings({ userId });
      await settings.save();
    }

    res.json({
      success: true,
      data: {
        settings: settings.toJSON()
      }
    });
  } catch (error) {
    console.error('Privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get privacy settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user's privacy settings
export const updatePrivacySettings = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const userId = req.user._id;

    // Validate user ID format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }
    const updates = req.body;

    let settings = await PrivacySettings.findOne({ userId });

    if (!settings) {
      settings = new PrivacySettings({ userId });
    }

    // Update settings
    Object.keys(updates).forEach(key => {
      if (settings.schema.paths[key]) {
        settings[key] = updates[key];
      }
    });

    await settings.save();

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: {
        settings: settings.toJSON()
      }
    });
  } catch (error) {
    console.error('Privacy settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Submit a privacy request (data export, deletion, etc.)
export const submitPrivacyRequest = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const userId = req.user._id;
    const { type, details } = req.body;

    // Validate request type
    const validTypes = ['data_export', 'data_deletion', 'data_portability', 'opt_out'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request type'
      });
    }

    // Check for existing pending request of same type
    const existingRequest = await PrivacyRequest.findOne({
      userId,
      type,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A request of this type is already pending'
      });
    }

    // Create new privacy request
    const privacyRequest = new PrivacyRequest({
      userId,
      type,
      details: details || '',
      status: 'pending',
      requestedAt: new Date()
    });

    await privacyRequest.save();

    res.json({
      success: true,
      message: 'Privacy request submitted successfully',
      data: {
        request: privacyRequest.toJSON()
      }
    });
  } catch (error) {
    console.error('Privacy request submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit privacy request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's privacy requests
export const getPrivacyRequests = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const userId = req.user._id;

    const requests = await PrivacyRequest.find({ userId })
      .sort({ requestedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        requests: requests.map(req => req.toJSON())
      }
    });
  } catch (error) {
    console.error('Privacy requests retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get privacy requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Export user data (GDPR compliance)
export const exportUserData = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const userId = req.user._id;

    // Gather all user data
    const user = await User.findById(userId).select('-password -refreshToken');
    const websites = await Website.find({ userId });
    const privacySettings = await PrivacySettings.findOne({ userId });
    const privacyRequests = await PrivacyRequest.find({ userId });

    const userData = {
      user: user ? user.toJSON() : null,
      websites: websites.map(w => w.toJSON()),
      privacySettings: privacySettings ? privacySettings.toJSON() : null,
      privacyRequests: privacyRequests.map(r => r.toJSON()),
      exportedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'User data exported successfully',
      data: userData
    });
  } catch (error) {
    console.error('User data export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete user data (GDPR compliance)
export const deleteUserData = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const userId = req.user._id;
    const { confirmPassword } = req.body;

    // Verify password if user has one
    const user = await User.findById(userId);
    if (user.password) {
      if (!confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password confirmation required'
        });
      }

      const isMatch = await user.comparePassword(confirmPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid password'
        });
      }
    }

    // Delete all user-related data
    await Promise.all([
      Website.deleteMany({ userId }),
      PrivacySettings.deleteOne({ userId }),
      PrivacyRequest.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.json({
      success: true,
      message: 'User data deleted successfully'
    });
  } catch (error) {
    console.error('User data deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Download privacy data as file
export const downloadPrivacyData = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const userId = req.user._id;

    // Gather all user data
    const user = await User.findById(userId).select('-password -refreshToken');
    const websites = await Website.find({ userId });
    const privacySettings = await PrivacySettings.findOne({ userId });
    const privacyRequests = await PrivacyRequest.find({ userId });

    const userData = {
      user: user ? user.toJSON() : null,
      websites: websites.map(w => w.toJSON()),
      privacySettings: privacySettings ? privacySettings.toJSON() : null,
      privacyRequests: privacyRequests.map(r => r.toJSON()),
      exportedAt: new Date().toISOString()
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="privacy-data-${userId}-${Date.now()}.json"`);

    res.json(userData);
  } catch (error) {
    console.error('Privacy data download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download privacy data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const privacyController = {
  getPrivacySettings,
  updatePrivacySettings,
  submitPrivacyRequest,
  getPrivacyRequests,
  exportUserData,
  deleteUserData,
  downloadPrivacyData
};

export default privacyController;
