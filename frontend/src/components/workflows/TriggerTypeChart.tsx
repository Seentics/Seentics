import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { triggerTypeChartConfig } from '@/lib/workflow-api';

interface TriggerTypeData {
  triggerType: string;
  count: number;
  percentage: number;
}

interface TriggerTypeChartProps {
  data: TriggerTypeData[];
  isLoading?: boolean;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))'
];

const TRIGGER_ICONS: Record<string, string> = {
  'Page View': '👁️',
  'Time Spent': '⏱️',
  'Scroll Depth': '📜',
  'Exit Intent': '🚪',
  'Element Click': '🖱️',
  'Inactivity': '😴',
  'Custom Event': '⚡'
};

export function TriggerTypeChart({ data, isLoading }: TriggerTypeChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trigger Type Distribution</CardTitle>
          <CardDescription>Breakdown of workflow triggers by type</CardDescription>
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
          <CardTitle>Trigger Type Distribution</CardTitle>
          <CardDescription>Breakdown of workflow triggers by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">No trigger data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
    icon: TRIGGER_ICONS[item.triggerType] || '❓'
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger Type Distribution</CardTitle>
        <CardDescription>Breakdown of workflow triggers by type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ChartContainer className="h-full w-full" config={triggerTypeChartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ triggerType, percentage }) => `${triggerType}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent indicator="circle" />} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground mb-4">Trigger Breakdown</div>
            {chartData.map((item, index) => (
              <div key={item.triggerType} className="flex items-center justify-between p-3 rounded-lg bg-card">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.triggerType}</div>
                    <div className="text-sm text-muted-foreground">{item.count} triggers</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">{item.percentage}%</div>
                  <div 
                    className="w-16 h-2 bg-muted rounded-full overflow-hidden"
                    style={{ backgroundColor: 'hsl(var(--muted))' }}
                  >
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
