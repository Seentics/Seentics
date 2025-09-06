import crypto from 'crypto';

// API key validation middleware for inter-service communication
// This validates requests coming from the API gateway or other services
export const apiKeyMiddleware = (req, res, next) => {
  try {
    // Get global API key from environment
    const expectedAPIKey = process.env.GLOBAL_API_KEY;
    if (!expectedAPIKey) {
      console.error('❌ GLOBAL_API_KEY not configured in workflows service');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Get API key from request header
    const providedAPIKey = req.headers['x-api-key'];
    if (!providedAPIKey) {
      console.error('❌ Missing X-API-Key header in workflows service');
      return res.status(401).json({ error: 'Missing API key' });
    }

    // Validate API key using simple string comparison
    if (providedAPIKey !== expectedAPIKey) {
      console.error('❌ Invalid API key provided to workflows service');
      return res.status(401).json({ error: 'Invalid API key' });
    }

    console.log('✅ Global API key validation passed for workflows service');
    next();
  } catch (error) {
    console.error('❌ API key validation error:', error);
    return res.status(500).json({ error: 'API key validation failed' });
  }
};
