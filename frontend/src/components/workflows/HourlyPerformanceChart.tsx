import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { hourlyChartConfig } from '@/lib/workflow-api';

interface HourlyData {
  hour: number;
  triggers: number;
  completions: number;
  completionRate: number;
}

interface HourlyPerformanceChartProps {
  data: HourlyData[];
  isLoading?: boolean;
}

export function HourlyPerformanceChart({ data, isLoading }: HourlyPerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hourly Performance</CardTitle>
          <CardDescription>Workflow activity patterns throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hourly Performance</CardTitle>
          <CardDescription>Workflow activity patterns throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">No hourly data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    time: `${item.hour}:00`,
    hourLabel: item.hour === 0 ? '12 AM' : 
               item.hour === 12 ? '12 PM' : 
               item.hour > 12 ? `${item.hour - 12} PM` : `${item.hour} AM`
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Performance</CardTitle>
        <CardDescription>Workflow activity patterns throughout the day</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[300px] w-full" config={hourlyChartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="fillTriggers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fillCompletions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="hourLabel" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                stroke="hsl(var(--chart-2))"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--chart-4))"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip 
                cursor={false}
                content={<ChartTooltipContent indicator="line" />} 
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="triggers"
                stroke="hsl(var(--chart-2))"
                fill="url(#fillTriggers)"
                name="Triggers"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="completions"
                stroke="hsl(var(--chart-4))"
                fill="url(#fillCompletions)"
                name="Completions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="mt-4 flex justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
            <span>Triggers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-4))]" />
            <span>Completions</span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">
              {Math.max(...chartData.map(d => d.triggers))}
            </div>
            <div className="text-sm text-muted-foreground">Peak Triggers/Hour</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">
              {Math.max(...chartData.map(d => d.completionRate)).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Peak Completion Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
