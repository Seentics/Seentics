# User Management Microservice

This document describes the User Management microservice, which handles authentication, user profiles, website management, and subscription billing.

## 🏗️ Architecture Overview

The User Management service is a Node.js-based microservice that provides:

- **User Authentication**: Registration, login, OAuth integration
- **Profile Management**: User profiles, preferences, settings
- **Website Management**: Multi-website support per user
- **Subscription Billing**: Lemon Squeezy integration
- **Session Management**: JWT-based authentication

## 🔧 Technical Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **OAuth**: Google and GitHub integration
- **Billing**: Lemon Squeezy webhooks
- **Validation**: Joi schema validation
- **Encryption**: Bcrypt for passwords

## 📁 Project Structure

```
services/users/
├── src/
│   ├── config/           # Configuration management
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── validation/      # Request validation schemas
├── tests/               # Test files
├── Dockerfile           # Docker configuration
├── package.json         # Dependencies
└── README.md           # Service documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- Redis (for session management)

### Installation
```bash
cd services/users
npm install
```

### Environment Configuration
Create a `.env` file with the following variables:

```bash
# Service Configuration
NODE_ENV=development
PORT=3001
USER_SERVICE_PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/seentics_users
USER_MONGODB_URI=mongodb://localhost:27017/seentics_users

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
USER_JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRE=30d

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Lemon Squeezy Configuration
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_STORE_ID=your_store_id_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Running the Service
```bash
# Development mode
npm run dev

# Production mode
npm start

# With PM2
pm2 start ecosystem.config.js
```

## 📊 Data Models

### User Model
```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Website Model
```javascript
const websiteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  settings: {
    trackingEnabled: {
      type: Boolean,
      default: true
    },
    privacyPolicy: String,
    cookieConsent: {
      type: Boolean,
      default: false
    },
    gdprCompliance: {
      type: Boolean,
      default: false
    },
    dataRetention: {
      type: Number,
      default: 90
    }
  },
  integrations: {
    googleAnalytics: String,
    facebookPixel: String,
    customScripts: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Subscription Model
```javascript
const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'standard', 'pro'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing'],
    default: 'active'
  },
  lemonSqueezyId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: Date,
  trialStart: Date,
  trialEnd: Date,
  features: {
    maxWebsites: {
      type: Number,
      default: 1
    },
    maxWorkflows: {
      type: Number,
      default: 5
    },
    dataRetention: {
      type: Number,
      default: 30
    },
    apiCalls: {
      type: Number,
      default: 10000
    },
    supportLevel: {
      type: String,
      enum: ['community', 'email', 'priority'],
      default: 'community'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

## 🔐 Authentication System

### JWT Token Structure
```javascript
const tokenPayload = {
  userId: user._id,
  email: user.email,
  plan: user.subscription?.plan || 'free',
  permissions: user.permissions,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
};
```

### Refresh Token System
- **Access Token**: Short-lived (7 days) for API access
- **Refresh Token**: Long-lived (30 days) for token renewal
- **Token Rotation**: New refresh token issued with each renewal
- **Token Invalidation**: Refresh tokens invalidated on logout

### OAuth Integration
```javascript
// Google OAuth
const googleStrategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/v1/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      'oauth.google.id': profile.id 
    });
    
    if (!user) {
      user = await User.create({
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avatar: profile.photos[0].value,
        emailVerified: true,
        oauth: {
          google: {
            id: profile.id,
            accessToken,
            refreshToken
          }
        }
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});
```

## 🌐 API Endpoints

### Authentication Routes
```javascript
// POST /api/v1/auth/register
router.post('/register', validateRegistration, registerUser);

// POST /api/v1/auth/login
router.post('/login', validateLogin, loginUser);

// POST /api/v1/auth/refresh
router.post('/refresh', validateRefreshToken, refreshToken);

// POST /api/v1/auth/logout
router.post('/logout', authenticateToken, logoutUser);

// GET /api/v1/auth/me
router.get('/me', authenticateToken, getCurrentUser);
```

### User Management Routes
```javascript
// PUT /api/v1/user/profile
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);

// PUT /api/v1/user/password
router.put('/password', authenticateToken, validatePasswordChange, changePassword);

