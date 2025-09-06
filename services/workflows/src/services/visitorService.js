import { Visitor } from '../models/Visitor.js';
import { logger } from '../utils/logger.js';

export class VisitorService {
  async addTag(siteId, visitorId, tagName) {
    const doc = await Visitor.findOneAndUpdate(
      { siteId, visitorId },
      { $addToSet: { tags: tagName } },
      { new: true, upsert: true }
    );
    logger.debug('Tag added to visitor', { siteId, visitorId, tagName });
    return doc;
  }

  async removeTag(siteId, visitorId, tagName) {
    const doc = await Visitor.findOneAndUpdate(
      { siteId, visitorId },
      { $pull: { tags: tagName } },
      { new: true }
    );
    logger.debug('Tag removed from visitor', { siteId, visitorId, tagName });
    return doc;
  }

  async getTags(siteId, visitorId) {
    const doc = await Visitor.findOne({ siteId, visitorId }).lean();
    return doc?.tags || [];
  }
}

export const visitorService = new VisitorService();

