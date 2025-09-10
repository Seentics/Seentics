// Clear cache when user is updated
export const clearUserCache = async (req, res) => {
      try {
        const { userId } = req.params;
        
        // Here you would typically call your cache service or publish to Redis
        // For now, just acknowledge the request
        
        res.json({
          success: true,
          message: 'User cache clear requested'
        });
      } catch (error) {
        console.error('Clear user cache error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to clear user cache'
        });
      }
};

// Clear cache when website is updated
export const clearWebsiteCache = async (req, res) => {
      try {
        const { websiteId } = req.params;
        
        // Here you would typically call your cache service or publish to Redis
        
        res.json({
          success: true,
          message: 'Website cache clear requested'
        });
      } catch (error) {
        console.error('Clear website cache error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to clear website cache'
        });
      }
};

// Clear token cache (for logout)
export const clearTokenCache = async (req, res) => {
      try {
        const { token } = req.body;
        
        if (!token) {
          return res.status(400).json({
            success: false,
            message: 'Token required'
          });
        }
        
        // Here you would typically call your cache service
        
        res.json({
          success: true,
          message: 'Token cache clear requested'
        });
      } catch (error) {
        console.error('Clear token cache error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to clear token cache'
        });
      }
};