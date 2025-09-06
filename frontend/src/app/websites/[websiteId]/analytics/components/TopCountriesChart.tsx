'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/analytics-api';

interface TopCountriesChartProps {
  data: any;
  isLoading: boolean;
  onViewMore?: () => void;
  showHeader?: boolean;
}

const getFlag = (countryCode: string) => {
  const flags: { [key: string]: string } = {
    'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
    'AU': '🇦🇺', 'IN': '🇮🇳', 'BR': '🇧🇷', 'CN': '🇨🇳', 'JP': '🇯🇵',
    'RU': '🇷🇺', 'ES': '🇪🇸', 'IT': '🇮🇹', 'MX': '🇲🇽', 'ZA': '🇿🇦',
    'UNKNOWN': '🌐'
  };
  return flags[countryCode?.toUpperCase()] || flags['UNKNOWN'];
};

export const TopCountriesChart: React.FC<TopCountriesChartProps> = ({ data, isLoading, showHeader = false }) => {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const countries = data?.top_countries || [];
  const filteredCountries = countries.filter((c: any) => c.views > 0);
  const sortedCountries = [...filteredCountries].sort((a: any, b: any) => b.views - a.views).slice(0, 7);
  const totalViews = sortedCountries.reduce((sum: number, c: any) => sum + c.views, 0);

  if (sortedCountries.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">🌐</div>
          <p className="text-sm font-medium">No country data available</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Countries will appear here once visitors start browsing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Top Countries</h3>
        </div>
      )}
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(totalViews)}</div>
          <div className="text-xs text-muted-foreground">Total Views</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{sortedCountries.length}</div>
          <div className="text-xs text-muted-foreground">Countries</div>
        </div>
      </div>

      {/* Countries List */}
      <div className="space-y-2">
        {sortedCountries.map((country: any, index: number) => {
          const percentage = ((country.views / totalViews) * 100).toFixed(1);
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 text-2xl">
                  {getFlag(country.country)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate text-gray-900 dark:text-gray-100" title={country.country}>{country.country}</div>
                  <div className="text-xs text-muted-foreground truncate" title={country.country}>{country.country}</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{formatNumber(country.views)}</div>
                <div className="text-muted-foreground text-xs">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 