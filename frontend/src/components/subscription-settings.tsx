'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Loader2, 
  CreditCard, 
  Calendar,
  Download,
  TrendingUp,
  Users,
  Globe,
  Zap,
  Sparkles,
  Crown,
  AlertTriangle,
  Info,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Subscription, getSubscription } from '@/lib/subscription-api';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0/month',
    priceValue: 0,
    features: [
      '1 Website',
      '5 Active Workflows per site',
      '10,000 Tracked Events/mo',
      'Basic Analytics',
      'Community Support',
    ],
    checkoutLink: '/login',
    isLemonSqueezy: false,
    popular: false,
    color: 'border-gray-200',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$19/month',
    priceValue: 19,
    features: [
      '5 Websites',
      '25 Active Workflows per site',
      '100,000 Tracked Events/mo',
      'Advanced Analytics',
      'Email Support',
      'Custom Domains',
      'UTM Tracking',
      'Funnel Analytics',
    ],
    checkoutLink: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STANDARD_CHECKOUT || 'https://seentics.lemonsqueezy.com/checkout/buy/c23b8f1c-7f24-4258-b638-342247b41d0c',
    isLemonSqueezy: true,
    popular: true,
    color: 'border-blue-200',
    buttonVariant: 'default' as const,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49/month',
    priceValue: 49,
    features: [
      'Unlimited Websites',
      'Unlimited Workflows',
      '500,000 Tracked Events/mo',
      'AI Optimization Assistant',
      'Priority Support',
      'Advanced Integrations',
      'Custom Branding',
      'Team Collaboration',
      'White-label Options',
      'Advanced Reporting',
    ],
    checkoutLink: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRO_CHECKOUT || 'https://seentics.lemonsqueezy.com/checkout/buy/d4a6540c-11e2-4328-8547-14578b746369',
    isLemonSqueezy: true,
    popular: false,
    color: 'border-purple-200',
    buttonVariant: 'default' as const,
  },
];

export function SubscriptionSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: subscription, isLoading, error } = useQuery<Subscription | null>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        return await getSubscription();
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
  
  const currentPlanId = subscription?.plan || 'free';
  const currentPlan = subscriptionPlans.find(plan => plan.id === currentPlanId);

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>Failed to load subscription information. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Loading your subscription details...' : `You are currently on the ${currentPlan?.name} plan.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{currentPlan?.name}</h3>
                  <p className="text-2xl font-bold text-primary">{currentPlan?.price}</p>
                </div>
                <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                  {subscription?.status}
                </Badge>
              </div>
              
              {subscription?.nextBillingDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                </div>
              )}

              {/* Usage Statistics */}
              {subscription && (
                <div className="space-y-4">
                  <Separator />
                  <h4 className="font-medium">Usage This Month</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Websites</span>
                        <span className="font-medium">
                          {subscription.usage.websites} / {subscription.limits.websites}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(subscription.usage.websites, subscription.limits.websites)} 
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Workflows</span>
                        <span className="font-medium">
                          {subscription.usage.workflows} / {subscription.limits.workflows}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(subscription.usage.workflows, subscription.limits.workflows)} 
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Events</span>
                        <span className="font-medium">
                          {subscription.usage.monthlyEvents.toLocaleString()} / {subscription.limits.monthlyEvents.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(subscription.usage.monthlyEvents, subscription.limits.monthlyEvents)} 
                        className={cn("h-2", getUsageColor(getUsagePercentage(subscription.usage.monthlyEvents, subscription.limits.monthlyEvents)))}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>AI Optimizations</span>
                        <span className="font-medium">
                          {subscription.usage.aiOptimizations} / {subscription.limits.aiOptimizations}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(subscription.usage.aiOptimizations, subscription.limits.aiOptimizations)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs. All plans include a 14-day free trial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="flex flex-col animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-1/2 bg-muted rounded" />
                    <div className="h-8 w-1/3 bg-muted rounded mt-2" />
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 w-full bg-muted rounded-lg" />
                  </CardFooter>
                </Card>
              ))
            ) : (
              subscriptionPlans.map((plan) => {
                const isCurrent = plan.id === currentPlanId;
                
                return (
                  <Card key={plan.id} className={cn(
                    "flex flex-col transition-all duration-200 relative",
                    isCurrent 
                      ? "border-primary ring-2 ring-primary/20 shadow-lg" 
                      : "border-border hover:shadow-md",
                    plan.color
                  )}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className={cn(plan.popular ? "pt-6" : "")}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {plan.id === 'pro' && <Crown className="h-5 w-5 text-yellow-500" />}
                          {plan.name}
                        </CardTitle>
                        {isCurrent && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold">{plan.price}</p>
                      <p className="text-sm text-muted-foreground">
                        {plan.priceValue === 0 ? 'Free forever' : 'Billed monthly'}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        {plan.features.map(feature => (
                          <li key={feature} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        asChild 
                        className="w-full" 
                        disabled={isCurrent}
                        variant={isCurrent ? "outline" : plan.buttonVariant}
                      >
                        <Link href={getCheckoutUrl(plan.checkoutLink)}>
                          {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Portal */}
      {subscription?.plan !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Management</CardTitle>
            <CardDescription>
              Manage your subscription and view billing history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Billing Portal</p>
                  <p className="text-sm text-muted-foreground">
                    Access your billing information and download invoices.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link 
                    href={process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CUSTOMER_PORTAL || 'https://seentics.lemonsqueezy.com/customer'} 
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Billing Portal
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Download Invoices</p>
                  <p className="text-sm text-muted-foreground">
                    Get copies of your billing statements.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>
            Detailed comparison of all available plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Feature</th>
                  {subscriptionPlans.map(plan => (
                    <th key={plan.id} className="text-center py-3 font-medium">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Websites</td>
                  {subscriptionPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3">
                      {plan.id === 'free' ? '1' : plan.id === 'standard' ? '5' : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3">Workflows per site</td>
                  {subscriptionPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3">
                      {plan.id === 'free' ? '5' : plan.id === 'standard' ? '25' : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3">Monthly Events</td>
                  {subscriptionPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3">
                      {plan.id === 'free' ? '10K' : plan.id === 'standard' ? '100K' : '500K+'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3">AI Assistant</td>
                  {subscriptionPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3">
                      {plan.id === 'free' ? '❌' : plan.id === 'standard' ? '❌' : '✅'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3">Priority Support</td>
                  {subscriptionPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3">
                      {plan.id === 'free' ? '❌' : plan.id === 'standard' ? '❌' : '✅'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3">Custom Branding</td>
                  {subscriptionPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3">
                      {plan.id === 'free' ? '❌' : plan.id === 'standard' ? '❌' : '✅'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
