import crypto from 'crypto';
import { User } from '../../models/User.js';
import { Subscription } from '../../models/Subscription.js';
import { config } from '../../config/config.js';

class WebhookController {
  // Lemon Squeezy webhook handler
  async handleLemonSqueezyWebhook(req, res) {
    try {
      const signature = req.headers['x-signature'];
      const body = req.body;

      // Verify webhook signature
      if (config.LEMON_SQUEEZY_WEBHOOK_SECRET) {
        const expectedSignature = crypto
          .createHmac('sha256', config.LEMON_SQUEEZY_WEBHOOK_SECRET)
          .update(body)
          .digest('hex');

        if (signature !== expectedSignature) {
          return res.status(401).json({
            success: false,
            message: 'Invalid webhook signature'
          });
        }
      }

      const event = JSON.parse(body.toString());
      

      switch (event.meta.event_name) {
        case 'order_created':
          await this.handleOrderCreated(event);
          break;
        case 'subscription_created':
          await this.handleSubscriptionCreated(event);
          break;
        case 'subscription_updated':
          await this.handleSubscriptionUpdated(event);
          break;
        case 'subscription_cancelled':
          await this.handleSubscriptionCancelled(event);
          break;
        case 'subscription_resumed':
          await this.handleSubscriptionResumed(event);
          break;
        case 'subscription_expired':
          await this.handleSubscriptionExpired(event);
          break;
        case 'subscription_paused':
          await this.handleSubscriptionPaused(event);
          break;
        case 'subscription_unpaused':
          await this.handleSubscriptionUnpaused(event);
          break;
        default:
          // Unhandled webhook event
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  }

  // Helper functions for webhook processing
  async handleOrderCreated(event) {
    const { data } = event;
    
    // Get user ID from custom parameters (more secure than email matching)
    let userId = data.attributes.custom?.userId;
    
    // Fallback: if no custom userId, try to find by email (less secure but backward compatible)
    if (!userId && data.attributes.user_email) {
      const user = await User.findOne({ email: data.attributes.user_email });
      if (user) {
        userId = user._id.toString();
      }
    }
    
    if (!userId) {
      console.error('No userId found in custom parameters or email for order:', data.id);
      return;
    }

    // Find user by ID (more secure than email)
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for ID:', userId);
      return;
    }

    // Create or update subscription
    const subscriptionData = {
      userId: user._id,
      lemonSqueezyId: data.id,
      orderId: data.attributes.order_id,
      productId: data.attributes.product_id,
      plan: this.mapProductIdToPlan(data.attributes.product_id),
      status: 'active',
      billingInfo: {
        customerEmail: data.attributes.user_email,
        customerName: data.attributes.user_name,
        currency: data.attributes.currency,
        price: data.attributes.total,
        interval: data.attributes.billing_interval
      }
    };

    await Subscription.findOneAndUpdate(
      { userId: user._id },
      subscriptionData,
      { upsert: true, new: true }
    );

  }

  async handleSubscriptionCreated(event) {
    const { data } = event;
    
    // Get user ID from custom parameters (more secure than email matching)
    let userId = data.attributes.custom?.userId;
    
    // Fallback: if no custom userId, try to find by email (less secure but backward compatible)
    if (!userId && data.attributes.user_email) {
      const user = await User.findOne({ email: data.attributes.user_email });
      if (user) {
        userId = user._id.toString();
      }
    }
    
    if (!userId) {
      console.error('No userId found in custom parameters or email for subscription:', data.id);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for ID:', userId);
      return;
    }

    const subscription = await Subscription.findOneAndUpdate(
      { userId: user._id },
      {
        lemonSqueezyId: data.id,
        status: data.attributes.status,
        renewsAt: data.attributes.renews_at ? new Date(data.attributes.renews_at) : null,
        endsAt: data.attributes.ends_at ? new Date(data.attributes.ends_at) : null,
        trialEndsAt: data.attributes.trial_ends_at ? new Date(data.attributes.trial_ends_at) : null,
        limits: this.getPlanLimits(data.attributes.product_id)
      },
      { upsert: true, new: true }
    );

  }

  async handleSubscriptionUpdated(event) {
    const { data } = event;
    
    // Get user ID from custom parameters for validation
    const userId = data.attributes.custom?.userId;
    
    const subscription = await Subscription.findOne({ lemonSqueezyId: data.id });
    if (!subscription) {
      console.error('Subscription not found for ID:', data.id);
      return;
    }

    // Validate user ID if provided (additional security)
    if (userId && subscription.userId.toString() !== userId) {
      console.error('User ID mismatch for subscription:', data.id, 'Expected:', subscription.userId, 'Got:', userId);
      return;
    }

    subscription.status = data.attributes.status;
    subscription.renewsAt = data.attributes.renews_at ? new Date(data.attributes.renews_at) : null;
    subscription.endsAt = data.attributes.ends_at ? new Date(data.attributes.ends_at) : null;
    subscription.trialEndsAt = data.attributes.trial_ends_at ? new Date(data.attributes.trial_ends_at) : null;
    subscription.plan = this.mapProductIdToPlan(data.attributes.product_id);
    subscription.limits = this.getPlanLimits(data.attributes.product_id);

    await subscription.save();

  }

  async handleSubscriptionCancelled(event) {
    const { data } = event;
    
    const subscription = await Subscription.findOne({ lemonSqueezyId: data.id });
    if (!subscription) {
      console.error('Subscription not found for ID:', data.id);
      return;
    }

    subscription.status = 'cancelled';
    subscription.endsAt = data.attributes.ends_at ? new Date(data.attributes.ends_at) : null;

    await subscription.save();

  }

  async handleSubscriptionResumed(event) {
    const { data } = event;
    
    const subscription = await Subscription.findOne({ lemonSqueezyId: data.id });
    if (!subscription) {
      console.error('Subscription not found for ID:', data.id);
      return;
    }

    subscription.status = 'active';
    subscription.renewsAt = data.attributes.renews_at ? new Date(data.attributes.renews_at) : null;

    await subscription.save();

  }

  async handleSubscriptionExpired(event) {
    const { data } = event;
    
    const subscription = await Subscription.findOne({ lemonSqueezyId: data.id });
    if (!subscription) {
      console.error('Subscription not found for ID:', data.id);
      return;
    }

    subscription.status = 'expired';
    subscription.plan = 'free';
    subscription.limits = this.getPlanLimits('free');

    await subscription.save();

  }

  async handleSubscriptionPaused(event) {
    const { data } = event;
    
    const subscription = await Subscription.findOne({ lemonSqueezyId: data.id });
    if (!subscription) {
      console.error('Subscription not found for ID:', data.id);
      return;
    }

    subscription.status = 'paused';

    await subscription.save();

  }

  async handleSubscriptionUnpaused(event) {
    const { data } = event;
    
    const subscription = await Subscription.findOne({ lemonSqueezyId: data.id });
    if (!subscription) {
      console.error('Subscription not found for ID:', data.id);
      return;
    }

    subscription.status = 'active';

    await subscription.save();

  }

  // Helper functions
  mapProductIdToPlan(productId) {
    const planMap = {
      'free': 'free',
      'standard': 'standard',
      'pro': 'pro',
      'enterprise': 'enterprise',
      'lifetime': 'lifetime'
    };

    return planMap[productId] || 'free';
  }

  getPlanLimits(productId) {
    const limits = {
      'free': {
        websites: 1,
        workflows: 5,
        monthlyEvents: 10000,
        aiOptimizations: 5
      },
      'standard': {
        websites: 10,
        workflows: 50,
        monthlyEvents: 250000,
        aiOptimizations: 100
      },
      'pro': {
        websites: 25,
        workflows: 200,
        monthlyEvents: 1000000,
        aiOptimizations: 500
      },
      'enterprise': {
        websites: 50,
        workflows: 500,
        monthlyEvents: 5000000,
        aiOptimizations: 1000
      },
      'lifetime': {
        websites: 100,
        workflows: 1000,
        monthlyEvents: 10000000,
        aiOptimizations: 2000
      }
    };

    const plan = this.mapProductIdToPlan(productId);
    return limits[plan] || limits['free'];
  }
}

export default new WebhookController();