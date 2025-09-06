'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/analytics-api';
import { Monitor } from 'lucide-react';

interface TopBrowsersChartProps {
  data: any;
  isLoading: boolean;
  onViewMore?: () => void;
  showHeader?: boolean;
}

const getBrowserIcon = (browser: string) => {
  const lowerBrowser = browser.toLowerCase();
  
  // Chrome
  if (lowerBrowser.includes('chrome')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C8.21 0 4.67 1.92 2.25 4.9l4.51 7.8L12 12l5.24 0.7 4.51-7.8C19.33 1.92 15.79 0 12 0zM12 12l-5.24-0.7L2.25 19.1C4.67 22.08 8.21 24 12 24c3.79 0 7.33-1.92 9.75-4.9L17.24 11.3 12 12z"/>
        </svg>
      </div>
    );
  }
  
  // Firefox
  if (lowerBrowser.includes('firefox')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-1-6h2v2h-2v-2zm0-8h2v6h-2V8z"/>
        </svg>
      </div>
    );
  }
  
  // Safari
  if (lowerBrowser.includes('safari')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
    );
  }
  
  // Edge
  if (lowerBrowser.includes('edge')) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
    );
  }
  
  // Default
  return (
    <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center shadow-sm">
      <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </div>
  );
};

const getBrowserName = (browser: string) => {
  const lowerBrowser = browser.toLowerCase();
  if (lowerBrowser.includes('chrome')) return 'Chrome';
  if (lowerBrowser.includes('firefox')) return 'Firefox';
  if (lowerBrowser.includes('safari')) return 'Safari';
  if (lowerBrowser.includes('edge')) return 'Edge';
  return browser;
};

export const TopBrowsersChart: React.FC<TopBrowsersChartProps> = ({ data, isLoading, showHeader = false }) => {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const chartData = data?.top_browsers || [];
  const filteredData = chartData.filter((item: any) => (item.views || 0) > 0);
  const sortedData = [...filteredData].sort((a: any, b: any) => b.views - a.views).slice(0, 7);
  const totalViews = sortedData.reduce((sum: number, item: any) => sum + item.views, 0);

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground py-12">
        <div className="text-center">
          <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium">No browser data available</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Browser data will appear here once visitors start browsing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Top Browsers</h3>
        </div>
      )}
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(totalViews)}</div>
          <div className="text-xs text-muted-foreground">Total Views</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{sortedData.length}</div>
          <div className="text-xs text-muted-foreground">Browsers</div>
        </div>
      </div>

      {/* Browsers List */}
      <div className="space-y-2">
        {sortedData.map((item: any, index: number) => {
          const browserName = getBrowserName(item.browser);
          const percentage = ((item.views / totalViews) * 100).toFixed(1);
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getBrowserIcon(item.browser)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate text-gray-900 dark:text-gray-100" title={browserName}>{browserName}</div>
                  <div className="text-xs text-muted-foreground truncate" title={item.browser}>{item.browser}</div>
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
    </div>
  );
}; 