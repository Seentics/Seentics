# Seentics User Service

A comprehensive Node.js microservice for user management, authentication, and subscription handling for the Seentics platform.

## Features

### 🔐 Authentication
- Email/password registration and login
- Google OAuth integration (without Passport.js)
- GitHub OAuth integration (without Passport.js)
- JWT-based authentication with refresh tokens
- Secure password hashing with bcrypt

### 👤 User Management
- User profile management
- Account deactivation
- Password change functionality
- Email verification system

### 💳 Subscription Management
- Integration with Lemon Squeezy
- Webhook handling for subscription events
- Usage tracking and limits
- Multiple subscription plans (free, standard, pro, enterprise, lifetime)

### 🌐 Website Management
- Create and manage websites
- Website verification system
- Usage limits based on subscription
- Settings management

### 🛡️ Security Features
- Request rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Secure webhook signature verification

## Tech Stack

- **Runtime**: Node.js 18+ with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Logging**: Morgan

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- MongoDB running locally or connection string
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)
- Lemon Squeezy account and credentials (optional)

### 2. Installation

```bash
# Clone and install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Environment Configuration

Configure your `.env` file with the following variables:

```env
# Required
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/seentics_users
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Lemon Squeezy (optional)
LEMON_SQUEEZY_API_KEY=your-api-key
LEMON_SQUEEZY_WEBHOOK_SECRET=your-webhook-secret
```

### 4. Run the Service

```bash
# Development
npm run dev

# Production
npm start
```

The service will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/google` - Google OAuth
- `POST /api/v1/auth/github` - GitHub OAuth
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `PUT /api/v1/users/password` - Change password
- `DELETE /api/v1/users/account` - Delete account

### Subscriptions
- `GET /api/v1/subscriptions/current` - Get current subscription
- `GET /api/v1/subscriptions/usage` - Get usage statistics
- `POST /api/v1/subscriptions/check-limit` - Check usage limits
- `POST /api/v1/subscriptions/increment-usage` - Increment usage

### Website Management
- `GET /api/v1/websites` - Get all websites
- `GET /api/v1/websites/:id` - Get specific website
- `POST /api/v1/websites` - Create new website
- `PUT /api/v1/websites/:id` - Update website
- `DELETE /api/v1/websites/:id` - Delete website
- `PUT /api/v1/websites/:id/settings` - Update website settings
- `POST /api/v1/websites/:id/verify` - Verify website ownership

### Webhooks
- `POST /api/v1/webhooks/lemon-squeezy` - Lemon Squeezy webhook handler

## OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/auth/google/callback`

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set authorization callback URL: `http://localhost:3000/auth/github/callback`

## Lemon Squeezy Integration

### Webhook Configuration
1. In your Lemon Squeezy dashboard, go to Settings > Webhooks
2. Add endpoint: `https://your-domain.com/api/v1/webhooks/lemon-squeezy`
3. Select events: `order_created`, `subscription_created`, `subscription_updated`, etc.
4. Set the webhook secret in your environment variables

### Subscription Plans
The service supports multiple subscription plans:

- **Free**: 1 website, 5 workflows, 10K monthly events
- **Standard**: 5 websites, 25 workflows, 100K monthly events
- **Pro**: 20 websites, 100 workflows, 500K monthly events
- **Enterprise**: 100 websites, 500 workflows, 2M monthly events
- **Lifetime**: 50 websites, 200 workflows, 1M monthly events

## Development

### Project Structure
```
src/
├── config/          # Configuration files
├── models/          # MongoDB models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
└── server.js        # Main server file
```

### Key Components

- **Authentication**: JWT-based with refresh tokens
- **OAuth**: Direct integration with Google and GitHub APIs
- **Subscription**: Lemon Squeezy webhook processing
- **Security**: Multiple layers of protection
- **Validation**: Comprehensive input validation

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **JWT Secrets**: Use strong, unique secrets in production
3. **Rate Limiting**: Configured to prevent abuse
4. **CORS**: Properly configured for your frontend domain
5. **Input Validation**: All inputs are validated and sanitized
6. **Webhook Verification**: Signatures are verified for security

## Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure MongoDB connection string
4. Set up proper CORS origins
5. Configure rate limiting for production traffic
6. Set up SSL/TLS termination
7. Configure logging and monitoring

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.