import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { actionTypeChartConfig } from '@/lib/workflow-api';

interface ActionTypeData {
  actionType: string;
  count: number;
  successRate: number;
  avgExecutionTime?: number;
}

interface ActionTypeChartProps {
  data: ActionTypeData[];
  isLoading?: boolean;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

const ACTION_ICONS: Record<string, string> = {
  'Show Modal': '💬',
  'Track Event': '📊',
  'Send Email': '📧',
  'Add/Remove Tag': '🏷️',
  'Show Banner': '🚩',
  'Insert Section': '📝',
  'Execute JS': '⚙️',
  'Wait': '⏳',
  'Join': '🔗',
  'Branch Split': '🌿'
};

export function ActionTypeChart({ data, isLoading }: ActionTypeChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Type Performance</CardTitle>
          <CardDescription>Success rates and execution counts for different action types</CardDescription>
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
          <CardTitle>Action Type Performance</CardTitle>
          <CardDescription>Success rates and execution counts for different action types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">No action data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
    icon: ACTION_ICONS[item.actionType] || '❓',
    name: item.actionType.length > 15 ? `${item.actionType.substring(0, 15)}...` : item.actionType
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Type Performance</CardTitle>
        <CardDescription>Success rates and execution counts for different action types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ChartContainer className="h-full w-full" config={actionTypeChartConfig}>
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
                    dataKey="successRate" 
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                    name="Success Rate (%)"
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="count" 
                    fill="hsl(var(--chart-4))"
                    radius={[4, 4, 0, 0]}
                    name="Executions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground mb-4">Action Performance</div>
            {chartData.map((item, index) => (
              <div key={item.actionType} className="flex items-center justify-between p-3 rounded-lg bg-card">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.actionType}</div>
                    <div className="text-sm text-muted-foreground">{item.count} executions</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">{item.successRate}%</div>
                  <div 
                    className="w-16 h-2 bg-muted rounded-full overflow-hidden"
                    style={{ backgroundColor: 'hsl(var(--muted))' }}
                  >
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${item.successRate}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
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
