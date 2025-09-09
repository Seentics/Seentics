import express from 'express';
import { getWebsiteByDomain, getWebsiteBySiteId, getWebsiteById } from '../controllers/websites/websitesController.js';
import { validateToken } from '../controllers/auth/userController.js';
import { clearUserCache, clearWebsiteCache, clearTokenCache } from '../controllers/websites/cacheController.js';

const router = express.Router();

// Website lookup routes (for gateway validation)
router.get('/websites/by-domain/:domain', getWebsiteByDomain);
router.get('/websites/by-site-id/:siteId', getWebsiteBySiteId);
router.get('/websites/:websiteId', getWebsiteById);

// Authentication validation routes
router.post('/auth/validate', validateToken);

// Cache invalidation routes
router.post('/cache/clear-user/:userId', clearUserCache);
router.post('/cache/clear-website/:websiteId', clearWebsiteCache);
router.post('/cache/clear-token', clearTokenCache);

export default router;