# Seentics User Service (Open Source)

A comprehensive Node.js microservice for user management and authentication for the Seentics platform. This is the open-source version with essential user and website functionality.

## Features

### 🔐 Authentication
- Email/password registration and login with email verification
- Google OAuth integration (without Passport.js)
- GitHub OAuth integration (without Passport.js)
- JWT-based authentication with refresh tokens
- Secure password hashing with bcrypt

### 👤 User Management
- User profile management
- Account deactivation
- Password change functionality
- Email verification system
- Privacy settings and GDPR compliance

### 🌐 Website Management
- Create and manage websites
- Website verification system
- Settings management
- Domain validation

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
FRONTEND_URL=http://localhost:3000

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (optional - for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
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
- `POST /api/v1/auth/register` - Register new user with email verification
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/google` - Google OAuth
- `POST /api/v1/auth/github` - GitHub OAuth
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/validate` - Validate JWT token

### Website Management
- `GET /api/v1/websites` - Get all websites
- `GET /api/v1/websites/:id` - Get specific website
- `POST /api/v1/websites` - Create new website
- `PUT /api/v1/websites/:id` - Update website
- `DELETE /api/v1/websites/:id` - Delete website
- `PUT /api/v1/websites/:id/settings` - Update website settings
- `POST /api/v1/websites/validate` - Validate website ID and domain

### Privacy & GDPR
- `GET /api/v1/privacy/settings` - Get privacy settings
- `PUT /api/v1/privacy/settings` - Update privacy settings
- `POST /api/v1/privacy/request` - Create privacy request (export/deletion)
- `GET /api/v1/privacy/requests` - Get privacy requests
- `GET /api/v1/privacy/download/:filename` - Download data export

### Validation (Internal)
- `GET /api/v1/validation/websites/by-domain/:domain` - Get website by domain
- `GET /api/v1/validation/websites/by-site-id/:siteId` - Get website by site ID
- `GET /api/v1/validation/websites/:websiteId` - Get website by ID
- `POST /api/v1/validation/auth/validate` - Validate authentication token

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

## Email Verification Setup

For email verification functionality, configure SMTP settings in your environment:

1. **Gmail**: Use App Passwords for authentication
2. **Other SMTP providers**: Configure host, port, and credentials
3. **Development**: Consider using services like Mailtrap for testing

## Architecture Overview

### Function-Based Controllers
All controllers use modern ES6 function exports instead of classes:
```javascript
// Authentication functions
export const register = async (req, res) => { /* ... */ };
export const login = async (req, res) => { /* ... */ };

// Website management functions  
export const getAllWebsites = async (req, res) => { /* ... */ };
export const createWebsite = async (req, res) => { /* ... */ };
```

### Key Features
- **No Usage Limits**: Open-source version removes subscription-based restrictions
- **Email Verification**: Built-in email verification for new registrations
- **GDPR Compliance**: Privacy settings and data export/deletion functionality
- **Modern Architecture**: Function-based exports, ES6 modules, async/await

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

- **Authentication**: JWT-based with refresh tokens and email verification
- **OAuth**: Direct integration with Google and GitHub APIs
- **Privacy**: GDPR-compliant data handling and user rights
- **Security**: Multiple layers of protection
- **Validation**: Comprehensive input validation

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **JWT Secrets**: Use strong, unique secrets in production
3. **Rate Limiting**: Configured to prevent abuse
4. **CORS**: Properly configured for your frontend domain
5. **Input Validation**: All inputs are validated and sanitized
6. **Password Security**: Bcrypt hashing with salt rounds

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