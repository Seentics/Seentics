'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UTMPerformanceChartProps {
  data: any;
  isLoading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const UTMPerformanceChart: React.FC<UTMPerformanceChartProps> = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const utm = data?.utm_performance || {};
  const sources = Array.isArray(utm.sources)
    ? utm.sources
    : Object.entries(utm.sources || {}).map(([source, visits]) => ({ source, visits: Number(visits) }));

  const pieData = sources
    .filter((s: any) => (s.visits || 0) > 0)
    .sort((a: any, b: any) => b.visits - a.visits)
    .slice(0, 6)
    .map((s: any) => ({ name: s.source, value: s.visits }));

  if (pieData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No UTM performance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
            {pieData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any, name: any) => [value, name]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {pieData.map((s: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-muted-foreground">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UTMPerformanceChart;


