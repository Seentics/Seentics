'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Loader2, 
  CreditCard, 
  Calendar,
  Download,
  Crown,
  Zap,
  Globe,
  BarChart3,
  Activity,
  Receipt,
  Settings,
  ArrowRight,
  Info,
  AlertTriangle,
  ExternalLink,
  Users
} from 'lucide-react';
import { useAuth } from '@/stores/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  type Subscription, 
  getSubscription, 
  getSubscriptionUsage,
  cancelSubscription,
  getPlanDetails,
  getAllPlans,
  isPlanActive,
  getDaysUntilRenewal,
  getTrialDaysRemaining
} from '@/lib/subscription-api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { SubscriptionDashboard } from '@/components/subscription-dashboard';
import { SubscriptionPlanComparison } from '@/components/subscription-plan-comparison';

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState(false);
  
  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription | null>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await getSubscription();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['subscription-usage', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await getSubscriptionUsage();
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will be cancelled at the end of the current billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    },
    onError: () => {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentPlanId = subscription?.plan || 'free';
  const currentPlan = getPlanDetails(currentPlanId);
  const allPlans = getAllPlans();
  const isLoading = subscriptionLoading || usageLoading;

  const getCheckoutUrl = (planCheckoutLink: string) => {
    if (!user || !planCheckoutLink.includes('lemonsqueezy.com')) {
      return planCheckoutLink;
    }
    const url = new URL(planCheckoutLink);
    url.searchParams.set('checkout[custom][userId]', user.id);
    if (user.email) {
      url.searchParams.set('checkout[email]', user.email);
    }
    return url.toString();
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await cancelMutation.mutateAsync();
    } finally {
      setIsCancelling(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPlanCheckoutLink = (planId: string) => {
    const planMap = {
      'free': '/login',
      'standard': process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STANDARD_CHECKOUT || 'https://seentics.lemonsqueezy.com/checkout/buy/c23b8f1c-7f24-4258-b638-342247b41d0c',
      'pro': process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRO_CHECKOUT || 'https://seentics.lemonsqueezy.com/checkout/buy/d4a6540c-11e2-4328-8547-14578b746369'
    };
    return planMap[planId as keyof typeof planMap] || '/login';
  };

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full space-y-8">
      {/* Improved Header Section with Tabs on the Right */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage your subscription, view usage, and handle billing.
          </p>
        </div>
        
        {/* Tabs moved to the right side */}
        <div className="flex-shrink-0">
          <TabsList className="grid w-full grid-cols-4 bg-muted/40 p-1 rounded-lg bg-gray-200 dark:bg-gray-800 shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm font-medium transition-all">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm font-medium transition-all">
              <Crown className="h-4 w-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm font-medium transition-all">
              <Activity className="h-4 w-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm font-medium transition-all">
              <Receipt className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Tab Content - Connected to the header tabs */}
      <TabsContent value="overview" className="mt-6">
        <div className="space-y-6">
          <SubscriptionDashboard showUpgradeButton={false} compact={true} />
        </div>
      </TabsContent>

      <TabsContent value="plans" className="mt-6" id="plans">
        <div className="space-y-6">
          <SubscriptionPlanComparison />
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Options</CardTitle>
              <CardDescription>Select a plan to upgrade via secure checkout.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {Object.entries(allPlans).map(([planId, planDetails]) => {
                if (planId === 'free' || planId === currentPlanId) return null;
                
                return (
                  <Button
                    key={planId}
                    onClick={() => {
                      const checkoutUrl = getCheckoutUrl(getPlanCheckoutLink(planId));
                      if (!checkoutUrl) return alert('Checkout not configured');
                      window.location.href = checkoutUrl;
                    }}
                    variant="outline"
                    className="capitalize"
                  >
                    Upgrade to {planDetails.name}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="usage" className="mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Current Usage
              </CardTitle>
              <CardDescription>
                Your usage for the current billing period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
              ) : usageData ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Websites</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {usageData.usage.websites} / {usageData.limits.websites}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usageData.usage.websites, usageData.limits.websites)} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Active Workflows</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {usageData.usage.workflows} / {usageData.limits.workflows}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usageData.usage.workflows, usageData.limits.workflows)} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Tracked Events</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {usageData.usage.monthlyEvents >= 1000 ? (usageData.usage.monthlyEvents / 1000) + 'K' : usageData.usage.monthlyEvents.toLocaleString()} / {usageData.limits.monthlyEvents >= 1000 ? (usageData.limits.monthlyEvents / 1000) + 'K' : usageData.limits.monthlyEvents.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usageData.usage.monthlyEvents, usageData.limits.monthlyEvents)} 
                      className={cn("h-2", getUsageColor(getUsagePercentage(usageData.usage.monthlyEvents, usageData.limits.monthlyEvents)))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">AI Optimizations</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {usageData.usage.aiOptimizations} / {usageData.limits.aiOptimizations}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usageData.usage.aiOptimizations, usageData.limits.aiOptimizations)} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Team Members</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {usageData.usage.teamMembers || 0} / {usageData.limits.teamMembers || 0}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usageData.usage.teamMembers || 0, usageData.limits.teamMembers || 0)} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">API Calls</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {usageData.usage.apiCallsPerMonth || 0} / {usageData.limits.apiCallsPerMonth || 0}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usageData.usage.apiCallsPerMonth || 0, usageData.limits.apiCallsPerMonth || 0)} 
                      className="h-2"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Unable to load usage data</p>
                </div>
              )}
            </CardContent>
          </Card>

          {usageData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Usage Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>You're using <strong>{Math.round(getUsagePercentage(usageData.usage.websites, usageData.limits.websites))}%</strong> of your website limit</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>You're using <strong>{Math.round(getUsagePercentage(usageData.usage.workflows, usageData.limits.workflows))}%</strong> of your workflow limit</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>You're using <strong>{Math.round(getUsagePercentage(usageData.usage.monthlyEvents, usageData.limits.monthlyEvents))}%</strong> of your monthly event limit ({usageData.limits.monthlyEvents >= 1000 ? (usageData.limits.monthlyEvents / 1000) + 'K' : usageData.limits.monthlyEvents.toLocaleString()} total)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>You're using <strong>{Math.round(getUsagePercentage(usageData.usage.aiOptimizations, usageData.limits.aiOptimizations))}%</strong> of your AI optimization limit</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>You're using <strong>{Math.round(getUsagePercentage(usageData.usage.teamMembers || 0, usageData.limits.teamMembers || 0))}%</strong> of your team member limit</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>You're using <strong>{Math.round(getUsagePercentage(usageData.usage.apiCallsPerMonth || 0, usageData.limits.apiCallsPerMonth || 0))}%</strong> of your API calls limit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="billing" className="mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Management
              </CardTitle>
              <CardDescription>
                Access your billing information, download invoices, and manage payment methods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Lemon Squeezy Customer Portal</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription, view billing history, and update payment methods.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link 
                    href={process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CUSTOMER_PORTAL || 'https://seentics.lemonsqueezy.com/customer'} 
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access Portal
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Invoices
              </CardTitle>
              <CardDescription>
                Your recent billing statements and invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Access your invoices through the Lemon Squeezy customer portal</p>
                <Button variant="outline" asChild>
                  <Link 
                    href={process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CUSTOMER_PORTAL || 'https://seentics.lemonsqueezy.com/customer'} 
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Invoices
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {subscription?.billingInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Billing Information
                </CardTitle>
                <CardDescription>
                  Your current billing details and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Billing Cycle</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.billingInfo.interval || 'Monthly'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Next Billing Date</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.renewsAt ? new Date(subscription.renewsAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.billingInfo.price ? `$${subscription.billingInfo.price} ${subscription.billingInfo.currency || 'USD'}` : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Customer Email</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.billingInfo.customerEmail || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
