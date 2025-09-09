import { Website } from '../../models/Website.js';

// Get website by domain (for public route validation)
export const getWebsiteByDomain = async (req, res) => {
    try {
      const { domain } = req.params;
      
      const website = await Website.findOne({ 
        domain: domain,
        isActive: true 
      }).populate('userId', 'id email plan status');

      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Return website data for cache
      const websiteData = {
        id: website._id.toString(),
        siteId: website.siteId,
        domain: website.domain,
        userId: website.userId._id.toString(),
        isActive: website.isActive,
        plan: website.userId.plan || 'free',
        userStatus: website.userId.status || 'active'
      };

      res.json(websiteData);
    } catch (error) {
      console.error('Get website by domain error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
};

// Get website by siteId (for public route validation)
export const getWebsiteBySiteId = async (req, res) => {
    try {
      const { siteId } = req.params;
      
      const website = await Website.findOne({ 
        siteId: siteId,
        isActive: true 
      }).populate('userId', 'id email plan status');

      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Return website data for cache
      const websiteData = {
        id: website._id.toString(),
        siteId: website.siteId,
        domain: website.domain,
        userId: website.userId._id.toString(),
        isActive: website.isActive,
        plan: website.userId.plan || 'free',
        userStatus: website.userId.status || 'active'
      };

      res.json(websiteData);
    } catch (error) {
      console.error('Get website by siteId error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
};

// Get website by ID (for ownership validation)
export const getWebsiteById = async (req, res) => {
    try {
      const { websiteId } = req.params;
      
      const website = await Website.findOne({ 
        _id: websiteId,
        isActive: true 
      }).populate('userId', 'id email plan status');

      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Return website data for cache
      const websiteData = {
        id: website._id.toString(),
        siteId: website.siteId,
        domain: website.domain,
        userId: website.userId._id.toString(),
        isActive: website.isActive,
        plan: website.userId.plan || 'free',
        userStatus: website.userId.status || 'active'
      };

      res.json(websiteData);
    } catch (error) {
      console.error('Get website by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
};