import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Lemon Squeezy data
  lemonSqueezyId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  
  // Subscription details
  plan: {
    type: String,
    enum: ['free', 'standard', 'pro', 'enterprise', 'lifetime'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'on_trial', 'paused', 'lifetime'],
    default: 'active'
  },
  
  // Dates
  trialEndsAt: {
    type: Date,
    default: null
  },
  renewsAt: {
    type: Date,
    default: null
  },
  endsAt: {
    type: Date,
    default: null
  },
  
  // Limits based on plan
  limits: {
    websites: {
      type: Number,
      default: 1
    },
    workflows: {
      type: Number,
      default: 5
    },
    monthlyEvents: {
      type: Number,
      default: 10000
    },
    aiOptimizations: {
      type: Number,
      default: 5
    }
  },
  
  // Usage tracking
  usage: {
    websites: {
      type: Number,
      default: 0
    },
    workflows: {
      type: Number,
      default: 0
    },
    monthlyEvents: {
      type: Number,
      default: 0
    },
    aiOptimizations: {
      type: Number,
      default: 0
    }
  },
  
  // Billing info
  billingInfo: {
    customerEmail: String,
    customerName: String,
    currency: String,
    price: Number,
    interval: String
  },
  // Daily-evaluated flag to throttle analytics events if monthly cap exceeded
  eventsSuspended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Method to check if user can perform an action
subscriptionSchema.methods.canPerformAction = function(action, count = 1) {
  const current = this.usage[action] || 0;
  const limit = this.limits[action] || 0;
  
  if (this.plan === 'lifetime') {
    return true;
  }
  
  return (current + count) <= limit;
};

// Method to increment usage
subscriptionSchema.methods.incrementUsage = async function(action, count = 1) {
  if (!this.usage[action]) this.usage[action] = 0;
  this.usage[action] += count;
  await this.save();
};

// Method to reset monthly usage
subscriptionSchema.methods.resetMonthlyUsage = async function() {
  this.usage.monthlyEvents = 0;
  this.usage.aiOptimizations = 0;
  await this.save();
};

export const Subscription = mongoose.model('Subscription', subscriptionSchema);