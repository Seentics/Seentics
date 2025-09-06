
import api from './api';

const plans = {
  free: {
    name: 'Free',
    description: 'Perfect for getting started',
    limits: {
      websites: 1,
      workflows: 3,
      funnels: 2,
      monthlyEvents: 5000,
      aiOptimizations: 2,
      teamMembers: 1,
      apiCallsPerMonth: 1000,
      storageGB: 1,
      customDomains: 0,
    },
    price: 0,
    features: ['Basic Analytics', 'Community Support', 'Basic Funnels'],
  },
  standard: {
    name: 'Standard',
    description: 'Great for growing businesses',
    limits: {
      websites: 3,
      workflows: 25,
      funnels: 10,
      monthlyEvents: 100000,
      aiOptimizations: 25,
      teamMembers: 3,
      apiCallsPerMonth: 10000,
      storageGB: 10,
      customDomains: 1,
    },
    price: 19,
    features: ['Advanced Analytics', 'Email Support', 'Custom Domains', 'UTM Tracking', 'Advanced Funnels', 'Funnel Analytics'],
  },
  pro: {
    name: 'Pro',
    description: 'For serious professionals and teams',
    limits: {
      websites: 10,
      workflows: 100,
      funnels: 50,
      monthlyEvents: 500000,
      aiOptimizations: 100,
      teamMembers: 10,
      apiCallsPerMonth: 100000,
      storageGB: 100,
      customDomains: 5,
    },
    price: 49,
    features: ['AI Optimization Assistant', 'Priority Support', 'Advanced Integrations', 'Custom Branding', 'Team Collaboration', 'API Access', 'Unlimited Funnels', 'Funnel A/B Testing'],
  },
};

export type PlanId = keyof typeof plans;

export type SubscriptionUsage = {
  websites: number;
  workflows: number;
  funnels: number;
  monthlyEvents: number;
  aiOptimizations: number;
  teamMembers: number;
  apiCallsPerMonth: number;
  storageGB: number;
  customDomains: number;
};

export type SubscriptionLimits = {
  websites: number;
  workflows: number;
  funnels: number;
  monthlyEvents: number;
  aiOptimizations: number;
  teamMembers: number;
  apiCallsPerMonth: number;
  storageGB: number;
  customDomains: number;
};

export type Subscription = {
  plan: PlanId;
  status: 'active' | 'cancelled' | 'expired' | 'on_trial' | 'paused';
  renewsAt?: string | null;
  endsAt?: string | null;
  trialEndsAt?: string | null;
  lemonSqueezyId?: string;
  usage?: SubscriptionUsage;
  limits?: SubscriptionLimits;
  nextBillingDate?: string | null;
  billingInfo?: {
    customerEmail?: string;
    customerName?: string;
    currency?: string;
    price?: number;
    interval?: string;
  };
};

export type SubscriptionResponse = {
  success: boolean;
  data?: {
    subscription?: Subscription;
    usage?: SubscriptionUsage;
    limits?: SubscriptionLimits;
  };
  message?: string;
};

export async function getSubscription(): Promise<Subscription | null> {
  try {
    const response = await api.get('/user/subscriptions/current');
    const data = response.data as SubscriptionResponse;
    
    if (data.success && data.data?.subscription) {
      return data.data.subscription;
    }
    
    // Return default free plan if no subscription found
    return { 
      plan: 'free', 
      status: 'active',
      usage: { websites: 0, workflows: 0, monthlyEvents: 0, aiOptimizations: 0, teamMembers: 0, apiCallsPerMonth: 0, storageGB: 0, customDomains: 0 },
      limits: plans.free.limits
    };
  } catch (error) {
    console.error("Could not fetch subscription:", error);
    // Return default free plan on error
    return { 
      plan: 'free', 
      status: 'active',
      usage: { websites: 0, workflows: 0, monthlyEvents: 0, aiOptimizations: 0, teamMembers: 0, apiCallsPerMonth: 0, storageGB: 0, customDomains: 0 },
      limits: plans.free.limits
    };
  }
}

