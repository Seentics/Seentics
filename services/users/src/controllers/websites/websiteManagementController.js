import { Website } from '../../models/Website.js';
import CacheService from './cacheService.js';
import crypto from 'crypto';

// Get all websites for user
export const getAllWebsites = async (req, res) => {
    try {
      const websites = await Website.find({ 
        userId: req.userId,
        isActive: true 
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: {
          websites
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get websites',
        error: error.message
      });
    }
};

// Get single website
export const getWebsite = async (req, res) => {
    try {
      const website = await Website.findOne({
        _id: req.params.id,
        userId: req.userId,
        isActive: true
      });

      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      res.json({
        success: true,
        data: {
          website
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get website',
        error: error.message
      });
    }
};

// Create new website
export const createWebsite = async (req, res) => {
    try {
      const { name, url } = req.body;

      // Check if URL already exists for this user
      const existingWebsite = await Website.findOne({
        userId: req.userId,
        url,
        isActive: true
      });

      if (existingWebsite) {
        return res.status(400).json({
          success: false,
          message: 'Website with this URL already exists'
        });
      }

      // Create verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Add website
      const website = new Website({
        userId: req.userId,
        name,
        url,
        verificationToken,
        settings: {
          allowedOrigins: [url],
          trackingEnabled: true,
          dataRetentionDays: 90
        }
      });

      await website.save();

      res.status(201).json({
        success: true,
        message: 'Website created successfully',
        data: {
          website
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add website',
        error: error.message
      });
    }
};

// Update website
export const updateWebsite = async (req, res) => {
    try {
      const { name, url } = req.body;
      
      const website = await Website.findOne({
        _id: req.params.id,
        userId: req.userId,
        isActive: true
      });

      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Check if URL already exists for this user (excluding current website)
      if (url !== website.url) {
        const existingWebsite = await Website.findOne({
          userId: req.userId,
          url,
          isActive: true,
          _id: { $ne: req.params.id }
        });

        if (existingWebsite) {
          return res.status(400).json({
            success: false,
            message: 'Website with this URL already exists'
          });
        }

        // Reset verification if URL changed
        website.isVerified = false;
        website.verificationToken = crypto.randomBytes(32).toString('hex');
        website.settings.allowedOrigins = [url];
      }

      website.name = name;
      website.url = url;

      await website.save();

      // Invalidate website cache after update
      await CacheService.invalidateWebsiteCache(website._id);

      res.json({
        success: true,
        message: 'Website updated successfully',
        data: {
          website
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update website',
        error: error.message
      });
    }
};

// Delete website
export const deleteWebsite = async (req, res) => {
    try {
      const website = await Website.findOne({
        _id: req.params.id,
        userId: req.userId,
        isActive: true
      });

      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Soft delete
      website.isActive = false;
      await website.save();

      // Invalidate website cache after deletion
      await CacheService.invalidateWebsiteCache(website._id);

      res.json({
        success: true,
        message: 'Website deleted successfully',
        data: {
          id: website._id
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete website',
        error: error.message
      });
    }
};

// Update website settings
export const updateWebsiteSettings = async (req, res) => {
    try {
      const { trackingEnabled, dataRetentionDays, allowedOrigins } = req.body;
      
      const website = await Website.findOne({
        _id: req.params.id,
        userId: req.userId,
        isActive: true
      });

      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Update settings
      if (typeof trackingEnabled === 'boolean') {
        website.settings.trackingEnabled = trackingEnabled;
      }

      if (dataRetentionDays && dataRetentionDays >= 1 && dataRetentionDays <= 365) {
        website.settings.dataRetentionDays = dataRetentionDays;
      }

      if (allowedOrigins && Array.isArray(allowedOrigins)) {
        website.settings.allowedOrigins = allowedOrigins;
      }

      await website.save();

      // Invalidate website cache after settings update
      await CacheService.invalidateWebsiteCache(website._id);

      res.json({
        success: true,
        message: 'Website settings updated successfully',
        data: {
          website
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update website settings',
        error: error.message
      });
    }
};

// Validate website ID and domain match
export const validateWebsite = async (req, res) => {
    try {
      // Accept both websiteId and siteId for flexibility
      const { websiteId, siteId, domain } = req.body;
      const idToUse = websiteId || siteId;

      // Check if both ID and domain are provided
      if (!idToUse || !domain) {
        return res.status(400).json({
          success: false,
          message: 'Both websiteId/siteId and domain are required'
        });
      }

      // Validate that idToUse is a valid ObjectId
      if (!idToUse.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid website ID format. Must be a valid ObjectId.'
        });
      }

      // Find website by ID and check if domain matches
      const website = await Website.findOne({
        _id: idToUse,
        isActive: true
      });

      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Extract domain/hostname from both stored URL and request domain
      const extractDomain = (url) => {
        try {
          // If it's already a full URL, parse it
          if (url.startsWith('http://') || url.startsWith('https://')) {
            const urlObj = new URL(url);
            return urlObj.hostname;
          }
          // If it's just a domain/IP, return as is
          return url;
        } catch (error) {
          // Fallback: remove protocol and path
          return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').split(':')[0];
        }
      };

      const websiteDomain = extractDomain(website.url);
      const requestDomain = extractDomain(domain);


      // Check if domains match (case insensitive)
      // Special handling for localhost domains
      let domainMatch = websiteDomain.toLowerCase() === requestDomain.toLowerCase();
      
      // Handle localhost variations
      if (!domainMatch) {
        const isLocalhost = (domain) => {
          return domain === 'localhost' || domain === 'localhost.com' || domain === '127.0.0.1';
        };
        
        if (isLocalhost(websiteDomain) && isLocalhost(requestDomain)) {
          domainMatch = true;
        }
      }

      if (!domainMatch) {
        return res.status(400).json({
          success: false,
          message: `Website ID and domain do not match. Expected: ${websiteDomain}, Got: ${requestDomain}`
        });
      }

      // Validation successful
      res.json({
        success: true,
        message: 'Website ID and domain match validated successfully',
        data: {
          websiteId: website._id,
          domain: websiteDomain,
          websiteName: website.name,
          isVerified: website.isVerified
        }
      });

    } catch (error) {
      console.error('Website validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate website',
        error: error.message
      });
    }
};