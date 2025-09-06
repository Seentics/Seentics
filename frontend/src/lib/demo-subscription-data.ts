import { Subscription } from './subscription-api';

// =============================================================================
// DEMO SUBSCRIPTION DATA
// =============================================================================

export interface DemoSubscriptionUsage {
  page_views: {
    current: number;
    limit: number;
    percentage: number;
  };
  unique_visitors: {
    current: number;
    limit: number;
    percentage: number;
  };
  custom_events: {
    current: number;
    limit: number;
    percentage: number;
  };
  workflows: {
    current: number;
    limit: number;
    percentage: number;
  };
  data_retention_days: {
    current: number;
    limit: number;
    percentage: number;
  };
}

export interface DemoPlanDetails {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    page_views: number;
    unique_visitors: number;
    custom_events: number;
    workflows: number;
    data_retention_days: number;
    team_members: number;
    priority_support: boolean;
    advanced_analytics: boolean;
    custom_domains: boolean;
    api_access: boolean;
  };
  popular?: boolean;
  recommended?: boolean;
}

export class DemoSubscriptionData {
  // =============================================================================
  // SUBSCRIPTION DATA
  // =============================================================================

  static getSubscription(): Subscription {
    return {
      id: 'demo-sub-123',
      user_id: 'demo-user-123',
      plan: 'pro',
      status: 'active',
      current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      cancel_at_period_end: false,
      trial_end: null,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
      updated_at: new Date().toISOString(),
      stripe_subscription_id: 'demo_stripe_sub_123',
      stripe_customer_id: 'demo_stripe_customer_123',
      metadata: {
        website_count: '3',
        team_size: '5',
        industry: 'SaaS'
      }
    };
  }

  // =============================================================================
  // USAGE DATA
  // =============================================================================

  static getSubscriptionUsage(): DemoSubscriptionUsage {
    return {
      page_views: {
        current: 125000,
        limit: 200000,
        percentage: 62.5
      },
      unique_visitors: {
        current: 45000,
        limit: 75000,
        percentage: 60
      },
      custom_events: {
        current: 85000,
        limit: 150000,
        percentage: 56.7
      },
      workflows: {
        current: 8,
        limit: 15,
        percentage: 53.3
      },
      data_retention_days: {
        current: 90,
        limit: 90,
        percentage: 100
      }
    };
  }

  // =============================================================================
  // PLAN DETAILS
  // =============================================================================

  static getPlanDetails(planId: string): DemoPlanDetails | null {
    const plans: Record<string, DemoPlanDetails> = {
      free: {
        id: 'free',
        name: 'Free',
        price: 0,
        billing_cycle: 'monthly',
        features: [
          'Up to 1,000 page views/month',
          'Basic analytics',
          '1 website',
          'Email support',
          'Basic workflows'
        ],
        limits: {
          page_views: 1000,
          unique_visitors: 500,
          custom_events: 1000,
          workflows: 2,
          data_retention_days: 30,
          team_members: 1,
          priority_support: false,
          advanced_analytics: false,
          custom_domains: false,
          api_access: false
        }
      },
      starter: {
        id: 'starter',
        name: 'Starter',
        price: 29,
        billing_cycle: 'monthly',
        features: [
          'Up to 50,000 page views/month',
          'Advanced analytics',
          'Up to 3 websites',
          'Priority email support',
          'Advanced workflows',
          'Custom events tracking'
        ],
        limits: {
          page_views: 50000,
          unique_visitors: 15000,
          custom_events: 50000,
          workflows: 5,
          data_retention_days: 60,
          team_members: 3,
          priority_support: false,
          advanced_analytics: true,
          custom_domains: false,
          api_access: false
        }
      },
      pro: {
        id: 'pro',
        name: 'Professional',
        price: 79,
        billing_cycle: 'monthly',
        popular: true,
        features: [
          'Up to 200,000 page views/month',
          'Advanced analytics & insights',
          'Up to 10 websites',
          'Priority support',
          'Unlimited workflows',
          'Custom events & conversions',
          'Team collaboration',
          'Advanced reporting'
        ],
        limits: {
          page_views: 200000,
          unique_visitors: 75000,
          custom_events: 150000,
          workflows: 15,
          data_retention_days: 90,
          team_members: 10,
          priority_support: true,
          advanced_analytics: true,
          custom_domains: true,
          api_access: true
        }
      },
      enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        billing_cycle: 'monthly',
        recommended: true,
        features: [
          'Unlimited page views',
          'Enterprise analytics suite',
          'Unlimited websites',
          'Dedicated support',
          'Advanced automation',
          'Custom integrations',
          'White-label options',
          'Advanced security',
          'SLA guarantees'
        ],
        limits: {
          page_views: -1, // Unlimited
          unique_visitors: -1, // Unlimited
          custom_events: -1, // Unlimited
          workflows: -1, // Unlimited
          data_retention_days: 365,
          team_members: -1, // Unlimited
          priority_support: true,
          advanced_analytics: true,
          custom_domains: true,
          api_access: true
        }
      }
    };

