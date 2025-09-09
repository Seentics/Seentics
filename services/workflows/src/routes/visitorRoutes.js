import express from 'express';
import * as visitorTagController from '../controllers/visitorController.js';

const router = express.Router();

// Check if visitor has a specific tag
router.get('/:siteId/:visitorId/has-tag', visitorTagController.hasTag);

// Add tag to visitor
router.post('/:siteId/:visitorId/tags', visitorTagController.addTag);

// Remove tag from visitor
router.delete('/:siteId/:visitorId/tags/:tagName', visitorTagController.removeTag);

// Get all tags for a visitor
router.get('/:siteId/:visitorId/tags', visitorTagController.getTags);

export default router;