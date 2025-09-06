"use client";

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Globe, MousePointer, Zap } from 'lucide-react';

export interface FunnelNodeData {
  stepNumber: number;
  name: string;
  type: 'page' | 'event' | 'custom';
  condition: {
    page?: string;
    event?: string;
    custom?: string;
  };
  isSelected?: boolean;
}

const FunnelNode: React.FC<NodeProps<FunnelNodeData>> = ({ data, selected }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'page':
        return <Globe className="w-4 h-4" />;
      case 'event':
        return <MousePointer className="w-4 h-4" />;
      case 'custom':
        return <Zap className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getConditionText = () => {
    if (data.type === 'page' && data.condition.page) {
      return data.condition.page;
    }
    if (data.type === 'event' && data.condition.event) {
      return data.condition.event;
    }
    if (data.type === 'custom' && data.condition.custom) {
      return data.condition.custom;
    }
    return 'Not configured';
  };

  return (
    <Card className={`min-w-[250px] transition-all duration-200 ${
      selected ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-md'
    }`}>
      <div className="p-4">
        {/* Step Number & Icon */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {data.stepNumber}
            </div>
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              {getIcon()}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {data.type}
          </Badge>
        </div>

        {/* Step Name */}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
          {data.name || 'Unnamed Step'}
        </h3>

        {/* Condition */}
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">Tracks:</div>
          <code className="bg-muted px-2 py-1 rounded text-xs break-all">
            {getConditionText()}
          </code>
        </div>
      </div>

      {/* Handles */}
      {data.stepNumber > 1 && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-blue-500 border-2 border-white"
        />
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </Card>
  );
};

export default FunnelNode;