    return plans[planId] || null;
  }

  // =============================================================================
  // ALL PLANS
  // =============================================================================

  static getAllPlans(): DemoPlanDetails[] {
    return [
      this.getPlanDetails('free')!,
      this.getPlanDetails('starter')!,
      this.getPlanDetails('pro')!,
      this.getPlanDetails('enterprise')!
    ];
  }

  // =============================================================================
  // PLAN STATUS
  // =============================================================================

  static isPlanActive(planId: string): boolean {
    const subscription = this.getSubscription();
    return subscription.plan === planId && subscription.status === 'active';
  }

  static getDaysUntilRenewal(): number {
    const subscription = this.getSubscription();
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getTrialDaysRemaining(): number | null {
    // Demo subscription doesn't have a trial
    return null;
  }

  // =============================================================================
  // BILLING HISTORY
  // =============================================================================

  static getBillingHistory() {
    return [
      {
        id: 'inv_001',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 79.00,
        status: 'paid',
        description: 'Professional Plan - Monthly',
        invoice_url: '#'
      },
      {
        id: 'inv_002',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 79.00,
        status: 'paid',
        description: 'Professional Plan - Monthly',
        invoice_url: '#'
      },
      {
        id: 'inv_003',
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 79.00,
        status: 'paid',
        description: 'Professional Plan - Monthly',
        invoice_url: '#'
      }
    ];
  }

  // =============================================================================
  // UPGRADE OPPORTUNITIES
  // =============================================================================

  static getUpgradeOpportunities() {
    const usage = this.getSubscriptionUsage();
    
    return [
      {
        metric: 'Page Views',
        current: usage.page_views.current,
        limit: usage.page_views.limit,
        percentage: usage.page_views.percentage,
        recommendation: usage.page_views.percentage > 80 ? 'Consider upgrading to handle more traffic' : null
      },
      {
        metric: 'Unique Visitors',
        current: usage.unique_visitors.current,
        limit: usage.unique_visitors.limit,
        percentage: usage.unique_visitors.percentage,
        recommendation: usage.unique_visitors.percentage > 80 ? 'Upgrade for better visitor insights' : null
      },
      {
        metric: 'Custom Events',
        current: usage.custom_events.current,
        limit: usage.custom_events.limit,
        percentage: usage.custom_events.percentage,
        recommendation: usage.custom_events.percentage > 80 ? 'More events tracking available with upgrade' : null
      }
    ].filter(item => item.recommendation);
  }
}

// =============================================================================
// DEMO HOOKS (REPLACEMENT FOR REAL API HOOKS)
// =============================================================================

export const useDemoSubscription = () => {
  return {
    data: DemoSubscriptionData.getSubscription(),
    isLoading: false,
    error: null,
  };
};

export const useDemoSubscriptionUsage = () => {
  return {
    data: DemoSubscriptionData.getSubscriptionUsage(),
    isLoading: false,
    error: null,
  };
};

export const useDemoBillingHistory = () => {
  return {
    data: DemoSubscriptionData.getBillingHistory(),
    isLoading: false,
    error: null,
  };
};

export const useDemoUpgradeOpportunities = () => {
  return {
    data: DemoSubscriptionData.getUpgradeOpportunities(),
    isLoading: false,
    error: null,
  };
};
