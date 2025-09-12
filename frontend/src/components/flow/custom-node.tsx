
'use client';

import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Trash2, Settings, Zap, Target, Settings as SettingsIcon } from 'lucide-react';
import React from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';

export type NodeSettings = {
  // Trigger Settings
  url?: string;
  urlMatchType?: 'exact' | 'contains' | 'startsWith' | 'endsWith';
  seconds?: number;
  selector?: string;
  scrollDepth?: number;
  customEventName?: string;
  inactivitySeconds?: number;

  // Condition Settings
  deviceType?: 'Desktop' | 'Mobile' | 'Tablet' | 'Any';
  minScreenWidth?: number;
  maxScreenWidth?: number;
  touchSupport?: 'touch' | 'no-touch';
  browser?: 'chrome' | 'firefox' | 'safari' | 'edge' | 'other';
  referrerUrl?: string;
  referrerMatchType?: 'exact' | 'contains' | 'startsWith' | 'endsWith';
  visitorType?: 'new' | 'returning';
  tagName?: string;
  
  // Action Settings
  displayMode?: 'simple' | 'custom'; // For modal/banner
  displayFrequency?: 'every_trigger' | 'once_per_session' | 'once_ever'; // Frequency control for ALL action nodes
  frequency?: 'every_trigger' | 'once_per_session' | 'once_ever'; // Frequency control for workflow tracker
  modalTitle?: string;
  modalContent?: string;
  redirectUrl?: string;
  emailSendType?: 'visitor' | 'custom'; // For Send Email action
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
  eventName?: string;
  bannerContent?: string;
  bannerPosition?: 'top' | 'bottom';
  bannerCtaText?: string;
  bannerCtaUrl?: string;
  tagAction?: 'add' | 'remove';
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  webhookHeaders?: { [key: string]: string };
  webhookBody?: string;
  insertPosition?: 'before' | 'after' | 'prepend' | 'append';

  // This will store mappings from localStorage keys to payload keys
  localStorageData?: { localStorageKey: string; payloadKey: string }[];

  // Experiment / gating
  variantAPercent?: number; // For Split Test (0-100)
  cooldownSeconds?: number; // For Frequency Cap / Cooldown
  // Branch Split
  variantsCount?: number; // 2 or 3
  variantBPercent?: number;
  variantCPercent?: number;
  variantALabel?: string;
  variantBLabel?: string;
  variantCLabel?: string;

  // Time Window condition
  startHour?: number; // 0-23
  endHour?: number;   // 0-23
  daysOfWeek?: number[]; // 0-6 (Sun-Sat)

  // Query Param condition
  queryParam?: string;
  queryMatchType?: 'exact' | 'contains' | 'startsWith' | 'endsWith' | 'exists';
  queryValue?: string;

  // Wait action
  waitSeconds?: number;

  // Join condition
  joinTimeoutSeconds?: number;

  // Funnel Trigger settings
  funnelId?: string;
  eventType?: 'dropoff' | 'conversion' | 'milestone' | 'abandonment' | 'step_completion';
  stepIndex?: number;
  timeThreshold?: number;
  userSegment?: string;
  minValue?: number;
  maxValue?: number | null;

  // Custom code fields
  customHtml?: string;
  customCss?: string;
  customJs?: string;
};

export type CustomNodeData = {
  iconName: keyof typeof LucideIcons;
  title: string;
  subtitle?: string;
  type: 'Trigger' | 'Condition' | 'Action';
  color: string;
  settings: NodeSettings;
  isServerAction?: boolean;
};

export function CustomNode({ data, id, selected }: NodeProps<CustomNodeData>) {
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    // Also clean up edges that reference this node
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };
  
  const Icon = (LucideIcons as any)[data.iconName] as LucideIcon;
  
  if (!Icon) {
    console.warn(`Icon "${data.iconName}" not found.`);
    return <div>Icon not found</div>;
  }

  const getTypeIcon = () => {
    switch (data.type) {
      case 'Trigger':
        return <Zap className="h-3 w-3" />;
      case 'Condition':
        return <SettingsIcon className="h-3 w-3" />;
      case 'Action':
        return <Target className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeColor = () => {
    switch (data.type) {
      case 'Trigger':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Condition':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Action':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative group",
        selected && "z-10"
      )}
    >
      <div
        className={cn(
          "flex w-48 items-start gap-2.5 rounded-lg border bg-gradient-to-br from-card to-card/50 p-2.5 shadow-sm backdrop-blur-sm transition-all duration-200",
          selected 
            ? 'border-primary shadow-primary/30 scale-105' 
            : 'border-border hover:border-primary/30 hover:shadow'
        )}
      >
        {/* Icon Container */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md shadow-sm transition-all duration-200 group-hover:scale-105"
          style={{ 
            backgroundColor: data.color + '20',
            border: `2px solid ${data.color}40`
          }}
        >
          <Icon className="h-4 w-4" style={{ color: data.color }} />
        </div>

        {/* Content */}
        <div className="flex-grow overflow-hidden space-y-2">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-xs leading-tight text-foreground">
                {data.title}
              </h3>
              {data.subtitle && (
                 <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {data.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Type Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn("text-[10px] font-medium", getTypeColor())}
            >
              <div className="flex items-center gap-1">
                {getTypeIcon()}
                {data.type}
              </div>
            </Badge>
            {data.isServerAction && (
              <Badge variant="outline" className="text-xs">
                Server
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
            title="Open settings"
          >
            <Settings className="h-3 w-3 text-muted-foreground" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6 rounded-full bg-destructive/10 backdrop-blur-sm border-destructive/20 shadow-sm hover:bg-destructive/20"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !bg-primary !border-2 !border-background shadow-sm"
          style={{ top: '-6px' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-3 !w-3 !bg-primary !border-2 !border-background shadow-sm"
          style={{ bottom: '-6px' }}
        />
      </div>
    </motion.div>
  );
}
