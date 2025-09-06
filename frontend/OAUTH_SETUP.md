# OAuth Setup Guide

This guide explains how to set up Google and GitHub OAuth authentication for the Seentics application.

## Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Set the application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
7. Copy the Client ID and add it to your `.env.local` file

## GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: "Seentics"
   - Homepage URL: `http://localhost:3000` (or your production URL)
   - Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and add it to your `.env.local` file

## Backend Configuration

Make sure your backend (user service) has the corresponding environment variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## How It Works

1. User clicks "Sign in with Google" or "Sign in with GitHub"
2. User is redirected to Google/GitHub for authentication
3. After successful authentication, user is redirected back to `/auth/google/callback` or `/auth/github/callback`
4. The callback page exchanges the authorization code for user data via the backend API
5. User is logged in and redirected to the dashboard

## Security Notes

- Never commit your OAuth secrets to version control
- Use different OAuth apps for development and production
- Ensure your redirect URIs are properly configured
- The backend handles all token exchange securely
