import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
  
  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRE
  });
  
  return { accessToken, refreshToken };
};

export const verifyToken = (token, isRefresh = false) => {
  try {
    const secret = isRefresh ? config.JWT_REFRESH_SECRET : config.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const generateTokenPayload = (user, subscription = null) => {
  return {
    userId: user._id,
    email: user.email,
    name: user.name,
    plan: subscription?.plan || 'free',
    limits: subscription?.limits || {
      websites: 1,
      workflows: 5,
      monthlyEvents: 10000,
      aiOptimizations: 5
    }
  };
};