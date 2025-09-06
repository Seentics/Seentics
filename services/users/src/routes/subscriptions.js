import express from 'express';
import SubscriptionController from '../controllers/subscription/subscriptionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Subscription management routes
router.get('/current', authenticate, SubscriptionController.getCurrentSubscription);
router.get('/usage', authenticate, SubscriptionController.getUsage);
router.post('/cancel', authenticate, SubscriptionController.cancelSubscription);

// Usage tracking routes
router.post('/check-limit', authenticate, SubscriptionController.checkLimit);
router.post('/increment-usage', authenticate, SubscriptionController.incrementUsage);
router.post('/batch-increment-events', authenticate, SubscriptionController.batchIncrementEvents);

// Analytics management (internal)
router.post('/evaluate-analytics-cap', SubscriptionController.evaluateAnalyticsCap);

export default router;