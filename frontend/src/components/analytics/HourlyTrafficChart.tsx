'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '@/lib/analytics-api';

interface HourlyTrafficChartProps {
  data: { hourly_stats?: Array<{ hour: number; views: number; unique: number }> } | undefined;
  isLoading: boolean;
}

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  padding: '12px',
};

export const HourlyTrafficChart: React.FC<HourlyTrafficChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const rows = data?.hourly_stats || [];
  if (rows.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No hourly traffic data available</p>
        </div>
      </div>
    );
  }

  const chartData = rows.map((r) => ({
    hour: r.hour,
    views: r.views,
    unique: r.unique,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="hour"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(h) => `${h}:00`}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(v) => formatNumber(v)}
          />
          <Tooltip
            contentStyle={tooltipStyle as any}
            formatter={(value: any, name: string) => [formatNumber(value), name === 'views' ? 'Page Views' : 'Unique']}
            labelFormatter={(h) => `Hour: ${h}:00`}
          />
          <Bar dataKey="views" name="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="unique" name="unique" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HourlyTrafficChart;