export async function getSubscriptionUsage(): Promise<{ usage: SubscriptionUsage; limits: SubscriptionLimits } | null> {
  try {
    const response = await api.get('/user/subscriptions/usage');
    const data = response.data as SubscriptionResponse;
    
    if (data.success && data.data?.usage && data.data?.limits) {
      return {
        usage: data.data.usage,
        limits: data.data.limits
      };
    }
    
    return null;
  } catch (error) {
    console.error("Could not fetch subscription usage:", error);
    return null;
  }
}

export async function checkActionLimit(action: keyof SubscriptionUsage, count: number = 1): Promise<{
  canPerform: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
} | null> {
  try {
    const response = await api.post('/user/subscriptions/check-limit', {
      action,
      count
    });
    const data = response.data as SubscriptionResponse;
    
    if (data.success && data.data) {
      return data.data as {
        canPerform: boolean;
        currentUsage: number;
        limit: number;
        remaining: number;
      };
    }
    
    return null;
  } catch (error) {
    console.error("Could not check action limit:", error);
    return null;
  }
}

export async function cancelSubscription(): Promise<boolean> {
  try {
    const response = await api.post('/user/subscriptions/cancel');
    const data = response.data as SubscriptionResponse;
    
    if (data.success) {
      return true;
    }
    
    console.error('Failed to cancel subscription:', data.message);
    return false;
  } catch (error) {
    console.error("Could not cancel subscription:", error);
    return false;
  }
}

export async function upgradeSubscription(planId: PlanId): Promise<boolean> {
  try {
    const planCheckoutLinks: Record<PlanId, string> = {
      free: '/websites',
      standard: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STANDARD_CHECKOUT || 'https://seentics.lemonsqueezy.com/checkout/buy/c23b8f1c-7f24-4258-b638-342247b41d0c',
      pro: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRO_CHECKOUT || 'https://seentics.lemonsqueezy.com/checkout/buy/d4a6540c-11e2-4328-8547-14578b746369'
    } as any;
    const url = planCheckoutLinks[planId] || planCheckoutLinks.free;
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
    return true;
  } catch (error) {
    console.error("Could not upgrade subscription:", error);
    return false;
  }
}

export function checkPermission(
  type: 'websites' | 'workflows' | 'monthlyEvents' | 'aiOptimizations',
  currentCount: number,
  subscription: Subscription | null | undefined
): { allowed: boolean; planName: string; limit: number; remaining: number } {
  const planId = subscription?.plan || 'free';
  const planDetails = plans[planId];
  const planName = planDetails.name;
  
  let limit: number;
  let remaining: number;
  
  switch (type) {
    case 'websites':
      limit = planDetails.limits.websites;
      break;
    case 'workflows':
      limit = planDetails.limits.workflows;
      break;
    case 'monthlyEvents':
      limit = planDetails.limits.monthlyEvents;
      break;
    case 'aiOptimizations':
      limit = planDetails.limits.aiOptimizations;
      break;
    default:
      limit = 0;
  }
  
  remaining = Math.max(0, limit - currentCount);
  const allowed = currentCount < limit;
  
  return { allowed, planName, limit, remaining };
}

export function getPlanDetails(planId: PlanId) {
  return plans[planId] || plans.free;
}

export function getAllPlans() {
  return plans;
}

export function isPlanActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  return ['active', 'on_trial', 'lifetime'].includes(subscription.status);
}

export function isPlanExpired(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  return ['expired', 'cancelled'].includes(subscription.status);
}

export function getDaysUntilRenewal(subscription: Subscription | null): number | null {
  if (!subscription?.renewsAt) return null;
  
  const now = new Date();
  const renewalDate = new Date(subscription.renewsAt);
  const diffTime = renewalDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

export function getTrialDaysRemaining(subscription: Subscription | null): number | null {
  if (!subscription?.trialEndsAt) return null;
  
  const now = new Date();
  const trialEndDate = new Date(subscription.trialEndsAt);
  const diffTime = trialEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}