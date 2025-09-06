'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star, TrendingUp, Shield, Sparkles, Globe, BarChart3, Users, Clock, Calendar, X, Activity } from 'lucide-react';
import { getAllPlans, getPlanDetails, type PlanId } from '@/lib/subscription-api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/stores/useAuthStore';
import { useSubscription } from '@/hooks/use-subscription';

interface SubscriptionPlanComparisonProps {
  className?: string;
  showCurrentPlan?: boolean;
  compact?: boolean;
}

export function SubscriptionPlanComparison({ 
  className = '', 
  showCurrentPlan = true,
  compact = false 
}: SubscriptionPlanComparisonProps) {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const allPlans = getAllPlans();
  const currentPlanId = subscription?.plan || 'free';

  const planFeatures = {
    websites: { icon: Globe, label: 'Websites' },
    workflows: { icon: Zap, label: 'Workflows' },
    monthlyEvents: { icon: BarChart3, label: 'Monthly Events' },
    aiOptimizations: { icon: Sparkles, label: 'AI Optimizations' },
    teamMembers: { icon: Users, label: 'Team Members' },
    storageGB: { icon: Activity, label: 'Storage' },
    customDomains: { icon: Globe, label: 'Custom Domains' },
    apiCallsPerMonth: { icon: Activity, label: 'API Calls/Month' }
  };

  const getCheckoutUrl = (planId: PlanId) => {
    if (planId === 'free') return '';
    
    const planCheckoutUrls = {
      standard: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STANDARD_CHECKOUT || 'https://seentics.lemonsqueezy.com/checkout/buy/c23b8f1c-7f24-4258-b638-342247b41d0c',
      pro: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRO_CHECKOUT || 'https://seentics.lemonsqueezy.com/checkout/buy/d4a6540c-11e2-4328-8547-14578b746369'
    };
    
    const base = planCheckoutUrls[planId];
    if (!base) return '';
    
    try {
      const url = new URL(base);
      if (user?.id) url.searchParams.set('checkout[custom][userId]', String(user.id));
      if (user?.email) url.searchParams.set('checkout[email]', String(user.email));
      return url.toString();
    } catch {
      return base;
    }
  };

  const handlePlanSelect = (planId: PlanId) => {
    if (planId === 'free') return;
    const checkoutUrl = getCheckoutUrl(planId);
    if (!checkoutUrl) return alert('Checkout not configured for this plan');
    window.location.href = checkoutUrl;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your needs. All plans include our core features with different usage limits.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(allPlans).map(([planId, planDetails]) => {
          const isCurrentPlan = planId === currentPlanId;
          const isPopular = planId === 'pro';
          
          return (
            <Card 
              key={planId} 
              className={cn(
                "relative transition-all duration-200 hover:shadow-lg",
                isCurrentPlan && "ring-2 ring-primary",
                isPopular && "ring-2 ring-blue-500"
              )}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-3">
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {planId === 'free' && <Globe className="h-8 w-8 text-muted-foreground" />}
                  {planId === 'standard' && <Zap className="h-8 w-8 text-blue-500" />}
                  {planId === 'pro' && <Crown className="h-8 w-8 text-yellow-500" />}
                </div>
                
                <CardTitle className="text-xl">{planDetails.name}</CardTitle>
                <CardDescription>{planDetails.description}</CardDescription>
                
                <div className="pt-2">
                  <span className="text-3xl font-bold">
                    {planDetails.price === 0 ? 'Free' : `$${planDetails.price}`}
                  </span>
                  {planDetails.price > 0 && (
                    <span className="text-muted-foreground">
                      /month
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-3">
                  {Object.entries(planFeatures).map(([key, feature]) => {
                    const IconComponent = feature.icon;
                    const limit = planDetails.limits[key as keyof typeof planDetails.limits];
                    const hasFeature = limit > 0;
                    
                    if (!hasFeature) return null;
                    
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">
                          {feature.label}
                          {limit !== -1 && (
                            <span className="text-muted-foreground ml-1">
                              ({limit === -1 ? 'Unlimited' : limit.toLocaleString()})
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handlePlanSelect(planId as PlanId)}
                      className={cn(
                        "w-full",
                        isPopular && "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      {planId === 'free' ? 'Get Started' : 'Choose Plan'}
                    </Button>
                  )}
                </div>

                {/* Additional Info */}
                {!compact && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground text-center">
                      {planDetails.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Feature Comparison</CardTitle>
            <CardDescription>
              Compare all features across different plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Feature</th>
                    {Object.entries(allPlans).map(([planId, planDetails]) => (
                      <th key={planId} className="text-center py-2 font-medium">
                        {planDetails.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(planFeatures).map(([key, feature]) => (
                    <tr key={key} className="border-b">
                      <td className="py-2 font-medium">{feature.label}</td>
                      {Object.entries(allPlans).map(([planId, planDetails]) => {
                        const limit = planDetails.limits[key as keyof typeof planDetails.limits];
                        const hasFeature = limit > 0;
                        
                        const formatLimit = (value: number, key: string) => {
                          if (key === 'monthlyEvents') {
                            return value >= 1000 ? (value / 1000) + 'K' : value.toLocaleString();
                          }
                          if (key === 'storageGB') {
                            return value + 'GB';
                          }
                          if (key === 'apiCallsPerMonth') {
                            return value >= 1000 ? (value / 1000) + 'K' : value.toLocaleString();
                          }
                          return value === -1 ? 'Unlimited' : value.toLocaleString();
                        };
                        
                        return (
                          <td key={planId} className="text-center py-2">
                            {hasFeature ? (
                              formatLimit(limit, key)
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ Section */}
      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Can I change my plan anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">What happens if I exceed my limits?</h4>
              <p className="text-sm text-muted-foreground">
                You'll receive notifications when approaching limits. Consider upgrading to avoid service interruptions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
