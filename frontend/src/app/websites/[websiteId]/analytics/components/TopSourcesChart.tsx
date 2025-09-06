'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/analytics-api';
import { Globe, ExternalLink, Share2, Mail, MessageSquare, Facebook, Twitter, Linkedin, ChevronRight, Home } from 'lucide-react';

interface TopSourcesChartProps {
  data: any;
  utmData?: any;
  isLoading: boolean;
  onViewMore?: () => void;
  showHeader?: boolean;
}

const getSourceIcon = (source: string, isUTM?: boolean) => {
  // UTM sources get special treatment
  if (isUTM) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
        <Share2 className="w-5 h-5 text-white" />
      </div>
    );
  }
  
  const lowerSource = source.toLowerCase();
  
  // Google
  if (lowerSource.includes('google')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
    );
  }
  
  // Facebook
  if (lowerSource.includes('facebook')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
        <Facebook className="w-5 h-5 text-white" />
      </div>
    );
  }
  
  // Twitter
  if (lowerSource.includes('twitter')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
        <Twitter className="w-5 h-5 text-white" />
      </div>
    );
  }
  
  // LinkedIn
  if (lowerSource.includes('linkedin')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg flex items-center justify-center shadow-sm">
        <Linkedin className="w-5 h-5 text-white" />
      </div>
    );
  }
  
  // Email
  if (lowerSource.includes('email')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center shadow-sm">
        <Mail className="w-5 h-5 text-white" />
      </div>
    );
  }
  
  // Direct
  if (lowerSource.includes('direct')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center shadow-sm">
        <ExternalLink className="w-5 h-5 text-white" />
      </div>
    );
  }

  // Internal Navigation
          if (lowerSource.includes('internal') || lowerSource.includes('localhost') || lowerSource.includes('127.0.0.1')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
        <Home className="w-5 h-5 text-white" />
      </div>
    );
  }
  
  // Default
  return (
    <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center shadow-sm">
      <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </div>
  );
};

export const TopSourcesChart: React.FC<TopSourcesChartProps> = ({ data, utmData, isLoading, onViewMore, showHeader = false }) => {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const chartData = data?.top_referrers || [];
  const utmSources = utmData?.sources || [];
  
  // Create a comprehensive deduplication system
  const sourceMap = new Map();
  
  // Process referrer data first
  chartData.forEach((ref: any) => {
    const referrer = ref.referrer || '';
    
    // Check if this referrer contains UTM parameters
    if (referrer.includes('utm_source=')) {
      try {
        const url = new URL(referrer);
        const utmSource = url.searchParams.get('utm_source');
        if (utmSource) {
          // This is a UTM referrer - extract the base referrer and UTM source
          const baseReferrer = url.origin + url.pathname;
          const sourceKey = `utm_${utmSource.toLowerCase()}`;
          
          if (sourceMap.has(sourceKey)) {
            // Merge with existing UTM source
            const existing = sourceMap.get(sourceKey);
            existing.views += ref.views || 0;
            existing.unique += ref.unique || 0;
            existing.isUTM = true;
            existing.utmSource = utmSource;
            existing.referrer = `UTM: ${utmSource}`;
            existing.baseReferrer = baseReferrer;
          } else {
            // Create new UTM source entry
            sourceMap.set(sourceKey, {
              referrer: `UTM: ${utmSource}`,
              views: ref.views || 0,
              unique: ref.unique || 0,
              isUTM: true,
              utmSource: utmSource,
              baseReferrer: baseReferrer
            });
          }
          return; // Skip further processing for this referrer
        }
      } catch (e) {
        // Invalid URL, treat as regular referrer
      }
    }
    
    // Handle regular referrers (non-UTM)
    let sourceKey = referrer.toLowerCase();
    let displayName = referrer;
    
    // Normalize common referrers
    if (referrer.includes('google.com') || referrer.includes('Google')) {
      sourceKey = 'google';
      displayName = 'Google';
    } else if (referrer.includes('facebook.com') || referrer.includes('Facebook')) {
      sourceKey = 'facebook';
      displayName = 'Facebook';
    } else if (referrer === 'direct' || referrer === 'Direct') {
      sourceKey = 'direct';
      displayName = 'Direct Traffic';
    } else if (referrer.includes('mail.google.com') || referrer.includes('accounts.google.com')) {
      sourceKey = 'google';
      displayName = 'Google (Email/Accounts)';
    }
    
    if (sourceMap.has(sourceKey)) {
      // Merge with existing source
      const existing = sourceMap.get(sourceKey);
      existing.views += ref.views || 0;
      existing.unique += ref.unique || 0;
    } else {
      // Create new source entry
      sourceMap.set(sourceKey, {
        referrer: displayName,
        views: ref.views || 0,
        unique: ref.unique || 0,
        isUTM: false,
        utmSource: null,
        baseReferrer: referrer
      });
    }
  });
  
  // Now add UTM analytics data, but only if not already present
  utmSources.forEach((utmSource: any) => {
    if (utmSource.source && utmSource.visits > 0) {
      const sourceKey = `utm_${utmSource.source.toLowerCase()}`;
      
      if (sourceMap.has(sourceKey)) {
        // Update existing UTM source with analytics data
        const existing = sourceMap.get(sourceKey);
        existing.views = Math.max(existing.views, utmSource.visits);
        existing.unique = Math.max(existing.unique, utmSource.unique_visitors || 0);
      } else {
        // Add new UTM source from analytics
        sourceMap.set(sourceKey, {
          referrer: `UTM: ${utmSource.source}`,
          views: utmSource.visits,
          unique: utmSource.unique_visitors || 0,
          isUTM: true,
          utmSource: utmSource.source,
          baseReferrer: null
        });
      }
    }
  });
  
  // Convert map to array and sort by views
  const sortedData = Array.from(sourceMap.values())
    .filter((item: any) => (item.views || 0) > 0)
    .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
  
  const totalViews = sortedData.reduce((sum: number, item: any) => sum + (item.views || 0), 0);

  if (sortedData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No traffic sources or UTM data available for this period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 min-h-[16rem]">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Top Sources</h3>
        </div>
      )}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {sortedData.map((item: any, index: number) => {
        const percentage = ((item.views / totalViews) * 100).toFixed(1);
        
        return (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {getSourceIcon(item.referrer || item.source, item.isUTM)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate text-gray-900 dark:text-gray-100" title={item.referrer || item.source}>
                  {item.referrer || item.source}
                  {item.isUTM && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      UTM
                    </span>
                  )}
                </div>
                {item.baseReferrer && item.baseReferrer !== item.referrer && (
                  <div className="text-xs text-muted-foreground truncate" title={item.baseReferrer}>
                    {item.baseReferrer}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{formatNumber(item.views)}</div>
              <div className="text-muted-foreground text-xs">{percentage}%</div>
            </div>
          </div>
        );
      })}
      </div>
      {onViewMore && sortedData.length >= 5 && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewMore}
            className="w-full text-xs"
          >
            View More Sources
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}; 