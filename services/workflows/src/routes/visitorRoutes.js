import express from 'express';
import { visitorTagController } from '../controllers/visitorController.js';

const router = express.Router();

// Check if visitor has a specific tag
router.get('/:siteId/:visitorId/has-tag', visitorTagController.hasTag.bind(visitorTagController));

// Add tag to visitor
router.post('/:siteId/:visitorId/tags', visitorTagController.addTag.bind(visitorTagController));

// Remove tag from visitor
router.delete('/:siteId/:visitorId/tags/:tagName', visitorTagController.removeTag.bind(visitorTagController));

// Get all tags for a visitor
router.get('/:siteId/:visitorId/tags', visitorTagController.getTags.bind(visitorTagController));

export default router;