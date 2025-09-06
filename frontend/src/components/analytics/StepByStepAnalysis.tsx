'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface StepAnalytics {
  step_id: string;
  step_name: string;
  step_order: number;
  visitors_reached: number;
  conversion_rate: number;
  drop_off_rate: number;
  avg_time_on_step?: number;
}

interface StepByStepAnalysisProps {
  stepAnalytics: StepAnalytics[];
  totalVisitors: number;
}

// Helper function to format time with proper precision
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00.00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const wholeSeconds = Math.floor(remainingSeconds);
  const milliseconds = Math.round((remainingSeconds - wholeSeconds) * 100);
  
  return `${minutes}:${wholeSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

export function StepByStepAnalysis({ stepAnalytics, totalVisitors }: StepByStepAnalysisProps) {
  if (!stepAnalytics || stepAnalytics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Step-by-Step Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No step data available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxVisitors = Math.max(...stepAnalytics.map(step => step.visitors_reached));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Step-by-Step Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Detailed breakdown of how visitors progress through each step
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {stepAnalytics.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === stepAnalytics.length - 1;
          const nextStep = stepAnalytics[index + 1];
          const visitorsLost = nextStep ? step.visitors_reached - nextStep.visitors_reached : 0;
          
          return (
            <div key={step.step_id} className="space-y-4">
              {/* Step Card */}
              <div className="p-6 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    {step.step_order}
                  </div>
                  
                  {/* Step Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{step.step_name}</h4>
                      <div className="flex items-center gap-2">
                        {isFinite(step.conversion_rate) && step.conversion_rate > 70 ? (
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Excellent
                          </Badge>
                        ) : isFinite(step.conversion_rate) && step.conversion_rate > 50 ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Good
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-100 text-red-700">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Needs Attention
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="text-xs text-blue-600 font-medium">Visitors</span>
                        </div>
                        <p className="text-lg font-bold">{step.visitors_reached.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalVisitors > 0 ? ((step.visitors_reached / totalVisitors) * 100).toFixed(1) : '0'}% of total
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-xs text-green-600 font-medium">Conversion</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          {isFinite(step.conversion_rate) ? step.conversion_rate.toFixed(1) : '0'}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isLast ? 'Completed' : 'To next step'}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                          <span className="text-xs text-red-600 font-medium">Drop-off</span>
                        </div>
                        <p className="text-lg font-bold text-red-600">
                          {isFinite(step.drop_off_rate) ? step.drop_off_rate.toFixed(1) : '0'}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {visitorsLost.toLocaleString()} people
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="h-4 w-4 text-purple-600 mr-1" />
                          <span className="text-xs text-purple-600 font-medium">Time</span>
                        </div>
                        <p className="text-lg font-bold">
                          {formatTime(step.avg_time_on_step || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Avg. time</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress through funnel</span>
                        <span>{totalVisitors > 0 ? ((step.visitors_reached / totalVisitors) * 100).toFixed(1) : '0'}% of all visitors</span>
                      </div>
                      <Progress 
                        value={(step.visitors_reached / maxVisitors) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection to Next Step */}
              {!isLast && (
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="w-px h-8 bg-border"></div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isFinite(step.drop_off_rate) && step.drop_off_rate > 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/20' :
                      isFinite(step.drop_off_rate) && step.drop_off_rate > 30 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20' :
                      'bg-green-100 text-green-700 dark:bg-green-900/20'
                    }`}>
                      {visitorsLost.toLocaleString()} people left ({isFinite(step.drop_off_rate) ? step.drop_off_rate.toFixed(1) : '0'}%)
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Summary Insights */}
        <div className="pt-6 border-t">
          <h4 className="font-semibold mb-4">Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Best Performing Step</span>
              </div>
              <p className="text-sm text-green-800">
                {stepAnalytics.reduce((best, step) => 
                  step.conversion_rate > best.conversion_rate ? step : best
                ).step_name}
              </p>
            </div>
            
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Biggest Drop-off</span>
              </div>
              <p className="text-sm text-red-800">
                {stepAnalytics.reduce((worst, step) => 
                  step.drop_off_rate > worst.drop_off_rate ? step : worst
                ).step_name}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
