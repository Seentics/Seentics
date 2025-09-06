import { 
  type Subscription, 
  type SubscriptionUsage, 
  type SubscriptionLimits,
  type PlanId,
  getSubscription,
  getSubscriptionUsage,
  checkActionLimit,
  cancelSubscription,
  upgradeSubscription,
  checkPermission,
  getPlanDetails,
  getAllPlans,
  isPlanActive,
  isPlanExpired,
  getDaysUntilRenewal,
  getTrialDaysRemaining
} from './subscription-api';

export class SubscriptionService {
  private static instance: SubscriptionService;
  private currentSubscription: Subscription | null = null;
  private currentUsage: SubscriptionUsage | null = null;
  private currentLimits: SubscriptionLimits | null = null;
  private lastUpdated: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Get current subscription with caching
   */
  public async getCurrentSubscription(): Promise<Subscription | null> {
    const now = Date.now();
    
    if (this.currentSubscription && (now - this.lastUpdated) < this.CACHE_DURATION) {
      return this.currentSubscription;
    }

    try {
      const subscription = await getSubscription();
      this.currentSubscription = subscription;
      this.lastUpdated = now;
      return subscription;
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      return this.currentSubscription; // Return cached version if available
    }
  }

  /**
   * Get current usage and limits with caching
   */
  public async getCurrentUsage(): Promise<{ usage: SubscriptionUsage; limits: SubscriptionLimits } | null> {
    const now = Date.now();
    
    if (this.currentUsage && this.currentLimits && (now - this.lastUpdated) < this.CACHE_DURATION) {
      return { usage: this.currentUsage, limits: this.currentLimits };
    }

    try {
      const usageData = await getSubscriptionUsage();
      if (usageData) {
        this.currentUsage = usageData.usage;
        this.currentLimits = usageData.limits;
        this.lastUpdated = now;
        return usageData;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch usage:', error);
      return this.currentUsage && this.currentLimits 
        ? { usage: this.currentUsage, limits: this.currentLimits }
        : null;
    }
  }

  /**
   * Check if user can perform an action
   */
  public async canPerformAction(action: keyof SubscriptionUsage, count: number = 1): Promise<boolean> {
    try {
      const limitCheck = await checkActionLimit(action, count);
      return limitCheck?.canPerform ?? false;
    } catch (error) {
      console.error('Failed to check action limit:', error);
      return false;
    }
  }

  /**
   * Check permission for a specific resource type
   */
  public checkPermission(
    type: 'websites' | 'workflows' | 'monthlyEvents' | 'aiOptimizations',
    currentCount: number
  ): { allowed: boolean; planName: string; limit: number; remaining: number } {
    return checkPermission(type, currentCount, this.currentSubscription);
  }

  /**
   * Get plan details
   */
  public getPlanDetails(planId: PlanId) {
    return getPlanDetails(planId);
  }

  /**
   * Get all available plans
   */
  public getAllPlans() {
    return getAllPlans();
  }

  /**
   * Check if subscription is active
   */
  public isSubscriptionActive(): boolean {
    return isPlanActive(this.currentSubscription);
  }

  /**
   * Check if subscription is expired
   */
  public isSubscriptionExpired(): boolean {
    return isPlanExpired(this.currentSubscription);
  }

  /**
   * Get days until renewal
   */
  public getDaysUntilRenewal(): number | null {
    return getDaysUntilRenewal(this.currentSubscription);
  }

  /**
   * Get trial days remaining
   */
  public getTrialDaysRemaining(): number | null {
    return getTrialDaysRemaining(this.currentSubscription);
  }

  /**
   * Cancel subscription
   */
  public async cancelSubscription(): Promise<boolean> {
    try {
      const success = await cancelSubscription();
      if (success) {
        // Invalidate cache
        this.currentSubscription = null;
        this.currentUsage = null;
        this.currentLimits = null;
        this.lastUpdated = 0;
      }
      return success;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }

  /**
   * Upgrade subscription
   */
  public async upgradeSubscription(planId: PlanId): Promise<boolean> {
    try {
      const success = await upgradeSubscription(planId);
      if (success) {
        // Invalidate cache to fetch updated subscription
        this.currentSubscription = null;
        this.currentUsage = null;
        this.currentLimits = null;
        this.lastUpdated = 0;
      }
      return success;
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      return false;
    }
  }

  /**
   * Get usage percentage for a specific resource
   */
  public getUsagePercentage(type: keyof SubscriptionUsage): number {
    if (!this.currentUsage || !this.currentLimits) return 0;
    
    const current = this.currentUsage[type];
    const limit = this.currentLimits[type];
    
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  }

  /**
   * Get usage color based on percentage
   */
  public getUsageColor(type: keyof SubscriptionUsage): string {
    const percentage = this.getUsagePercentage(type);
    
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  /**
   * Check if usage is near limit
   */
  public isUsageNearLimit(type: keyof SubscriptionUsage, threshold: number = 80): boolean {
    const percentage = this.getUsagePercentage(type);
    return percentage >= threshold;
  }

  /**
   * Get remaining capacity for a resource
   */
  public getRemainingCapacity(type: keyof SubscriptionUsage): number {
    if (!this.currentUsage || !this.currentLimits) return 0;
    
    const current = this.currentUsage[type];
    const limit = this.currentLimits[type];
    
    return Math.max(0, limit - current);
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.currentSubscription = null;
    this.currentUsage = null;
    this.currentLimits = null;
    this.lastUpdated = 0;
  }

  /**
   * Refresh data from server
   */
  public async refresh(): Promise<void> {
    this.clearCache();
    await this.getCurrentSubscription();
    await this.getCurrentUsage();
  }

  /**
   * Get subscription summary
   */
  public getSubscriptionSummary(): {
    planName: string;
    status: string;
    isActive: boolean;
    isExpired: boolean;
    daysUntilRenewal: number | null;
    trialDaysRemaining: number | null;
    usageSummary: {
      websites: { current: number; limit: number; percentage: number };
      workflows: { current: number; limit: number; percentage: number };
      monthlyEvents: { current: number; limit: number; percentage: number };
      aiOptimizations: { current: number; limit: number; percentage: number };
    };
  } | null {
    if (!this.currentSubscription || !this.currentUsage || !this.currentLimits) {
      return null;
    }

    return {
      planName: this.currentSubscription.plan,
      status: this.currentSubscription.status,
      isActive: this.isSubscriptionActive(),
      isExpired: this.isSubscriptionExpired(),
      daysUntilRenewal: this.getDaysUntilRenewal(),
      trialDaysRemaining: this.getTrialDaysRemaining(),
      usageSummary: {
        websites: {
          current: this.currentUsage.websites,
          limit: this.currentLimits.websites,
          percentage: this.getUsagePercentage('websites')
        },
        workflows: {
          current: this.currentUsage.workflows,
          limit: this.currentLimits.workflows,
          percentage: this.getUsagePercentage('workflows')
        },
        monthlyEvents: {
          current: this.currentUsage.monthlyEvents,
          limit: this.currentLimits.monthlyEvents,
          percentage: this.getUsagePercentage('monthlyEvents')
        },
        aiOptimizations: {
          current: this.currentUsage.aiOptimizations,
          limit: this.currentLimits.aiOptimizations,
          percentage: this.getUsagePercentage('aiOptimizations')
        }
      }
    };
  }
}

// Export singleton instance
export const subscriptionService = SubscriptionService.getInstance();