// DELETE /api/v1/user/account
router.delete('/account', authenticateToken, deleteAccount);
```

### Website Management Routes
```javascript
// GET /api/v1/websites
router.get('/', authenticateToken, getWebsites);

// POST /api/v1/websites
router.post('/', authenticateToken, validateWebsite, createWebsite);

// GET /api/v1/websites/:id
router.get('/:id', authenticateToken, validateWebsiteAccess, getWebsite);

// PUT /api/v1/websites/:id
router.put('/:id', authenticateToken, validateWebsiteAccess, validateWebsite, updateWebsite);

// DELETE /api/v1/websites/:id
router.delete('/:id', authenticateToken, validateWebsiteAccess, deleteWebsite);
```

### Subscription Routes
```javascript
// GET /api/v1/subscriptions
router.get('/', authenticateToken, getSubscription);

// POST /api/v1/webhooks/lemon-squeezy
router.post('/webhooks/lemon-squeezy', validateWebhook, handleWebhook);
```

## 🛡️ Security Features

### Password Security
```javascript
// Password hashing with bcrypt
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password validation
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar;
};
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
```

### Input Validation
```javascript
const Joi = require('joi');

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  ).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required()
});

const websiteSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  domain: Joi.string().domain().required(),
  description: Joi.string().max(500).optional()
});
```

## 🔄 Business Logic

### User Registration Flow
```javascript
const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'User already exists' }
      });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      emailVerificationToken: generateToken()
    });
    
    // Send verification email
    await sendVerificationEmail(user.email, user.emailVerificationToken);
    
    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};
```

### Website Creation Flow
```javascript
const createWebsite = async (req, res) => {
  try {
    const { name, domain, description } = req.body;
    const userId = req.user.id;
    
    // Check subscription limits
    const user = await User.findById(userId).populate('subscription');
    const websiteCount = await Website.countDocuments({ userId });
    
    if (websiteCount >= user.subscription?.features?.maxWebsites) {
      return res.status(403).json({
        success: false,
        error: { message: 'Website limit reached for your plan' }
      });
    }
    
    // Create website
    const website = await Website.create({
      userId,
      name,
      domain,
      description
    });
    
    res.status(201).json({
      success: true,
      data: { website }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};
```

## 🧪 Testing

### Unit Tests
```javascript
describe('User Registration', () => {
  it('should create a new user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe'
    };
    
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
    expect(response.body.data.accessToken).toBeDefined();
  });
  
  it('should reject duplicate email', async () => {
    // Create first user
    await User.create(userData);
    
    // Try to create duplicate
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('User already exists');
  });
});
```

### Integration Tests
```javascript
describe('Website Management', () => {
  let authToken;
  let userId;
  
  beforeEach(async () => {
    // Create test user and get auth token
    const user = await createTestUser();
    userId = user._id;
    authToken = generateTestToken(user);
  });
  
  it('should create website for authenticated user', async () => {
    const websiteData = {
      name: 'Test Website',
      domain: 'test.com',
      description: 'Test description'
    };
    
    const response = await request(app)
      .post('/api/v1/websites')
      .set('Authorization', `Bearer ${authToken}`)
      .send(websiteData)
      .expect(201);
    
    expect(response.body.data.website.userId).toBe(userId.toString());
    expect(response.body.data.website.domain).toBe(websiteData.domain);
  });
});
```

## 📊 Monitoring & Logging

### Health Checks
```javascript
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    // Check Redis connection
    await redis.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      redis: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

### Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🚀 Deployment

### Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

### Environment Variables
```bash
# Production environment
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/seentics_users
JWT_SECRET=production-secret-key
REDIS_URL=redis://redis:6379
```

### Health Check Endpoint
```javascript
// Docker health check
router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'OK',
    redis: 'OK'
  };
  
  try {
    await mongoose.connection.db.admin().ping();
  } catch (error) {
    health.database = 'ERROR';
    health.status = 'ERROR';
  }
  
  try {
    await redis.ping();
  } catch (error) {
    health.redis = 'ERROR';
    health.status = 'ERROR';
  }
  
  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## 📚 Additional Resources

- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [System Architecture](./SYSTEM_ARCHITECTURE_OVERVIEW.md)
- [Contributing Guide](../CONTRIBUTING.md)
