'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Clock, Smartphone, Monitor, Tablet, ChevronRight, TrendingUp, AlertTriangle, Activity, Move } from 'lucide-react';

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
  const avgLCP = performanceMetrics.avg_lcp || 0;
  const avgCLS = performanceMetrics.avg_cls || 0;
  const avgFID = performanceMetrics.avg_fid || 0;
  const slowPages = performanceMetrics.slow_pages || 0;
  const devicePerformance = performanceMetrics.device_performance || [];
  const coreWebVitals = performanceMetrics.core_web_vitals || {};

  // Calculate performance scores
  const loadTimeScore = Math.max(0, 100 - (avgLoadTime / 50)); // 0ms = 100, 5000ms = 0
  const lcpScore = avgLCP <= 2500 ? 100 : avgLCP <= 4000 ? 50 : 0;
  const clsScore = avgCLS <= 0.1 ? 100 : avgCLS <= 0.25 ? 50 : 0;
  const fidScore = avgFID <= 100 ? 100 : avgFID <= 300 ? 50 : 0;

  // Overall performance score
  const overallScore = Math.round((loadTimeScore + lcpScore + clsScore + fidScore) / 4);

  // Calculate device-specific performance
  const mobilePerformance = devicePerformance.find((d: any) => d.device === 'Mobile')?.avg_load_time || 0;
  const desktopPerformance = devicePerformance.find((d: any) => d.device === 'Desktop')?.avg_load_time || 0;
  const tabletPerformance = devicePerformance.find((d: any) => d.device === 'Tablet')?.avg_load_time || 0;

  // Helper function to get performance color
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Helper function to get performance status
  const getPerformanceStatus = (score: number) => {
    if (score >= 80) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Overall Performance</CardTitle>
            <Zap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(overallScore)}`}>{overallScore}</div>
            <Progress value={overallScore} className="mt-2" />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{getPerformanceStatus(overallScore)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Avg Load Time</CardTitle>
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(loadTimeScore)}`}>
              {avgLoadTime > 0 ? `${Math.round(avgLoadTime)}ms` : '0ms'}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {avgLoadTime < 1000 ? 'Fast' : avgLoadTime < 3000 ? 'Moderate' : 'Slow'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">LCP (Largest Contentful Paint)</CardTitle>
            <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(lcpScore)}`}>
              {avgLCP > 0 ? `${Math.round(avgLCP)}ms` : '0ms'}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {avgLCP <= 2500 ? 'Good' : avgLCP <= 4000 ? 'Needs Improvement' : 'Poor'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">CLS (Cumulative Layout Shift)</CardTitle>
            <Move className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(clsScore)}`}>
              {avgCLS > 0 ? avgCLS.toFixed(3) : '0.000'}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {avgCLS <= 0.1 ? 'Good' : avgCLS <= 0.25 ? 'Needs Improvement' : 'Poor'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals Breakdown */}
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">Core Web Vitals Breakdown</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">Performance distribution across your website</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LCP Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">LCP Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 dark:text-green-400">Good (≤2.5s)</span>
                  <span className="text-sm font-medium">{coreWebVitals.lcp?.good || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">Needs Improvement (2.5-4s)</span>
                  <span className="text-sm font-medium">{coreWebVitals.lcp?.needs_improvement || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600 dark:text-red-400">Poor (>4s)</span>
                  <span className="text-sm font-medium">{coreWebVitals.lcp?.poor || 0}</span>
                </div>
              </div>
            </div>

            {/* CLS Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">CLS Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 dark:text-green-400">Good (≤0.1)</span>
                  <span className="text-sm font-medium">{coreWebVitals.cls?.good || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">Needs Improvement (0.1-0.25)</span>
                  <span className="text-sm font-medium">{coreWebVitals.cls?.needs_improvement || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600 dark:text-red-400">Poor (>0.25)</span>
                  <span className="text-sm font-medium">{coreWebVitals.cls?.poor || 0}</span>
                </div>
              </div>
            </div>

            {/* FID Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">FID Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 dark:text-green-400">Good (≤100ms)</span>
                  <span className="text-sm font-medium">{coreWebVitals.fid?.good || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">Needs Improvement (100-300ms)</span>
                  <span className="text-sm font-medium">{coreWebVitals.fid?.needs_improvement || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600 dark:text-red-400">Poor (>300ms)</span>
                  <span className="text-sm font-medium">{coreWebVitals.fid?.poor || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Performance */}
      {devicePerformance.length > 0 && (
        <Card className="bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">Device Performance</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Load times by device type</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {devicePerformance.map((device: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{device.device}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{device.visits} visits</div>
                  </div>
                  <div className={`text-lg font-bold ${getPerformanceColor(Math.max(0, 100 - (device.avg_load_time / 50)))}`}>
                    {Math.round(device.avg_load_time)}ms
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Issues */}
      {slowPages > 0 && (
        <Card className="bg-card shadow-sm border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-red-800 dark:text-red-200">Performance Issues</CardTitle>
            <p className="text-sm text-red-600 dark:text-red-400">Pages that need attention</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-200">
                {slowPages} page{slowPages !== 1 ? 's' : ''} with load time > 3 seconds
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 