import { visitorService } from '../services/visitorService.js';
import { logger } from '../utils/logger.js';

class VisitorTagController {
  // Check if visitor has a specific tag
  async hasTag(req, res, next) {
    try {
      const { siteId, visitorId } = req.params;
      const { tag } = req.query;
      
      if (!tag) {
        return res.status(400).json({ error: 'Tag parameter is required' });
      }

      const tags = await visitorService.getTags(siteId, visitorId);
      const hasTag = tags.includes(tag);
      
      res.json({ hasTag });
    } catch (error) {
      logger.error('Error checking visitor tag:', error);
      next(error);
    }
  }

  // Add tag to visitor
  async addTag(req, res, next) {
    try {
      const { siteId, visitorId } = req.params;
      const { tagName } = req.body;
      
      if (!tagName) {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      await visitorService.addTag(siteId, visitorId, tagName);
      res.json({ success: true, message: 'Tag added successfully' });
    } catch (error) {
      logger.error('Error adding tag to visitor:', error);
      next(error);
    }
  }

  // Remove tag from visitor
  async removeTag(req, res, next) {
    try {
      const { siteId, visitorId, tagName } = req.params;
      
      await visitorService.removeTag(siteId, visitorId, tagName);
      res.json({ success: true, message: 'Tag removed successfully' });
    } catch (error) {
      logger.error('Error removing tag from visitor:', error);
      next(error);
    }
  }

  // Get all tags for a visitor
  async getTags(req, res, next) {
    try {
      const { siteId, visitorId } = req.params;
      
      const tags = await visitorService.getTags(siteId, visitorId);
      res.json({ tags });
    } catch (error) {
      logger.error('Error getting visitor tags:', error);
      next(error);
    }
  }
}

export const visitorTagController = new VisitorTagController();