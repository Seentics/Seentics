'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Zap, 
  BarChart3, 
  Sparkles,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SubscriptionUsageWidgetProps {
  className?: string;
  showUpgradeButton?: boolean;
  compact?: boolean;
  showWarnings?: boolean;
}

export function SubscriptionUsageWidget({ 
  className = '', 
  showUpgradeButton = true,
  compact = false,
  showWarnings = true
}: SubscriptionUsageWidgetProps) {
  const {
    usage,
    limits,
    subscription,
    getUsagePercentage,
    getUsageColor,
    isUsageNearLimit,
    getRemainingCapacity,
    isLoading
  } = useSubscription();

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-3">
          <div className="h-5 w-1/2 bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !usage || !limits) {
    return null;
  }

  const usageItems = [
    {
      type: 'websites' as const,
      icon: Globe,
      label: 'Websites',
      current: usage.websites || 0,
      limit: limits.websites || 0,
      description: 'Active websites'
    },
    {
      type: 'workflows' as const,
      icon: Zap,
      label: 'Workflows',
      current: usage.workflows || 0,
      limit: limits.workflows || 0,
      description: 'Active workflows'
    },
    {
      type: 'monthlyEvents' as const,
      icon: BarChart3,
      label: 'Monthly Events',
      current: usage.monthlyEvents || 0,
      limit: limits.monthlyEvents || 0,
      description: 'Tracked events this month'
    },
    {
      type: 'aiOptimizations' as const,
      icon: Sparkles,
      label: 'AI Optimizations',
      current: usage.aiOptimizations || 0,
      limit: limits.aiOptimizations || 0,
      description: 'AI-powered optimizations'
    }
  ];

  const hasWarnings = showWarnings && usageItems.some(item => 
    isUsageNearLimit(item.type)
  );

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Usage Overview</CardTitle>
            <CardDescription>
              Your current plan usage
            </CardDescription>
          </div>
          {hasWarnings && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Near Limits
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {usageItems.map((item) => {
          const IconComponent = item.icon;
          const percentage = getUsagePercentage(item.type);
          const isNearLimit = isUsageNearLimit(item.type);
          const remaining = getRemainingCapacity(item.type);
          
          return (
            <div key={item.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isNearLimit && showWarnings && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                      Warning
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {item.current.toLocaleString()} / {item.limit.toLocaleString()}
                  </div>
                  {!compact && (
                    <div className="text-xs text-muted-foreground">
                      {remaining > 0 ? `${remaining.toLocaleString()} remaining` : 'At limit'}
                    </div>
                  )}
                </div>
              </div>
              
              <Progress 
                value={percentage} 
                className={cn("h-2", getUsageColor(item.type))}
              />
              
              {!compact && (
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}

        {/* Upgrade Button */}
        {showUpgradeButton && subscription.plan === 'free' && (
          <div className="pt-2">
            <Button asChild className="w-full" size="sm">
              <Link href="/websites/billing">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Link>
            </Button>
          </div>
        )}

        {/* Warning Message */}
        {hasWarnings && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Usage approaching limits</p>
                <p className="text-yellow-700 mt-1">
                  Consider upgrading your plan to avoid service interruptions.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
