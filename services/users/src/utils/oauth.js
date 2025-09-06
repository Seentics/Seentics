import axios from 'axios';
import { config } from '../config/config.js';

export const getGoogleUserInfo = async (code) => {
  try {
    
    // Validate required config
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${config.FRONTEND_URL}/auth/google/callback`
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!tokenResponse.data.access_token) {
      throw new Error('No access token received from Google');
    }

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const userData = userResponse.data;
    
    // Validate required user data
    if (!userData.id || !userData.email) {
      throw new Error('Incomplete user data received from Google');
    }


    const userInfo = {
      googleId: userData.id,
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      avatar: userData.picture
    };
    
    console.log('Google OAuth user info to be saved:', userInfo);
    return userInfo;
  } catch (error) {
    console.error('Google OAuth error:', error.message);
    
    if (error.response?.data?.error) {
      throw new Error(`Google OAuth failed: ${error.response.data.error}`);
    }
    
    throw new Error(`Failed to get Google user info: ${error.message}`);
  }
};

export const getGithubUserInfo = async (code) => {
  try {
    console.log('Starting GitHub OAuth flow with code:', code.substring(0, 10) + '...');
    
    // Validate required config
    if (!config.GITHUB_CLIENT_ID || !config.GITHUB_CLIENT_SECRET) {
      throw new Error('GitHub OAuth credentials not configured');
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: config.GITHUB_CLIENT_ID,
      client_secret: config.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!tokenResponse.data.access_token) {
      throw new Error('No access token received from GitHub');
    }

    const { access_token } = tokenResponse.data;
    console.log('GitHub access token received');

    // Get user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const userData = userResponse.data;
    
    // Validate required user data
    if (!userData.id) {
      throw new Error('Incomplete user data received from GitHub');
    }

    // Get user email (GitHub might not provide email in user endpoint)
    let email = userData.email;
    if (!email) {
      try {
        const emailResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        const primaryEmail = emailResponse.data.find(email => email.primary);
        email = primaryEmail?.email || emailResponse.data[0]?.email;
      } catch (emailError) {
        console.warn('Failed to fetch GitHub emails:', emailError.message);
      }
    }

    if (!email) {
      throw new Error('No email address found for GitHub user');
    }

    console.log('GitHub user info retrieved:', {
      id: userData.id,
      email: email,
      name: userData.name || userData.login
    });

    const userInfo = {
      githubId: userData.id.toString(),
      email: email,
      name: userData.name || userData.login,
      avatar: userData.avatar_url
    };
    
    console.log('GitHub OAuth user info to be saved:', userInfo);
    return userInfo;
  } catch (error) {
    console.error('GitHub OAuth error:', error.message);
    
    if (error.response?.data?.error) {
      throw new Error(`GitHub OAuth failed: ${error.response.data.error}`);
    }
    
    throw new Error(`Failed to get GitHub user info: ${error.message}`);
  }
};