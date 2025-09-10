'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Mail, 
  Webhook, 
  Clock, 
  Filter, 
  Zap,
  MousePointer,
  Globe,
  Database
} from 'lucide-react';

interface NodeType {
  type: string;
  label: string;
  icon: React.ElementType;
  description: string;
  category: 'trigger' | 'action' | 'condition';
}

const nodeTypes: NodeType[] = [
  {
    type: 'page_visit',
    label: 'Page Visit',
    icon: Globe,
    description: 'Trigger when user visits a page',
    category: 'trigger'
  },
  {
    type: 'click_event',
    label: 'Click Event',
    icon: MousePointer,
    description: 'Trigger when user clicks an element',
    category: 'trigger'
  },
  {
    type: 'send_email',
    label: 'Send Email',
    icon: Mail,
    description: 'Send an email to the user',
    category: 'action'
  },
  {
    type: 'webhook',
    label: 'Webhook',
    icon: Webhook,
    description: 'Send data to external service',
    category: 'action'
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    description: 'Wait for a specified time',
    category: 'action'
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: Filter,
    description: 'Branch based on conditions',
    category: 'condition'
  }
];

interface WorkflowSidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export function WorkflowSidebar({ onDragStart }: WorkflowSidebarProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trigger': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'action': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'condition': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const groupedNodes = nodeTypes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, NodeType[]>);

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Workflow Nodes
        </h2>
        
        <div className="space-y-6">
          {Object.entries(groupedNodes).map(([category, nodes]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 capitalize">
                {category}s
              </h3>
              <div className="space-y-2">
                {nodes.map((node) => {
                  const IconComponent = node.icon;
                  return (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(event) => onDragStart(event, node.type)}
                      className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-grab hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {node.label}
                            </h4>
                            <Badge className={`text-xs ${getCategoryColor(node.category)}`}>
                              {node.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {node.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
