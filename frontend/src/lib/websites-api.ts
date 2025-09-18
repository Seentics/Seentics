import api from './api';

export type Website = {
  id: string;
  name: string;
  url: string;
  userId: string;
  siteId: string; // maps to _id in the response
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  isActive: boolean;
  verificationToken: string;
  settings: {
    allowedOrigins: string[];
    trackingEnabled: boolean;
    dataRetentionDays: number;
  };
  stats: {
    totalPageviews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
};

// Fetches all websites for the current user.
export async function getWebsites(): Promise<Website[]> {
  try {
    const response = await api.get('/user/websites');
    const websites = response?.data?.data?.websites || [];
    return websites.map((w: any) => ({
      id: w._id,
      name: w.name,
      url: w.url,
      userId: w.userId,
      siteId: w._id,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      isVerified: w.isVerified,
      isActive: w.isActive,
      verificationToken: w.verificationToken,
      settings: w.settings,
      stats: w.stats,
    }));
  } catch (error) {
    console.error('Error fetching websites:', error);
    return [];
  }
}


// Adds a new website.
export async function addWebsite(website: { name: string; url: string }, userId: string): Promise<Website> {
  console.log('Inside add website')
  try {
    const response: any = await api.post('/user/websites', { ...website, userId });
    console.log('Full API response:', response);
    console.log('Response data:', response?.data);
    
    // Try different possible response structures
    const websiteData = response?.data?.data?.website || response?.data?.website || response?.data?.data || response?.data || response;
    console.log('Parsed website data:', websiteData);
    
    if (!websiteData || (!websiteData._id && !websiteData.id)) {
      throw new Error('Invalid website data received from server');
    }
    
    return {
      id: websiteData._id || websiteData.id,
      siteId: websiteData._id || websiteData.id || websiteData.siteId,
      name: websiteData.name,
      url: websiteData.url,
      userId: websiteData.userId,
      createdAt: websiteData.createdAt,
      updatedAt: websiteData.updatedAt,
      isVerified: websiteData.isVerified || false,
      isActive: websiteData.isActive || true,
      verificationToken: websiteData.verificationToken || '',
      settings: websiteData.settings || {
        allowedOrigins: [],
        trackingEnabled: true,
        dataRetentionDays: 365
      },
      stats: websiteData.stats || {
        totalPageviews: 0,
        uniqueVisitors: 0,
        averageSessionDuration: 0,
        bounceRate: 0
      }
    };
  } catch (error) {
    console.error('Error adding website: ', error);
    throw error;
  }
}

// Deletes a website by its ID.
export async function deleteWebsite(siteId: string, userId: string): Promise<void> {
  try {
    await api.delete(`/user/websites/${siteId}`, { data: { userId } });
  } catch (error) {
    console.error('Error deleting website:', error);
    throw error;
  }
}

// Gets a single website by its public siteId.
export async function getWebsiteBySiteId(siteId: string): Promise<Website | null> {
  if (!siteId) return null;
  try {
    const w: any = await api.get(`/user/websites/by-site-id/${siteId}`);
    return {
      id: w._id,
      siteId: w._id,
      name: w.name,
      url: w.url,
      userId: w.userId,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      isVerified: w.isVerified,
      isActive: w.isActive,
      verificationToken: w.verificationToken,
      settings: w.settings,
      stats: w.stats
    };
  } catch (error) {
    console.error('Error fetching website by siteId:', error);
    return null;
  }
}
