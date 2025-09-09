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

export const generateTokenPayload = (user) => {
  return {
    userId: user._id,
    email: user.email,
    name: user.name,
    isActive: user.isActive
  };
};