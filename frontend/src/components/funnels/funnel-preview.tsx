'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, Target, Users, TrendingUp } from 'lucide-react';

interface FunnelStep {
  id: string;
  name: string;
  type: 'page' | 'event' | 'custom';
  order: number;
  selector?: string;
  description?: string;
}

interface FunnelPreviewProps {
  steps: FunnelStep[];
  funnelName: string;
}

export function FunnelPreview({ steps, funnelName }: FunnelPreviewProps) {
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'page': return '🌐';
      case 'event': return '👆';
      case 'custom': return '⚡';
      default: return '📍';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'page': return 'Page Visit';
      case 'event': return 'Element Click';
      case 'custom': return 'Custom Event';
      default: return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Funnel Preview: {funnelName || 'Untitled Funnel'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {steps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No steps configured yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id}>
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                    {step.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getStepIcon(step.type)}</span>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {step.name || `Step ${step.order}`}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(step.type)}
                      </Badge>
                    </div>
                    {step.selector && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {step.selector}
                      </p>
                    )}
                    {step.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>--</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>--%</span>
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
