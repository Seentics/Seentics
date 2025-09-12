
'use client';

import React, { DragEvent, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import * as LucideIcons from 'lucide-react';
import { type LucideIcon, GripVertical, Sparkles, Zap, Target, Settings, Search, Star, Clock, TrendingUp } from 'lucide-react';
import type { CustomNodeData } from './custom-node';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type PaletteNode = Omit<CustomNodeData, 'settings' | 'subtitle'> & {
  name: string;
  description?: string;
  isPopular?: boolean;
  isNew?: boolean;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
};

// MVP Node Types - Simplified for essential features only
const nodeTypes: { name: string; nodes: Omit<PaletteNode, 'title'>[]; icon: LucideIcon; color: string; description: string }[] = [
  {
    name: 'Triggers',
    icon: Zap,
    color: 'hsl(var(--chart-1))',
    description: 'Events that start your workflow',
    nodes: [
      { 
        name: 'Page View', 
        iconName: 'Eye', 
        type: 'Trigger', 
        color: 'hsl(var(--chart-1))',
        description: 'Triggers when a visitor views a page',
        isPopular: true,
        difficulty: 'Beginner'
      },
      { 
        name: 'Element Click', 
        iconName: 'CheckSquare', 
        type: 'Trigger', 
        color: 'hsl(var(--chart-1))',
        description: 'Triggers when a specific element is clicked',
        isPopular: true,
        difficulty: 'Beginner'
      },
      { 
        name: 'Funnel', 
        iconName: 'BarChart3', 
        type: 'Trigger', 
        color: 'hsl(var(--chart-1))',
        description: 'Triggers when specific funnel events occur',
        difficulty: 'Intermediate',
        isPopular: true
      },
      { 
        name: 'Time Spent', 
        iconName: 'Clock', 
        type: 'Trigger', 
        color: 'hsl(var(--chart-1))',
        description: 'Triggers after a visitor spends time on page',
        difficulty: 'Beginner'
      },
      { 
        name: 'Exit Intent', 
        iconName: 'MousePointer', 
        type: 'Trigger', 
        color: 'hsl(var(--chart-1))',
        description: 'Triggers when visitor moves mouse to leave',
        difficulty: 'Intermediate'
      },
    ],
  },
  {
    name: 'Conditions',
    icon: Settings,
    color: 'hsl(var(--chart-2))',
    description: 'Logic to control workflow flow',
    nodes: [
      { 
        name: 'URL Path', 
        iconName: 'Link', 
        type: 'Condition', 
        color: 'hsl(var(--chart-2))',
        description: 'Checks if visitor is on a specific page',
        isPopular: true,
        difficulty: 'Beginner'
      },
      { 
        name: 'Traffic Source', 
        iconName: 'Filter', 
        type: 'Condition', 
        color: 'hsl(var(--chart-2))',
        description: 'Checks where the visitor came from',
        difficulty: 'Beginner'
      },
      { 
        name: 'New vs Returning', 
        iconName: 'UserPlus', 
        type: 'Condition', 
        color: 'hsl(var(--chart-2))',
        description: 'Checks if visitor is new or returning',
        difficulty: 'Beginner'
      },
      { 
        name: 'Device Type', 
        iconName: 'Smartphone', 
        type: 'Condition', 
        color: 'hsl(var(--chart-2))',
        description: 'Checks visitor device type (mobile/desktop)',
        difficulty: 'Beginner'
      },
    ],
  },
  {
    name: 'Actions',
    icon: Target,
    color: 'hsl(var(--chart-4))',
    description: 'What your workflow does',
    nodes: [
      { 
        name: 'Show Modal', 
        iconName: 'MessageSquare', 
        type: 'Action', 
        color: 'hsl(var(--chart-4))',
        description: 'Displays a modal popup to the visitor',
        isPopular: true,
        difficulty: 'Beginner'
      },
      { 
        name: 'Show Banner', 
        iconName: 'AlertTriangle', 
        type: 'Action', 
        color: 'hsl(var(--chart-4))',
        description: 'Shows a banner at the top or bottom',
        difficulty: 'Beginner'
      },
      { 
        name: 'Track Event', 
        iconName: 'BarChart2', 
        type: 'Action', 
        color: 'hsl(var(--chart-4))',
        description: 'Sends analytics event to your dashboard',
        difficulty: 'Beginner'
      },
      { 
        name: 'Webhook', 
        iconName: 'Webhook', 
        type: 'Action', 
        color: 'hsl(var(--chart-4))', 
        isServerAction: true,
        description: 'Sends data to your external service',
        difficulty: 'Intermediate'
      },
      { 
        name: 'Redirect URL', 
        iconName: 'Link2', 
        type: 'Action', 
        color: 'hsl(var(--chart-4))',
        description: 'Redirects visitor to another page',
        difficulty: 'Beginner'
      },
    ],
  },
];

const onDragStart = (event: DragEvent, nodeType: string, nodeData: any) => {
  event.dataTransfer.setData('application/reactflow-node-data', nodeType);
  
  const fullNodeData = {
    ...nodeData,
    settings: {},
  };

  event.dataTransfer.setData('application/reactflow-node-full-data', JSON.stringify(fullNodeData));
  event.dataTransfer.effectAllowed = 'move';
};

export function NodePalette() {
  const [search, setSearch] = useState('');
  const filteredTypes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return nodeTypes;
    return nodeTypes.map(group => ({
      ...group,
      nodes: group.nodes.filter(n =>
        n.name.toLowerCase().includes(q) ||
        (n.description || '').toLowerCase().includes(q)
      )
    }));
  }, [search]);

  return (
    <Card className="h-full bg-gradient-to-br from-background to-muted/20 shadow-lg border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className='mb-2'>
              <CardTitle className="text-lg">Components</CardTitle>
              <CardDescription>Drag nodes to build your workflow</CardDescription>
            </div>
          </div>
        </div>
        {/* <div className="mt-3 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="pl-8"
          />
        </div> */}
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="Triggers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 sticky top-0 z-10">
            {nodeTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TabsTrigger 
                  key={type.name} 
                  value={type.name}
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {type.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {filteredTypes.map((type) => (
            <TabsContent value={type.name} key={type.name} className="pt-4">
              <div className="space-y-3 pr-1 max-h-[calc(100vh-280px)] overflow-y-auto">
                {type.nodes.map((node, index) => {
                  const Icon = (LucideIcons as any)[node.iconName] as LucideIcon;
                  const nodePayload = { 
                    iconName: node.iconName, 
                    title: node.name, 
                    type: node.type, 
                    color: node.color, 
                    isServerAction: node.isServerAction 
                  };
                  return (
                    <motion.div
                      key={node.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group cursor-grab active:cursor-grabbing"
                      onDragStart={(event: any) => onDragStart(event as unknown as DragEvent, 'custom', nodePayload)}
                      draggable
                    >
                      <div className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-all hover:bg-primary/5 hover:shadow-md  group-hover:border-primary/20">
                        <div 
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
                          style={{ backgroundColor: node.color + '20' }}
                        >
                          <Icon className="h-5 w-5" style={{ color: node.color }} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">{node.name}</span>
                            {node.isPopular && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Popular component</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {node.isNew && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                      NEW
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Recently added</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {node.isServerAction && (
                              <Badge variant="secondary" className="text-xs">
                                Server
                              </Badge>
                            )}
                          </div>
                          {node.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                              {node.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            {node.difficulty && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  node.difficulty === 'Beginner' 
                                    ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400'
                                    : node.difficulty === 'Intermediate'
                                    ? 'border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-400'
                                    : 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-400'
                                }`}
                              >
                                {node.difficulty}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
