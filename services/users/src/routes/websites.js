import express from 'express';
import WebsiteManagementController from '../controllers/websites/websiteManagementController.js';
import { authenticate, checkUsageLimit } from '../middleware/auth.js';
import { websiteValidation } from '../middleware/validation.js';

const router = express.Router();

// Website CRUD operations
router.get('/', authenticate, WebsiteManagementController.getAllWebsites);
router.get('/:id', authenticate, WebsiteManagementController.getWebsite);
router.post('/', authenticate, checkUsageLimit('websites'), websiteValidation, WebsiteManagementController.createWebsite);
router.put('/:id', authenticate, websiteValidation, WebsiteManagementController.updateWebsite);
router.delete('/:id', authenticate, WebsiteManagementController.deleteWebsite);

// Website settings management
router.put('/:id/settings', authenticate, WebsiteManagementController.updateWebsiteSettings);

// Website validation (public endpoint)
router.post('/validate', WebsiteManagementController.validateWebsite);

export default router;