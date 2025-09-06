'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Globe, 
  Zap, 
  BarChart3, 
  Sparkles,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Users,
  Activity
} from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SubscriptionDashboardProps {
  className?: string;
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export function SubscriptionDashboard({ 
  className = '', 
  showUpgradeButton = true,
  compact = false 
}: SubscriptionDashboardProps) {
  const {
    subscription,
    usage,
    limits,
    currentPlan,
    isActive,
    isExpired,
    daysUntilRenewal,
    trialDaysRemaining,
    getUsagePercentage,
    getUsageColor,
    isUsageNearLimit,
    getRemainingCapacity,
    isLoading
  } = useSubscription();

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 w-1/3 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className={cn(className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>Unable to load subscription information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usageItems = [
    {
      type: 'websites' as const,
      icon: Globe,
      label: 'Websites',
      current: usage?.websites || 0,
      limit: limits?.websites || 0,
      description: 'Active websites'
    },
    {
      type: 'workflows' as const,
      icon: Zap,
      label: 'Workflows',
      current: usage?.workflows || 0,
      limit: limits?.workflows || 0,
      description: 'Active workflows'
    },
    {
      type: 'monthlyEvents' as const,
      icon: BarChart3,
      label: 'Monthly Events',
      current: usage?.monthlyEvents || 0,
      limit: limits?.monthlyEvents || 0,
      description: 'Tracked events this month'
    },
    {
      type: 'aiOptimizations' as const,
      icon: Sparkles,
      label: 'AI Optimizations',
      current: usage?.aiOptimizations || 0,
      limit: limits?.aiOptimizations || 0,
      description: 'AI-powered optimizations'
    },
    {
      type: 'teamMembers' as const,
      icon: Users,
      label: 'Team Members',
      current: usage?.teamMembers || 0,
      limit: limits?.teamMembers || 0,
      description: 'Active team members'
    },
    {
      type: 'apiCallsPerMonth' as const,
      icon: Activity,
      label: 'API Calls',
      current: usage?.apiCallsPerMonth || 0,
      limit: limits?.apiCallsPerMonth || 0,
      description: 'API calls this month'
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Plan Status */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentPlan.name} Plan</CardTitle>
                <CardDescription>
                  {isActive ? 'Active subscription' : 'Subscription inactive'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {subscription.status}
              </Badge>
              {subscription.status === 'on_trial' && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Trial
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        {!compact && (
          <CardContent className="space-y-4">
            {/* Plan Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Plan Price</p>
                <p className="text-2xl font-bold">
                  {currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}/month`}
                </p>
              </div>
              
              {subscription.renewsAt && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Next Billing</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(subscription.renewsAt).toLocaleDateString()}</span>
                    {daysUntilRenewal !== null && (
                      <Badge variant="outline" className="text-xs">
                        {daysUntilRenewal} days
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {subscription.trialEndsAt && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Trial Ends</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(subscription.trialEndsAt).toLocaleDateString()}</span>
                    {trialDaysRemaining !== null && (
                      <Badge variant="outline" className="text-xs">
                        {trialDaysRemaining} days left
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Upgrade Button */}
            {showUpgradeButton && subscription.plan === 'free' && (
              <div className="pt-2">
                <Button asChild className="w-full">
                  <Link href="/websites/billing">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Usage Overview</CardTitle>
          <CardDescription>
            Your current usage across all plan features
          </CardDescription>
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
                    <span className="font-medium">{item.label}</span>
                    {isNearLimit && (
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                        Near Limit
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {item.type === 'monthlyEvents' ? 
                        `${item.current >= 1000 ? (item.current / 1000) + 'K' : item.current.toLocaleString()} / ${item.limit >= 1000 ? (item.limit / 1000) + 'K' : item.limit.toLocaleString()}` :
                        `${item.current.toLocaleString()} / ${item.limit.toLocaleString()}`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.type === 'monthlyEvents' ? 
                        `${item.limit >= 1000 ? (item.limit / 1000) + 'K' : item.limit.toLocaleString()} total` :
                        remaining > 0 ? `${remaining.toLocaleString()} remaining` : 'At limit'
                      }
                    </div>
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
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Manage Billing</h3>
                  <p className="text-xs text-muted-foreground">Update payment methods</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">View Plans</h3>
                  <p className="text-xs text-muted-foreground">Compare all plans</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
