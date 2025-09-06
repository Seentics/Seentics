'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number;
  dropOff: number;
}

interface FunnelChartProps {
  title: string;
  steps: FunnelStep[];
  totalVisitors: number;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ 
  title, 
  steps, 
  totalVisitors 
}) => {
  const maxCount = Math.max(...steps.map(step => step.count));

  // Function to get distinct vibrant colors for each step
  const getStepColor = (index: number): string => {
    const colors = [
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#10B981', // Green
      '#F59E0B', // Orange
      '#EC4899', // Pink
      '#06B6D4', // Teal
      '#84CC16', // Lime
      '#F97316', // Red-Orange
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center justify-between">
          {title}
          <Badge variant="secondary" className="text-xs">
            {totalVisitors.toLocaleString()} total visitors
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const widthPercentage = (step.count / maxCount) * 100;
            const isFirst = index === 0;
            
            return (
              <div key={step.name} className="relative">
                {/* Step Label and Metrics */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center text-white font-semibold"
                         style={{ backgroundColor: getStepColor(index) }}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm text-foreground">{step.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-muted-foreground">
                      {step.count.toLocaleString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {step.conversionRate.toFixed(1)}%
                    </Badge>
                    {!isFirst && (
                      <div className="flex items-center space-x-1">
                        {step.dropOff > 0 ? (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        ) : (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        )}
                        <span className={`text-xs ${
                          step.dropOff > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {step.dropOff > 0 ? '-' : '+'}{Math.abs(step.dropOff).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Funnel Bar */}
                <div className="relative">
                  <div className="h-6 bg-muted rounded-lg overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${widthPercentage}%`,
                        backgroundColor: getStepColor(index)
                      }}
                    />
                  </div>
                  
                  {/* Width indicator */}
                  <div className="absolute top-0 right-0 h-full flex items-center pr-2">
                    <span className="text-xs text-white font-medium">
                      {widthPercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Drop-off indicator */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center mt-2">
                    <div className="w-px h-3 bg-border"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">
                {steps[steps.length - 1]?.count.toLocaleString() || 0}
              </div>
              <div className="text-xs text-muted-foreground">Final Conversions</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {((steps[steps.length - 1]?.count || 0) / totalVisitors * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Overall Conversion</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-600">
                {(() => {
                  const totalDropOff = steps.reduce((acc, step, index) => {
                    if (index === 0) return acc;
                    return acc + Math.abs(step.dropOff);
                  }, 0);
                  return totalDropOff.toFixed(1);
                })()}%
              </div>
              <div className="text-xs text-muted-foreground">Total Drop-off</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
