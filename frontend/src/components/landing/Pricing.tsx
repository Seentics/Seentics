import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Globe, Zap, BarChart3, Sparkles, Crown, ShieldCheck, Headphones, Star, TrendingUp, Clock, Users } from 'lucide-react';
import { getAllPlans } from '@/lib/subscription-api';

const PLAN_CHECKOUT_URLS = {
  standard: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STANDARD_CHECKOUT || 'https://seentics.lemonsqueezy.com/checkout/buy/c23b8f1c-7f24-4258-b638-342247b41d0c',
  pro: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRO_CHECKOUT || 'https://seentics.lemonsqueezy.com/checkout/buy/d4a6540c-11e2-4328-8547-14578b746369'
};

const PLAN_LABELS: Record<string, { title: string; popular?: boolean; description?: string; savings?: string; highlight?: string }> = {
  free: { 
    title: 'Free', 
    description: 'Perfect for getting started',
    highlight: 'No credit card required'
  },
  standard: { 
    title: 'Standard', 
    popular: true, 
    description: 'Great for growing businesses',
    savings: 'Save 25% vs competitors',
    highlight: 'Most popular choice'
  },
  pro: { 
    title: 'Pro', 
    description: 'For serious professionals and teams',
    savings: 'Save 40% vs competitors',
    highlight: 'Best value for teams'
  },
};

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  
  const startCheckout = (planId: string) => {
    const checkoutUrl = PLAN_CHECKOUT_URLS[planId as keyof typeof PLAN_CHECKOUT_URLS];
    if (!checkoutUrl) {
      alert('Checkout not configured for this plan');
      return;
    }
    
    try {
      const url = new URL(checkoutUrl);
      if (user?.id) url.searchParams.set('checkout[custom][userId]', String(user.id));
      if (user?.email) url.searchParams.set('checkout[email]', String(user.email));
      window.location.href = url.toString();
    } catch (error) {
      console.error('Error creating checkout URL:', error);
      window.location.href = checkoutUrl;
    }
  };
  
  const plans = getAllPlans();
  const ordered = ['free', 'standard', 'pro'].filter((k) => (plans as any)[k]);
  
  const planAccents: Record<string, string> = {
    free: 'bg-slate-50 dark:bg-slate-900/40',
    standard: 'bg-blue-50 dark:bg-blue-900/30',
    pro: 'bg-amber-50 dark:bg-amber-900/30',
  };
  
  const planIcon = (key: string) => {
    if (key === 'free') return <Globe className="h-7 w-7 text-muted-foreground" />;
    if (key === 'standard') return <Zap className="h-7 w-7 text-blue-600 dark:text-blue-400" />;
    return <Crown className="h-7 w-7 text-amber-500" />;
  };
  
  const extras: Record<string, { label: string; icon: JSX.Element }[]> = {
    free: [
      { label: 'Basic Analytics', icon: <BarChart3 className="h-3.5 w-3.5" /> },
      { label: 'Community Support', icon: <Headphones className="h-3.5 w-3.5" /> },
    ],
    standard: [
      { label: 'Advanced Analytics', icon: <BarChart3 className="h-3.5 w-3.5" /> },
      { label: 'Email Support', icon: <Headphones className="h-3.5 w-3.5" /> },
      { label: 'AI Assistant', icon: <Sparkles className="h-3.5 w-3.5" /> },
    ],
    pro: [
      { label: 'Advanced Integrations', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
      { label: 'Priority Support', icon: <Headphones className="h-3.5 w-3.5" /> },
      { label: 'AI Assistant', icon: <Sparkles className="h-3.5 w-3.5" /> },
    ],
  };

  const calculateSavings = (planId: string) => {
    if (planId === 'free') return null;
    const p = (plans as any)[planId];
    const competitorPrice = planId === 'standard' ? 29 : 79;
    const savings = competitorPrice - p.price;
    const savingsPercent = Math.round((savings / competitorPrice) * 100);
    return { amount: savings, percent: savingsPercent };
  };

  const getUsageWarning = (planId: string) => {
    if (planId === 'free') return null;
    const p = (plans as any)[planId];
    
    // Show warnings for plans that might be too restrictive
    if (planId === 'standard' && p.limits.monthlyEvents < 100000) {
      return 'Consider Pro for high-traffic sites';
    }
    if (planId === 'pro' && p.limits.teamMembers < 20) {
      return 'Enterprise plan available for larger teams';
    }
    return null;
  };

  // Get all unique features for comparison table
  const getAllFeatures = () => {
    const features = new Set<string>();
    Object.values(plans).forEach((plan: any) => {
      if (plan.limits) {
        Object.keys(plan.limits).forEach(key => features.add(key));
      }
    });
    return Array.from(features).sort();
  };

  const formatFeatureValue = (value: any, feature: string) => {
    if (feature === 'monthlyEvents') {
      return value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toLocaleString();
    }
    if (feature === 'storageGB') {
      return `${value}GB`;
    }
    if (feature === 'apiCallsPerMonth') {
      return value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toLocaleString();
    }
    return value.toLocaleString();
  };

  return (
    <section id="pricing" className="py-12 md:py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            Limited Time: 25% Off All Plans
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white">
            Start Free, Scale Smart
          </h2>
          <p className="text-base md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-4 mb-6">
            Join 10,000+ businesses using Seentics to boost conversions. 
            <span className="font-semibold text-blue-600 dark:text-blue-400"> No setup fees, no hidden costs.</span>
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Money-back guarantee</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {ordered.map((key, index) => {
            const p = (plans as any)[key];
            const label = PLAN_LABELS[key] || { title: key };
            const priceText = p.price === 0 ? 'Free' : `$${p.price}`;
            const isPopular = !!label.popular || key === 'standard';
            const savings = calculateSavings(key);
            const features = [
              `${p.limits.websites.toLocaleString()} Website${p.limits.websites > 1 ? 's' : ''}`,
              `${p.limits.workflows.toLocaleString()} Workflows`,
              `${p.limits.funnels.toLocaleString()} Funnel${p.limits.funnels > 1 ? 's' : ''}`,
              `${p.limits.monthlyEvents >= 1000 ? (p.limits.monthlyEvents / 1000) + 'K' : p.limits.monthlyEvents.toLocaleString()} Monthly Events`,
              `${p.limits.aiOptimizations.toLocaleString()} AI Optimizations`,
              `${p.limits.teamMembers} Team Member${p.limits.teamMembers > 1 ? 's' : ''}`,
              `${p.limits.storageGB}GB Storage`,
              `${p.limits.customDomains} Custom Domain${p.limits.customDomains > 1 ? 's' : ''}`,
              `${p.limits.apiCallsPerMonth >= 1000 ? (p.limits.apiCallsPerMonth / 1000) + 'K' : p.limits.apiCallsPerMonth.toLocaleString()} API Calls/Month`,
            ];
            const isFree = p.price === 0 || key === 'free';
            
            return (
            <Card 
              key={key}
              className={`relative flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200 dark:border-slate-700 ${planAccents[key]} ${
                isPopular 
                  ? 'ring-2 ring-blue-500/20 bg-white dark:bg-slate-800 scale-105' 
                  : 'bg-white dark:bg-slate-800'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white border-0 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {savings && (
                <div className="absolute -top-3 md:-top-4 right-4">
                  <Badge className="bg-green-600 text-white border-0 px-2 py-1 text-xs">
                    Save ${savings.amount}/mo
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4 md:pb-6 space-y-2">
                <div className="flex items-center gap-3">
                  {planIcon(key)}
                  <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {label.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm md:text-lg text-slate-600 dark:text-slate-300">
                  {label.description}
                </CardDescription>
                {label.highlight && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {label.highlight}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="flex-grow space-y-6 md:space-y-8">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                      {priceText}
                    </span>
                    {p.price > 0 && (
                      <span className="text-base md:text-lg text-slate-600 dark:text-slate-300">/ month</span>
                    )}
                  </div>
                  {savings && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {savings.percent}% less than competitors
                    </div>
                  )}
                  {p.price > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Billed monthly • No annual commitment
                    </div>
                  )}
                </div>
                
                <ul className="space-y-3 md:space-y-4">
                  {features.map((feature, featureIndex) => (
                    <li key={`${key}-${featureIndex}`} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Extras as chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(extras[key] || []).map((ex, i) => (
                    <span key={`${key}-extra-${i}`} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      {ex.icon}
                      <span className="text-slate-700 dark:text-slate-200">{ex.label}</span>
                    </span>
                  ))}
                </div>
                
                {/* Usage Warning */}
                {getUsageWarning(key) && (
                  <div className="pt-2">
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      ⚠️ {getUsageWarning(key)}
                    </div>
                  </div>
                )}
              </CardContent>
              
              <div className="p-4 md:p-6 pt-0">
                <Link href={isFree ? '/login' : '#'} className="w-full">
                  <Button 
                    className={`w-full h-10 md:h-12 text-base md:text-lg font-medium ${
                      isPopular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600'
                    }`}
                    onClick={(e) => {
                      if (!isFree) {
                        e.preventDefault();
                        if (!isAuthenticated) {
                          window.location.href = '/login';
                          return;
                        }
                        startCheckout(key);
                      }
                    }}
                  >
                    {isFree ? 'Start Free' : 'Start Now'}
                  </Button>
                </Link>
                {!isFree && (
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                    Cancel anytime
                  </p>
                )}
              </div>
            </Card>
          )})}
        </div>

        {/* Detailed Usage Comparison Table */}
        <div className="max-w-6xl mx-auto mt-16">
          <h3 className="text-xl md:text-2xl font-semibold text-center text-slate-900 dark:text-white mb-8">
            Detailed Plan Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Feature</th>
                  {ordered.map(key => (
                    <th key={key} className="px-4 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      {PLAN_LABELS[key]?.title || key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {getAllFeatures().map(feature => (
                  <tr key={feature} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </td>
                    {ordered.map(key => {
                      const plan = (plans as any)[key];
                      const value = plan?.limits?.[feature];
                      return (
                        <td key={key} className="px-4 py-3 text-center text-sm font-medium text-slate-900 dark:text-white">
                          {value !== undefined ? formatFeatureValue(value, feature) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Value Proposition Banner */}
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Proven Results</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Average 47% increase in conversion rates</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Quick Setup</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Get started in under 5 minutes</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Trusted by 10K+</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Businesses worldwide choose Seentics</p>
          </div>
        </div>

       
      </div>
    </section>
  );
}