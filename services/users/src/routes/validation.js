import express from 'express';
import WebsiteController from '../controllers/websites/websitesController.js';
import UserController from '../controllers/auth/userController.js';
import CacheController from '../controllers/websites/cacheController.js';

const router = express.Router();

// Website lookup routes (for gateway validation)
router.get('/websites/by-domain/:domain', WebsiteController.getWebsiteByDomain);
router.get('/websites/by-site-id/:siteId', WebsiteController.getWebsiteBySiteId);
router.get('/websites/:websiteId', WebsiteController.getWebsiteById);

// Authentication validation routes
router.post('/auth/validate', UserController.validateToken);

// Cache invalidation routes
router.post('/cache/clear-user/:userId', CacheController.clearUserCache);
router.post('/cache/clear-website/:websiteId', CacheController.clearWebsiteCache);
router.post('/cache/clear-token', CacheController.clearTokenCache);

export default router;