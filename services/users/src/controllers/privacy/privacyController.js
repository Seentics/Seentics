import PrivacyRequest from '../../models/PrivacyRequest.js';
import PrivacySettings from '../../models/PrivacySettings.js';
import { User } from '../../models/User.js';
import { Website } from '../../models/Website.js';
import { Subscription } from '../../models/Subscription.js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PrivacyController {
  // Get user's privacy settings
  async getPrivacySettings(req, res) {
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
      
      // Create default settings if none exist
      if (!settings) {
        settings = new PrivacySettings({
          userId,
          gdprConsent: {
            given: true,
            givenAt: new Date(),
            version: '1.0'
          }
        });
        await settings.save();
      }

      res.json({
        success: true,
        data: { settings }
      });
    } catch (error) {
      console.error('Privacy settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get privacy settings',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update user's privacy settings
  async updatePrivacySettings(req, res) {
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
        data: { settings }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update privacy settings',
        error: error.message
      });
    }
  }

  // Create a privacy request (export, deletion, correction)
  async createPrivacyRequest(req, res) {
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

      const { type, reason, details, requestedData } = req.body;

      // Validate required fields
      if (!type || typeof type !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Request type is required and must be a string'
        });
      }

      // Validate request type
      if (!['export', 'deletion', 'correction', 'portability'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request type. Must be one of: export, deletion, correction, portability'
        });
      }

      // Validate reason for deletion requests
      if (type === 'deletion' && (!reason || typeof reason !== 'string' || reason.trim().length < 10)) {
        return res.status(400).json({
          success: false,
          message: 'Reason is required for deletion requests and must be at least 10 characters'
        });
      }

      // Validate details for correction requests
      if (type === 'correction' && (!details || typeof details !== 'string' || details.trim().length < 10)) {
        return res.status(400).json({
          success: false,
          message: 'Details are required for correction requests and must be at least 10 characters'
        });
      }

      // Check for existing pending requests of the same type
      const existingRequest = await PrivacyRequest.findOne({
        userId,
        type,
        status: { $in: ['pending', 'processing'] }
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: `You already have a ${type} request in progress`
        });
      }

      // Create new privacy request
      const privacyRequest = new PrivacyRequest({
        userId,
        type,
        reason,
        details,
        requestedData: requestedData || {
          profile: true,
          analytics: true,
          workflows: true,
          subscriptions: true
        }
      });

      await privacyRequest.save();

      // Start processing based on type
      if (type === 'export') {
        // Process export immediately
        this.processDataExport(privacyRequest._id);
      }

      res.json({
        success: true,
        message: `${type} request submitted successfully`,
        data: { request: privacyRequest }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create privacy request',
        error: error.message
      });
    }
  }

  // Get user's privacy requests
  async getPrivacyRequests(req, res) {
    try {
      const userId = req.user._id;
      const { status, type } = req.query;

      const filter = { userId };
      if (status) filter.status = status;
      if (type) filter.type = type;

      const requests = await PrivacyRequest.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        success: true,
        data: { requests }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get privacy requests',
        error: error.message
      });
    }
  }

  // Process data export
  async processDataExport(requestId) {
    try {
      const request = await PrivacyRequest.findById(requestId);
      if (!request) return;

      await request.updateStatus('processing', 'Collecting user data...');

      const userId = request.userId;
      const requestedData = request.requestedData;

      // Collect data from all services
      const exportData = {
        userId: userId.toString(),
        exportedAt: new Date().toISOString(),
        requestId: requestId.toString(),
        data: {}
      };

      // User profile data
      if (requestedData.profile) {
        const user = await User.findById(userId).select('-password -refreshToken');
        const websites = await Website.find({ userId });
        const subscription = await Subscription.findOne({ userId });
        
        exportData.data.profile = {
          user: user ? user.toJSON() : null,
          websites: websites || [],
          subscription: subscription || null
        };
      }

      // Analytics data (would need to call analytics service)
      if (requestedData.analytics) {
        exportData.data.analytics = {
          note: 'Analytics data would be collected from analytics service',
          placeholder: 'Real implementation would call analytics service API'
        };
      }

      // Workflow data (would need to call workflows service)
      if (requestedData.workflows) {
        exportData.data.workflows = {
          note: 'Workflow data would be collected from workflows service',
          placeholder: 'Real implementation would call workflows service API'
        };
      }

      // Generate download URL
      const filename = `seentics-data-export-${userId}-${Date.now()}.json`;
      const exportDir = path.join(__dirname, '../../../exports');
      
      // Ensure exports directory exists
      try {
        await fs.mkdir(exportDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      const filePath = path.join(exportDir, filename);
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));

      // Update request with download URL
      const downloadUrl = `/api/v1/user/privacy/download/${filename}`;
      request.downloadUrl = downloadUrl;
      await request.updateStatus('completed', 'Data export completed successfully');

    } catch (error) {
      console.error('Data export error:', error);
      const request = await PrivacyRequest.findById(requestId);
      if (request) {
        await request.updateStatus('failed', `Export failed: ${error.message}`);
      }
    }
  }

  // Download exported data
  async downloadExport(req, res) {
    try {
      const { filename } = req.params;
      const userId = req.user._id;

      // Verify the file belongs to this user
      const request = await PrivacyRequest.findOne({
        userId,
        downloadUrl: `/api/v1/user/privacy/download/${filename}`,
        status: 'completed'
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Export file not found or expired'
        });
      }

      // Check if file has expired
      if (request.expiresAt && new Date() > request.expiresAt) {
        return res.status(410).json({
          success: false,
          message: 'Export file has expired'
        });
      }

      const filePath = path.join(__dirname, '../../../exports', filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Export file not found'
        });
      }

      res.download(filePath, `seentics-data-export-${userId}.json`);

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to download export',
        error: error.message
      });
    }
  }

  // Process data deletion request
  async processDataDeletion(req, res) {
    try {
      const userId = req.user._id;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Reason is required for data deletion'
        });
      }

      // Create deletion request
      const deletionRequest = new PrivacyRequest({
        userId,
        type: 'deletion',
        reason,
        status: 'pending'
      });

      await deletionRequest.save();

      // Start deletion process (in real implementation, this would be a background job)
      this.processDataDeletionAsync(deletionRequest._id);

      res.json({
        success: true,
        message: 'Data deletion request submitted successfully',
        data: { request: deletionRequest }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to process deletion request',
        error: error.message
      });
    }
  }

  // Process data deletion asynchronously
  async processDataDeletionAsync(requestId) {
    try {
      const request = await PrivacyRequest.findById(requestId);
      if (!request) return;

      await request.updateStatus('processing', 'Starting data deletion process...');

      const userId = request.userId;

      // Delete user data from all services
      // 1. User service data
      await User.findByIdAndUpdate(userId, { 
        isActive: false,
        email: `deleted_${Date.now()}@deleted.com`,
        name: 'Deleted User',
        avatar: null,
        refreshToken: null
      });

      // 2. Website data
      await Website.deleteMany({ userId });

      // 3. Subscription data
      await Subscription.deleteMany({ userId });

      // 4. Privacy settings
      await PrivacySettings.deleteOne({ userId });

      // 5. Privacy requests (except this one)
      await PrivacyRequest.deleteMany({ 
        userId, 
        _id: { $ne: requestId } 
      });

      // Note: In real implementation, you would also:
      // - Call analytics service to delete user data
      // - Call workflows service to delete user data
      // - Send notifications to other services
      // - Log the deletion for audit purposes

      await request.updateStatus('completed', 'Data deletion completed successfully');

    } catch (error) {
      console.error('Data deletion error:', error);
      const request = await PrivacyRequest.findById(requestId);
      if (request) {
        await request.updateStatus('failed', `Deletion failed: ${error.message}`);
      }
    }
  }

  // Get privacy compliance status
  async getComplianceStatus(req, res) {
    try {
      const userId = req.user._id;
      
      const settings = await PrivacySettings.findOne({ userId });
      const pendingRequests = await PrivacyRequest.countDocuments({
        userId,
        status: { $in: ['pending', 'processing'] }
      });

      const complianceStatus = {
        gdprCompliant: settings?.gdprConsent?.given || false,
        ccpaCompliant: !settings?.ccpaOptOut?.optedOut,
        pendingRequests,
        lastUpdated: settings?.updatedAt || new Date()
      };

      res.json({
        success: true,
        data: { complianceStatus }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get compliance status',
        error: error.message
      });
    }
  }
}

export default new PrivacyController();
