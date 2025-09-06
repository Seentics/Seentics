import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { nodePerformanceChartConfig } from '@/lib/workflow-api';

interface NodePerformance {
  nodeId: string;
  nodeTitle: string;
  triggers: number;
  executions: number;
  performance: number;
}

interface NodePerformanceChartProps {
  data: NodePerformance[];
  isLoading?: boolean;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function NodePerformanceChart({ data, isLoading }: NodePerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Node Performance</CardTitle>
          <CardDescription>Performance metrics for each workflow node</CardDescription>
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
          <CardTitle>Node Performance</CardTitle>
          <CardDescription>Performance metrics for each workflow node</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">No performance data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((node, index) => ({
    ...node,
    color: COLORS[index % COLORS.length],
    name: node.nodeTitle.length > 20 ? `${node.nodeTitle.substring(0, 20)}...` : node.nodeTitle
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Node Performance</CardTitle>
        <CardDescription>Success rate and execution counts for each workflow node</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[300px] w-full" config={nodePerformanceChartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                stroke="hsl(var(--chart-2))"
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--chart-4))"
              />
              <ChartTooltip 
                cursor={false}
                content={<ChartTooltipContent indicator="bar" />} 
              />
              <Bar 
                yAxisId="left"
                dataKey="performance" 
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
                name="Success Rate (%)"
              />
              <Bar 
                yAxisId="right"
                dataKey="executions" 
                fill="hsl(var(--chart-4))"
                radius={[4, 4, 0, 0]}
                name="Executions"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
            <span>Success Rate (%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-4))]" />
            <span>Executions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
