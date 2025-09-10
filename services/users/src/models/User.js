import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId;
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  
  // OAuth fields
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  githubId: {
    type: String,
    sparse: true,
    unique: true
  },
  
  // Account status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  
  // Refresh token for JWT
  refreshToken: {
    type: String,
    default: null
  },
  
  // Email verification
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshToken;
      delete ret.__v;
      // Add id field for frontend compatibility
      ret.id = ret._id;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update login tracking
userSchema.methods.updateLoginTracking = async function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  await this.save();
};

// Check if user is OAuth user
userSchema.methods.isOAuthUser = function() {
  return !!(this.googleId || this.githubId);
};

// Get OAuth provider
userSchema.methods.getOAuthProvider = function() {
  if (this.googleId) return 'google';
  if (this.githubId) return 'github';
  return 'local';
};

// Validate OAuth user data
userSchema.methods.validateOAuthData = function() {
  if (this.isOAuthUser()) {
    if (!this.email) {
      throw new Error('Email is required for OAuth users');
    }
    if (!this.name) {
      throw new Error('Name is required for OAuth users');
    }
  }
  return true;
};

// Static method to find user by OAuth ID
userSchema.statics.findByOAuthId = function(provider, oauthId) {
  const query = {};
  if (provider === 'google') {
    query.googleId = oauthId;
  } else if (provider === 'github') {
    query.githubId = oauthId;
  }
  return this.findOne(query);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Verify email with token
userSchema.methods.verifyEmail = function(token) {
  if (!this.emailVerificationToken || this.emailVerificationToken !== token) {
    return false;
  }
  
  if (this.emailVerificationExpires < Date.now()) {
    return false;
  }
  
  this.isEmailVerified = true;
  this.emailVerificationToken = null;
  this.emailVerificationExpires = null;
  
  return true;
};

// Static method to find or create OAuth user
userSchema.statics.findOrCreateOAuthUser = async function(provider, oauthData) {
  
  let user = await this.findByOAuthId(provider, oauthData[`${provider}Id`]);
  
  if (!user) {
    // Also check by email
    user = await this.findOne({ email: oauthData.email });
    
    if (user) {
      // Update existing user with OAuth ID and avatar
      user[`${provider}Id`] = oauthData[`${provider}Id`];
      if (oauthData.avatar) {
        user.avatar = oauthData.avatar;
      }
      await user.save();
    } else {
      // Create new user
      user = new this({
        email: oauthData.email,
        name: oauthData.name,
        avatar: oauthData.avatar,
        [`${provider}Id`]: oauthData[`${provider}Id`],
        isEmailVerified: true
      });
      await user.save();
    }
  } else {
    if (oauthData.avatar && user.avatar !== oauthData.avatar) {
      user.avatar = oauthData.avatar;
      await user.save();
    }
  }
  
  return user;
};

export const User = mongoose.model('User', userSchema);