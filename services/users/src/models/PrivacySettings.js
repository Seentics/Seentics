import mongoose from 'mongoose';

const privacySettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // Privacy preferences
  analyticsTracking: {
    type: Boolean,
    default: true
  },
  marketingEmails: {
    type: Boolean,
    default: false
  },
  personalizedContent: {
    type: Boolean,
    default: true
  },
  thirdPartySharing: {
    type: Boolean,
    default: false
  },
  // Cookie preferences
  cookieConsent: {
    essential: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    preferences: { type: Boolean, default: false }
  },
  // Data retention preferences
  dataRetention: {
    type: String,
    enum: ['1year', '2years', '5years', 'indefinite'],
    default: '2years'
  },
  // Notification preferences
  notifications: {
    dataRequests: { type: Boolean, default: true },
    policyChanges: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true }
  },
  // GDPR/CCPA specific settings
  gdprConsent: {
    given: { type: Boolean, default: false },
    givenAt: { type: Date },
    version: { type: String, default: '1.0' }
  },
  ccpaOptOut: {
    optedOut: { type: Boolean, default: false },
    optedOutAt: { type: Date }
  },
  // Data processing consent
  dataProcessing: {
    analytics: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    personalization: { type: Boolean, default: true },
    research: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for efficient queries
privacySettingsSchema.index({ userId: 1 });

// Method to update consent
privacySettingsSchema.methods.updateConsent = function(consentData) {
  if (consentData.analytics !== undefined) this.analyticsTracking = consentData.analytics;
  if (consentData.marketing !== undefined) this.marketingEmails = consentData.marketing;
  if (consentData.personalizedContent !== undefined) this.personalizedContent = consentData.personalizedContent;
  if (consentData.thirdPartySharing !== undefined) this.thirdPartySharing = consentData.thirdPartySharing;
  
  // Update GDPR consent
  this.gdprConsent.given = true;
  this.gdprConsent.givenAt = new Date();
  
  return this.save();
};

// Method to opt out of CCPA
privacySettingsSchema.methods.optOutCCPA = function() {
  this.ccpaOptOut.optedOut = true;
  this.ccpaOptOut.optedOutAt = new Date();
  this.marketingEmails = false;
  this.thirdPartySharing = false;
  this.dataProcessing.marketing = false;
  return this.save();
};

export default mongoose.model('PrivacySettings', privacySettingsSchema);
