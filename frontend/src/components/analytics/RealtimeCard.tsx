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
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-foreground">
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
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-foreground">
          <Activity className="h-5 w-5 mr-2 text-green-500" />
          Live Activity
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-foreground">Active Users</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">{realtimeStats.active_users}</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-foreground">Current Visitors</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">{realtimeStats.current_visitors}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-foreground">Views (5m)</span>
            </div>
            <div className="text-xl font-semibold text-foreground">{realtimeStats.page_views_last_5m}</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium text-foreground">Views (1h)</span>
            </div>
            <div className="text-xl font-semibold text-foreground">{realtimeStats.page_views_last_1h}</div>
          </div>
        </div>

        {realtimeStats.top_pages_realtime && realtimeStats.top_pages_realtime.length > 0 ? (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3 text-foreground flex items-center">
              <Activity className="w-4 h-4 mr-2 text-green-500" />
              Active Pages
            </h4>
            <div className="space-y-2">
              {realtimeStats.top_pages_realtime.slice(0, 3).map((page: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-background rounded">
                  <div className="flex items-center min-w-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground truncate" title={getPathFromUrl(page.page)}>
                      {page.page === '/' ? 'Homepage' : truncatePath(getPathFromUrl(page.page), 40)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{page.views}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">No active pages currently</p>
            <p className="text-xs text-muted-foreground mt-1">Pages will appear here when visitors are active</p>
          </div>
        )}

        {/* Recent Custom Events */}
        {Array.isArray(realtimeStats.recent_events) && realtimeStats.recent_events.length > 0 && (
          <div className="mt-6 bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3 text-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
              Recent Events
            </h4>
            <div className="space-y-2">
              {realtimeStats.recent_events.slice(0, 5).map((evt: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-background rounded">
                  <div className="flex items-center min-w-0 gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 text-[10px] font-semibold">
                      {evt.event_type || 'custom'}
                    </span>
                    <span className="text-xs text-foreground truncate" title={evt.page}>{truncatePath(getPathFromUrl(evt.page || ''), 40)}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 