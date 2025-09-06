import { Subscription } from '../../models/Subscription.js';
import { User } from '../../models/User.js';

class SubscriptionController {
  // Get current subscription
  async getCurrentSubscription(req, res) {
    try {
      let subscription = await Subscription.findOne({ userId: req.userId });

      if (!subscription) {
        // Auto-provision free plan
        const user = await User.findById(req.userId);
        subscription = await Subscription.create({
          userId: req.userId,
          plan: 'free',
          status: 'active',
          limits: { websites: 1, workflows: 5, monthlyEvents: 10000, aiOptimizations: 5 },
          usage: { websites: 0, workflows: 0, monthlyEvents: 0, aiOptimizations: 0 },
          billingInfo: user?.email ? { customerEmail: user.email, currency: 'USD', price: 0, interval: 'monthly' } : undefined,
          lemonSqueezyId: `free-${req.userId}`,
          orderId: `free-${Date.now()}`,
          productId: 'free'
        });
      }

      res.json({
        success: true,
        data: {
          subscription: subscription.toJSON()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription',
        error: error.message
      });
    }
  }

  // Get subscription usage
  async getUsage(req, res) {
    try {
      const subscription = await Subscription.findOne({ userId: req.userId });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No subscription found'
        });
      }

      res.json({
        success: true,
        data: {
          usage: subscription.usage,
          limits: subscription.limits,
          plan: subscription.plan,
          status: subscription.status,
          eventsSuspended: subscription.eventsSuspended
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get usage',
        error: error.message
      });
    }
  }

  // Check if action is allowed
  async checkLimit(req, res) {
    try {
      const { action, count = 1 } = req.body;
      const subscription = await Subscription.findOne({ userId: req.userId });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No subscription found'
        });
      }

      const canPerform = subscription.canPerformAction(action, count);

      res.json({
        success: true,
        data: {
          canPerform,
          currentUsage: subscription.usage[action] || 0,
          limit: subscription.limits[action] || 0,
          remaining: Math.max(0, (subscription.limits[action] || 0) - (subscription.usage[action] || 0))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check limit',
        error: error.message
      });
    }
  }

  // Increment usage (internal endpoint)
  async incrementUsage(req, res) {
    try {
      const { action, count = 1 } = req.body;
      const subscription = await Subscription.findOne({ userId: req.userId });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No subscription found'
        });
      }

      // Check if action is allowed
      if (!subscription.canPerformAction(action, count)) {
        return res.status(403).json({
          success: false,
          message: 'Usage limit exceeded',
          data: {
            currentUsage: subscription.usage[action] || 0,
            limit: subscription.limits[action] || 0
          }
        });
      }

      // Increment usage
      await subscription.incrementUsage(action, count);

      res.json({
        success: true,
        message: 'Usage incremented successfully',
        data: {
          newUsage: subscription.usage[action],
          remaining: Math.max(0, subscription.limits[action] - subscription.usage[action])
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to increment usage',
        error: error.message
      });
    }
  }

  // Batch increment for high-volume analytics events (used by analytics service)
  async batchIncrementEvents(req, res) {
    try {
      const { count = 1 } = req.body;
      const subscription = await Subscription.findOne({ userId: req.userId });

      if (!subscription) {
        return res.status(404).json({ success: false, message: 'No subscription found' });
      }

      // If lifetime plan, just acknowledge
      if (subscription.plan === 'lifetime') {
        return res.json({ success: true, data: { usage: subscription.usage.monthlyEvents, limit: Infinity } });
      }

      // Increment monthly events without per-request gating; external services should throttle using Redis
      await subscription.incrementUsage('monthlyEvents', count);

      res.json({
        success: true,
        data: {
          newUsage: subscription.usage.monthlyEvents,
          limit: subscription.limits.monthlyEvents
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to batch increment events', error: error.message });
    }
  }

  // Daily evaluation endpoint to suspend/resume analytics intake when over cap
  async evaluateAnalyticsCap(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
      const subscription = await Subscription.findOne({ userId });
      if (!subscription) return res.status(404).json({ success: false, message: 'No subscription found' });

      const overCap = (subscription.usage.monthlyEvents || 0) >= (subscription.limits.monthlyEvents || 0);
      subscription.eventsSuspended = overCap && subscription.plan !== 'lifetime';
      await subscription.save();

      res.json({ success: true, data: { eventsSuspended: subscription.eventsSuspended } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to evaluate cap', error: error.message });
    }
  }

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const subscription = await Subscription.findOne({ userId: req.userId });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No subscription found'
        });
      }

      if (subscription.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Subscription is already cancelled'
        });
      }

      // Update subscription status to cancelled
      subscription.status = 'cancelled';
      subscription.endsAt = subscription.renewsAt || new Date(); // End at next renewal or now
      await subscription.save();

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: {
          subscription: subscription.toJSON()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription',
        error: error.message
      });
    }
  }
}

export default new SubscriptionController();