'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Users, Eye, Clock, TrendingUp } from 'lucide-react';
import { formatNumber } from '@/lib/analytics-api';

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

const truncatePath = (path: string, maxLength: number = 30) => {
  if (path.length <= maxLength) return path;
  return path.substring(0, maxLength - 3) + '...';
};

interface RealtimeCardProps {
  data: any;
  isLoading: boolean;
}

export const RealtimeCard: React.FC<RealtimeCardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="border-2 border-dashed border-green-200 dark:border-green-800 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-gray-900 dark:text-gray-100">
            <Activity className="h-5 w-5 mr-2 text-green-500" />
            Live Activity
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const realtimeStats = data || {
    active_users: 0,
    current_visitors: 0,
    page_views_last_5m: 0,
    page_views_last_1h: 0,
    top_pages_realtime: []
  };

  return (
    <Card className="border-2 border-dashed border-green-200 dark:border-green-800 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-gray-900 dark:text-gray-100">
          <Activity className="h-5 w-5 mr-2 text-green-500" />
          Live Activity
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center p-4 bg-card rounded-xl shadow-sm border border-green-100 dark:border-green-900">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Active Users</span>
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{realtimeStats.active_users}</div>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-sm border border-blue-100 dark:border-blue-900">
            <div className="flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Current Visitors</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{realtimeStats.current_visitors}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center p-4 bg-card rounded-xl shadow-sm border border-orange-100 dark:border-orange-900">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Views (5m)</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{realtimeStats.page_views_last_5m}</div>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-sm border border-purple-100 dark:border-purple-900">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Views (1h)</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{realtimeStats.page_views_last_1h}</div>
          </div>
        </div>

        {realtimeStats.top_pages_realtime && realtimeStats.top_pages_realtime.length > 0 ? (
          <div className="bg-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-green-500" />
              Active Pages
            </h4>
            <div className="space-y-3">
              {realtimeStats.top_pages_realtime.slice(0, 3).map((page: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center min-w-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={getPathFromUrl(page.page)}>
                      {page.page === '/' ? 'Homepage' : truncatePath(getPathFromUrl(page.page), 40)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">{page.views}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No active pages currently</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Pages will appear here when visitors are active</p>
          </div>
        )}

        {/* Recent Custom Events */}
        {Array.isArray(realtimeStats.recent_events) && realtimeStats.recent_events.length > 0 && (
          <div className="mt-6 bg-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
              Recent Events
            </h4>
            <div className="space-y-3">
              {realtimeStats.recent_events.slice(0, 5).map((evt: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center min-w-0 gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 text-[10px] font-semibold">
                      {evt.event_type || 'custom'}
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-200 truncate" title={evt.page}>{truncatePath(getPathFromUrl(evt.page || ''), 40)}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 