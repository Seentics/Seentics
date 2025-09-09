import mongoose from 'mongoose';

const privacyRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['export', 'deletion', 'correction', 'portability'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: function() {
      return this.type === 'deletion';
    }
  },
  details: {
    type: String,
    required: function() {
      return this.type === 'correction';
    }
  },
  requestedData: {
    profile: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    workflows: { type: Boolean, default: true }
  },
  processingNotes: {
    type: String
  },
  completedAt: {
    type: Date
  },
  estimatedCompletion: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  },
  downloadUrl: {
    type: String // For export requests
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for downloads
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
privacyRequestSchema.index({ userId: 1, status: 1 });
privacyRequestSchema.index({ type: 1, status: 1 });
privacyRequestSchema.index({ createdAt: -1 });

// Virtual for time remaining
privacyRequestSchema.virtual('timeRemaining').get(function() {
  if (this.status === 'completed') return null;
  const now = new Date();
  const remaining = this.estimatedCompletion - now;
  return remaining > 0 ? Math.ceil(remaining / (24 * 60 * 60 * 1000)) : 0;
});

// Method to update status
privacyRequestSchema.methods.updateStatus = function(newStatus, notes = null) {
  this.status = newStatus;
  if (notes) this.processingNotes = notes;
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  return this.save();
};

export default mongoose.model('PrivacyRequest', privacyRequestSchema);
