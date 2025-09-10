import { Visitor } from '../models/Visitor.js';
import { logger } from '../utils/logger.js';

// Add tag to visitor
export const addTag = async (siteId, visitorId, tagName) => {
    const doc = await Visitor.findOneAndUpdate(
      { siteId, visitorId },
      { $addToSet: { tags: tagName } },
      { new: true, upsert: true }
    );
    logger.debug('Tag added to visitor', { siteId, visitorId, tagName });
    return doc;
};

// Remove tag from visitor
export const removeTag = async (siteId, visitorId, tagName) => {
    const doc = await Visitor.findOneAndUpdate(
      { siteId, visitorId },
      { $pull: { tags: tagName } },
      { new: true }
    );
    logger.debug('Tag removed from visitor', { siteId, visitorId, tagName });
    return doc;
};

// Get visitor tags
export const getTags = async (siteId, visitorId) => {
    const doc = await Visitor.findOne({ siteId, visitorId }).lean();
    return doc?.tags || [];
};

