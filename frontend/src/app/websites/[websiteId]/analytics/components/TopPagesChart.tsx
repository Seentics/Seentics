'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/analytics-api';
import { FileText, Home, Globe, ChevronRight } from 'lucide-react';

interface TopPagesChartProps {
  data: any;
  isLoading: boolean;
  onViewMore?: () => void;
  showHeader?: boolean;
}

const getPageIcon = (page: string) => {
  if (page === '/') {
    return <Home className="w-4 h-4 text-blue-500" />;
  }
  if (page.includes('/blog') || page.includes('/post')) {
    return <FileText className="w-4 h-4 text-green-500" />;
  }
  return <Globe className="w-4 h-4 text-purple-500" />;
};

const getPageName = (page: string) => {
  // Extract path from URL if it's a full URL
  const path = getPathFromUrl(page);
  
  if (path === '/') return 'Homepage';
  if (path === '/about') return 'About';
  if (path === '/contact') return 'Contact';
  if (path === '/pricing') return 'Pricing';
  if (path === '/products') return 'Products';
  if (path === '/blog') return 'Blog';
  if (path.startsWith('/blog/')) return 'Blog Post';
  if (path.startsWith('/product/')) return 'Product Page';
  if (path.startsWith('/auth/')) return 'Auth Page';
  if (path.includes('callback')) return 'OAuth Callback';
  return path;
};

const getPathFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // If not a valid URL, try to extract path from string
    if (url.startsWith('http')) {
      const pathMatch = url.match(/https?:\/\/[^\/]+(\/.*)/);
      return pathMatch ? pathMatch[1] : url;
    }
    return url;
  }
};

const truncatePath = (path: string, maxLength: number = 40) => {
  if (path.length <= maxLength) return path;
  return path.substring(0, maxLength - 3) + '...';
};

export const TopPagesChart: React.FC<TopPagesChartProps> = ({ data, isLoading, onViewMore, showHeader = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="w-32 h-4" />
              </div>
              <Skeleton className="w-16 h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const chartData = data?.top_pages || [];
  const filteredData = chartData.filter((item: any) => (item.views || 0) > 0);
  const sortedData = [...filteredData].sort((a: any, b: any) => b.views - a.views).slice(0, 5);
  const totalViews = sortedData.reduce((sum: number, item: any) => sum + item.views, 0);

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground py-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium">No page data available</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Pages will appear here once visitors start browsing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {showHeader && (
          <div>
            <h3 className="text-lg font-semibold text-foreground">Top Pages</h3>
            <p className="text-sm text-muted-foreground">Most visited pages on your site</p>
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {sortedData.map((item: any, index: number) => {
          const pageName = getPageName(item.page);
          const percentage = ((item.views / totalViews) * 100).toFixed(1);
          const isHomepage = item.page === '/';
          
          return (
            <div 
              key={index} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                isHomepage 
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getPageIcon(item.page)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium text-sm truncate ${
                    isHomepage 
                      ? 'text-blue-900 dark:text-blue-100' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`} title={pageName}>
                    {pageName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate" title={getPathFromUrl(item.page)}>
                    {truncatePath(getPathFromUrl(item.page))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-right">
                <div className="text-right">
                  <div className={`font-bold text-lg ${
                    isHomepage 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {formatNumber(item.views)}
                  </div>
                  <div className="text-xs text-muted-foreground">{percentage}%</div>
                </div>
                
                {/* Progress bar */}
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      isHomepage 
                        ? 'bg-blue-500' 
                        : 'bg-gray-400 dark:bg-gray-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* View All Button */}
      {filteredData.length > 5 && onViewMore && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={onViewMore}
          >
            View All Pages ({filteredData.length})
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}; 