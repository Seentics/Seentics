"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, MousePointer, Zap, GripVertical } from 'lucide-react';

const stepTypes = [
  {
    id: 'page-step',
    type: 'page',
    name: 'Page Visit',
    description: 'Track when users visit a specific page',
    icon: Globe,
    color: 'bg-blue-500',
    example: '/checkout'
  },
  {
    id: 'event-step',
    type: 'event',
    name: 'Button Click',
    description: 'Track clicks on buttons or elements',
    icon: MousePointer,
    color: 'bg-green-500',
    example: '#buy-now-btn'
  },
  {
    id: 'custom-step',
    type: 'custom',
    name: 'Custom Event',
    description: 'Track custom JavaScript events',
    icon: Zap,
    color: 'bg-purple-500',
    example: 'purchase_complete'
  }
];

export function FunnelPalette() {
  const onDragStart = (event: React.DragEvent, stepType: any) => {
    event.dataTransfer.setData('application/reactflow-node-type', 'funnelStep');
    event.dataTransfer.setData('application/reactflow-funnel-step', JSON.stringify(stepType));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-full h-full bg-background border-r">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg mb-2">Funnel Steps</h2>
        <p className="text-sm text-muted-foreground">
          Drag steps onto the canvas to build your funnel
        </p>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
            Available Steps
          </h3>
          <div className="space-y-3">
            {stepTypes.map((step) => (
              <Card
                key={step.id}
                className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                draggable
                onDragStart={(e) => onDragStart(e, step)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div className={`p-2 ${step.color} rounded-lg`}>
                        <step.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{step.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {step.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {step.example}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
            💡 Quick Tips
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Drag steps in the order users will complete them</li>
            <li>• Start with where users enter your site</li>
            <li>• End with your conversion goal</li>
            <li>• Keep funnels focused on one objective</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
