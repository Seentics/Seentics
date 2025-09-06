'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Minus, Users, Eye, Clock, TrendingDown, ChevronRight } from 'lucide-react';

interface DashboardData {
  total_visitors?: number;
  total_page_views?: number;
  avg_session_duration?: number;
  bounce_rate?: number;
  visitor_change?: number;
  pageview_change?: number;
  duration_change?: number;
  bounce_change?: number;
}

interface SummaryCardsProps {
  dashboardData?: DashboardData;
  className?: string;
}

const GrowthIndicator = ({ change }: { change?: number }) => {
  if (!change) {
    return <span className="text-muted-foreground text-sm flex items-center"><Minus className="h-3 w-3 mr-1" />No change</span>;
  }
  
  const isPositive = change > 0;
  return (
    <div className={`flex items-center text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
      <span>{Math.abs(change).toFixed(1)}%</span>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
  isLoading = false,
}: {
  title: string;
  value: number;
  change?: number;
  icon: any;
  format?: 'number' | 'percentage' | 'duration';
  isLoading?: boolean;
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'duration':
        if (val <= 0) return '0s';
        const minutes = Math.floor(val / 60);
        const seconds = Math.floor(val % 60);
        if (minutes > 0) {
          return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
      default:
        if (val >= 1000000) {
          return (val / 1000000).toFixed(1) + 'M';
        }
        if (val >= 1000) {
          return (val / 1000).toFixed(1) + 'K';
        }
        return val.toString();
    }
  };

  if (isLoading) {
    return (
      <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground/90">{title}</CardTitle>
          <div className="flex items-center gap-1">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-foreground/90 truncate pr-2">{title}</CardTitle>
        <div className="flex items-center gap-1">
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          <ChevronRight className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{formatValue(value)}</div>
        <GrowthIndicator change={change} />
        {format === 'duration' && (
          <div className="text-xs text-muted-foreground">Raw: {value}s</div>
        )}
      </CardContent>
    </Card>
  );
};

export function SummaryCards({ dashboardData, className = '' }: SummaryCardsProps) {
  return (
    <div className={`grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4 ${className}`}>
      <SummaryCard
        title="Total Visitors"
        value={dashboardData?.total_visitors || 0}
        change={dashboardData?.visitor_change}
        icon={Users}
        isLoading={false}
      />
      <SummaryCard
        title="Page Views"
        value={dashboardData?.total_page_views || 0}
        change={dashboardData?.pageview_change}
        icon={Eye}
        isLoading={false}
      />
      <SummaryCard
        title="Session Duration"
        value={dashboardData?.avg_session_duration || 0}
        change={dashboardData?.duration_change}
        icon={Clock}
        format="duration"
        isLoading={false}
      />
      <SummaryCard
        title="Bounce Rate"
        value={dashboardData?.bounce_rate || 0}
        change={dashboardData?.bounce_change}
        icon={TrendingDown}
        format="percentage"
        isLoading={false}
      />
    </div>
  );
} 