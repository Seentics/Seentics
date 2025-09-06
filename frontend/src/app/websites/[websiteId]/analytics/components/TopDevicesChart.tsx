'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/analytics-api';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface TopDevicesChartProps {
  data: any;
  isLoading: boolean;
  onViewMore?: () => void;
  showHeader?: boolean;
}

const getDeviceIcon = (device: string) => {
  const lowerDevice = device.toLowerCase();
  
  // Mobile
  if (lowerDevice.includes('mobile')) {
    return (
      <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
        <Smartphone className="w-4 h-4 text-white" />
      </div>
    );
  }
  
  // Tablet
  if (lowerDevice.includes('tablet')) {
    return (
      <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
        <Tablet className="w-4 h-4 text-white" />
      </div>
    );
  }
  
  // Desktop
  if (lowerDevice.includes('desktop')) {
    return (
      <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
        <Monitor className="w-4 h-4 text-white" />
      </div>
    );
  }
  
  // Default
  return (
    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded flex items-center justify-center">
      <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-300" />
    </div>
  );
};

const getDeviceName = (device: string) => {
  const lowerDevice = device.toLowerCase();
  if (lowerDevice.includes('mobile')) return 'Mobile';
  if (lowerDevice.includes('tablet')) return 'Tablet';
  if (lowerDevice.includes('desktop')) return 'Desktop';
  return device;
};

export const TopDevicesChart: React.FC<TopDevicesChartProps> = ({ data, isLoading, showHeader = false }) => {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const chartData = data?.top_devices || [];
  const filteredData = chartData.filter((item: any) => (item.views || 0) > 0);
  const sortedData = [...filteredData].sort((a: any, b: any) => b.views - a.views).slice(0, 7);
  const totalViews = sortedData.reduce((sum: number, item: any) => sum + item.views, 0);

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground py-12">
        <div className="text-center">
          <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium">No device data available</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Device data will appear here once visitors start browsing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Top Devices</h3>
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
          <div className="text-xs text-muted-foreground">Devices</div>
        </div>
      </div>

      {/* Devices List */}
      <div className="space-y-2">
        {sortedData.map((item: any, index: number) => {
          const deviceName = getDeviceName(item.device);
          const percentage = ((item.views / totalViews) * 100).toFixed(1);
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getDeviceIcon(item.device)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate text-gray-900 dark:text-gray-100" title={deviceName}>{deviceName}</div>
                  <div className="text-xs text-muted-foreground truncate" title={item.device}>{item.device}</div>
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