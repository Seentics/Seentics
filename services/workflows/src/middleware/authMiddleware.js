import { logger } from '../utils/logger.js';

export async function authMiddleware(req, res, next) {
  try {
    // Extract user info from headers (injected by gateway)
    const headerUserId = req.headers['x-user-id'];
    const headerUserEmail = req.headers['x-user-email'];
    const headerUserName = req.headers['x-user-name'];
    const headerUserPlan = req.headers['x-user-plan'];
    const headerUserStatus = req.headers['x-user-status'];
    
    // Add user info to request object
    if (headerUserId) {
      req.user = {
        id:headerUserId,
        _id: headerUserId,
        email: headerUserEmail,
        name: headerUserName,
        plan: headerUserPlan,
        status: headerUserStatus
      };
    }

    // Extract website/site info from headers
    const websiteId = req.headers['x-website-id'];
    const siteId = req.headers['x-site-id'];
    const websiteDomain = req.headers['x-website-domain'];
    const websiteUserId = req.headers['x-website-user-id'];
    const websiteActive = req.headers['x-website-active'];

    // Add website info to request object
    if (websiteId || siteId || websiteDomain) {
      req.website = {
        id: websiteId,
        siteId: siteId || websiteId, // fallback to websiteId if siteId not present
        domain: websiteDomain,
        userId: websiteUserId,
        isActive: websiteActive === 'true'
      };

      logger.info('Website info extracted from headers:', {
        websiteId,
        siteId,
        domain: websiteDomain,
        userId: websiteUserId,
        isActive: websiteActive
      });
    }

    logger.info('Header extraction completed:', {
      userId: req.user?._id,
      email: req.user?.email,
      websiteId: req.website?.id,
      siteId: req.website?.siteId
    });
    
    next();
  } catch (error) {
    logger.error('Header extractor middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}