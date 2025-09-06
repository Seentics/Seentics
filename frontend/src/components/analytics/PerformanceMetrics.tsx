'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Clock, Smartphone, Monitor, Tablet, ChevronRight, TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceMetricsProps {
  data: any;
  isLoading: boolean;
  onViewMore: (type: string) => void;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ data, isLoading, onViewMore }) => {
  const performanceMetrics = data?.performance_metrics || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const avgLoadTime = performanceMetrics.avg_load_time || 0;
  const slowPages = performanceMetrics.slow_pages || 0;
  const devicePerformance = performanceMetrics.device_performance || [];
  const performanceScore = Math.max(0, 100 - (avgLoadTime / 100)); // Simple scoring

  // Calculate device-specific performance
  const mobilePerformance = devicePerformance.find((d: any) => d.device === 'Mobile')?.avg_load_time || 0;
  const desktopPerformance = devicePerformance.find((d: any) => d.device === 'Desktop')?.avg_load_time || 0;
  const tabletPerformance = devicePerformance.find((d: any) => d.device === 'Tablet')?.avg_load_time || 0;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Performance Score</CardTitle>
            <Zap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(performanceScore)}</div>
            <Progress value={performanceScore} className="mt-2" />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Out of 100</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Avg Load Time</CardTitle>
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {avgLoadTime > 0 ? `${Math.round(avgLoadTime)}ms` : '0ms'}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {avgLoadTime < 1000 ? 'Fast' : avgLoadTime < 3000 ? 'Moderate' : 'Slow'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Slow Pages</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{slowPages}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Need optimization</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Visits</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {devicePerformance.reduce((sum: number, device: any) => sum + (device.visits || 0), 0)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Across all devices</p>
          </CardContent>
        </Card>
      </div>

      {/* Device Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Device Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Mobile</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {mobilePerformance > 0 ? `${Math.round(mobilePerformance)}ms` : '0ms'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {devicePerformance.find((d: any) => d.device === 'Mobile')?.visits || 0} visits
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {desktopPerformance > 0 ? `${Math.round(desktopPerformance)}ms` : '0ms'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {devicePerformance.find((d: any) => d.device === 'Desktop')?.visits || 0} visits
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tablet className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Tablet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {tabletPerformance > 0 ? `${Math.round(tabletPerformance)}ms` : '0ms'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {devicePerformance.find((d: any) => d.device === 'Tablet')?.visits || 0} visits
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Fast Pages (&lt;1s)</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {avgLoadTime < 1000 ? 'Good' : 'Needs improvement'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Mobile Performance</span>
                <span className="font-medium text-gray-100">
                  {mobilePerformance < 2000 ? 'Optimized' : 'Needs work'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Core Web Vitals</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {performanceScore > 70 ? 'Good' : 'Needs optimization'}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => onViewMore('performance')}
            >
              View Detailed Performance
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 