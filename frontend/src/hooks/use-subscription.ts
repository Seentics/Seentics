import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/stores/useAuthStore';
import { 
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
  getTrialDaysRemaining,
  type Subscription,
  type SubscriptionUsage,
  type SubscriptionLimits,
  type PlanId
} from '@/lib/subscription-api';

/**
 * Comprehensive subscription management hook for handling user subscriptions, usage tracking, and plan management.
 * 
 * @example
 * ```tsx
 * function SubscriptionDashboard() {
 *   const {
 *     subscription,
 *     usage,
 *     currentPlan,
 *     isLoading,
 *     getUsagePercentage,
 *     canPerformAction,
 *     upgradeSubscription,
 *     getUpgradeRecommendations
 *   } = useSubscription();
 * 
 *   if (isLoading) return <div>Loading...</div>;
 * 
 *   return (
 *     <div>
 *       <h2>Current Plan: {currentPlan.name}</h2>
 *       <p>Usage: {getUsagePercentage('websites')}% of websites</p>
 *       {getUpgradeRecommendations().map(rec => (
 *         <div key={rec.plan}>
 *           <h3>Upgrade to {rec.plan}</h3>
 *           <p>{rec.reason}</p>
 *           <button onClick={() => upgradeSubscription(rec.plan)}>
 *             Upgrade Now
 *           </button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @returns {Object} Subscription management object with the following properties:
 * 
 * ## Data Properties
 * - `subscription`: Current subscription data
 * - `usage`: Current usage data for all features
 * - `limits`: Current plan limits
 * - `currentPlan`: Details of the current plan
 * - `allPlans`: All available plans
 * 
 * ## State Properties
 * - `isLoading`: Whether subscription data is being fetched
 * - `hasError`: Whether there are any errors
 * - `isActive`: Whether the subscription is active
 * - `isExpired`: Whether the subscription has expired
 * 
 * ## Core Functions
 * - `getUsagePercentage(type)`: Get usage percentage for a specific feature
 * - `getUsageColor(type)`: Get color class for usage visualization
 * - `isUsageNearLimit(type, threshold)`: Check if usage is near the limit
 * - `getRemainingCapacity(type)`: Get remaining capacity for a feature
 * - `canPerformAction(type, currentCount)`: Check if an action is allowed
 * - `checkLimit(action, count)`: Check if an action is within limits
 * 
 * ## Subscription Management
 * - `cancelSubscription()`: Cancel the current subscription
 * - `upgradeSubscription(planId)`: Upgrade to a different plan
 * - `refresh()`: Refresh all subscription data
 * 
 * ## Enhanced Utilities
 * - `isTrialActive()`: Check if trial is active
 * - `isLifetimePlan()`: Check if it's a lifetime plan
 * - `canUpgrade(targetPlan)`: Check if upgrade is possible
 * - `canDowngrade(targetPlan)`: Check if downgrade is possible
 * - `getUpgradePrice(targetPlan)`: Calculate upgrade cost
 * - `isFeatureAvailable(feature)`: Check if a feature is available
 * - `getPlanComparison(plan1, plan2)`: Compare two plans
 * - `getSubscriptionStatus()`: Get formatted status information
 * - `getBillingInfo()`: Get billing information
 * - `getSubscriptionAnalytics()`: Get usage analytics
 * - `getUpgradeRecommendations()`: Get upgrade suggestions
 * - `validateSubscriptionAction(action)`: Validate subscription actions
 * - `exportSubscriptionData()`: Export subscription data
 */
export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current subscription
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription
  } = useQuery<Subscription | null>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await getSubscription();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch usage data
  const {
    data: usageData,
    isLoading: isLoadingUsage,
    error: usageError,
    refetch: refetchUsage
  } = useQuery({
    queryKey: ['subscription-usage', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await getSubscriptionUsage();
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to cancel subscription:', error);
    },
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: upgradeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to upgrade subscription:', error);
    },
  });

  // Check action limit
  const checkLimit = async (action: keyof SubscriptionUsage, count: number = 1) => {
    if (!user) return null;
    return await checkActionLimit(action, count);
  };

  // Permission checks
  const canPerformAction = (type: 'websites' | 'workflows' | 'monthlyEvents' | 'aiOptimizations', currentCount: number) => {
    return checkPermission(type, currentCount, subscription);
  };

  // Usage percentage calculations
  const getUsagePercentage = (type: keyof SubscriptionUsage): number => {
    if (!usageData?.usage || !usageData?.limits) return 0;
    const current = usageData.usage[type];
    const limit = usageData.limits[type];
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  // Usage color based on percentage
  const getUsageColor = (type: keyof SubscriptionUsage): string => {
    const percentage = getUsagePercentage(type);
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Check if usage is near limit
  const isUsageNearLimit = (type: keyof SubscriptionUsage, threshold: number = 80): boolean => {
    const percentage = getUsagePercentage(type);
    return percentage >= threshold;
  };

  // Get remaining capacity
  const getRemainingCapacity = (type: keyof SubscriptionUsage): number => {
    if (!usageData?.usage || !usageData?.limits) return 0;
    const current = usageData.usage[type];
    const limit = usageData.limits[type];
    return Math.max(0, limit - current);
  };

  // Plan information
  const currentPlan = subscription ? getPlanDetails(subscription.plan) : getPlanDetails('free');
  const allPlans = getAllPlans();
  const isActive = isPlanActive(subscription);
  const isExpired = isPlanExpired(subscription);
  const daysUntilRenewal = getDaysUntilRenewal(subscription);
  const trialDaysRemaining = getTrialDaysRemaining(subscription);

  // Loading states
  const isLoading = isLoadingSubscription || isLoadingUsage;
  const hasError = subscriptionError || usageError;

  // Refresh all subscription data
  const refresh = async () => {
    await Promise.all([
      refetchSubscription(),
      refetchUsage()
    ]);
  };

  // Enhanced utility functions
  const isTrialActive = (): boolean => {
    return subscription?.status === 'on_trial' && trialDaysRemaining !== null && trialDaysRemaining > 0;
  };

  // Removed lifetime plan logic - simplified to 3 tiers

  const isCancelled = (): boolean => {
    return subscription?.status === 'cancelled';
  };

  const isPaused = (): boolean => {
    return subscription?.status === 'paused';
  };

  const getNextBillingDate = (): Date | null => {
    if (!subscription?.renewsAt) return null;
    return new Date(subscription.renewsAt);
  };

  const getTrialEndDate = (): Date | null => {
    if (!subscription?.trialEndsAt) return null;
    return new Date(subscription.trialEndsAt);
  };

  const getSubscriptionEndDate = (): Date | null => {
    if (!subscription?.endsAt) return null;
    return new Date(subscription.endsAt);
  };

  const canUpgrade = (targetPlan: PlanId): boolean => {
    if (!subscription) return false;
    
    const currentPlanIndex = Object.keys(allPlans).indexOf(subscription.plan);
    const targetPlanIndex = Object.keys(allPlans).indexOf(targetPlan);
    
    return targetPlanIndex > currentPlanIndex;
  };

  const canDowngrade = (targetPlan: PlanId): boolean => {
    if (!subscription) return false;
    
    const currentPlanIndex = Object.keys(allPlans).indexOf(subscription.plan);
    const targetPlanIndex = Object.keys(allPlans).indexOf(targetPlan);
    
    return targetPlanIndex < currentPlanIndex;
  };

  const getUpgradePrice = (targetPlan: PlanId): number => {
    if (!canUpgrade(targetPlan)) return 0;
    
    const currentPlanPrice = currentPlan.price;
    const targetPlanPrice = allPlans[targetPlan].price;
    
    return targetPlanPrice - currentPlanPrice;
  };

  const getDowngradeRefund = (targetPlan: PlanId): number => {
    if (!canDowngrade(targetPlan)) return 0;
    
    const currentPlanPrice = currentPlan.price;
    const targetPlanPrice = allPlans[targetPlan].price;
    
    return currentPlanPrice - targetPlanPrice;
  };

  const isFeatureAvailable = (feature: string): boolean => {
    if (!subscription) return false;
    
    const planFeatures = currentPlan.features;
    return planFeatures.includes(feature);
  };

  const getPlanComparison = (plan1: PlanId, plan2: PlanId) => {
    const plan1Details = allPlans[plan1];
    const plan2Details = allPlans[plan2];
    
    return {
      plan1: {
        name: plan1Details.name,
        price: plan1Details.price,
        limits: plan1Details.limits,
        features: plan1Details.features
      },
      plan2: {
        name: plan2Details.name,
        price: plan2Details.price,
        limits: plan2Details.limits,
        features: plan2Details.features
      },
      priceDifference: plan2Details.price - plan1Details.price,
      isUpgrade: plan2Details.price > plan1Details.price
    };
  };

  const getUsageSummary = () => {
    if (!usageData?.usage || !usageData?.limits) return null;
    
    return {
      websites: {
        current: usageData.usage.websites,
        limit: usageData.limits.websites,
        percentage: getUsagePercentage('websites'),
        remaining: getRemainingCapacity('websites'),
        isNearLimit: isUsageNearLimit('websites')
      },
      workflows: {
        current: usageData.usage.workflows,
        limit: usageData.limits.workflows,
        percentage: getUsagePercentage('workflows'),
        remaining: getRemainingCapacity('workflows'),
        isNearLimit: isUsageNearLimit('workflows')
      },
      monthlyEvents: {
        current: usageData.usage.monthlyEvents,
        limit: usageData.limits.monthlyEvents,
        percentage: getUsagePercentage('monthlyEvents'),
        remaining: getRemainingCapacity('monthlyEvents'),
        isNearLimit: isUsageNearLimit('monthlyEvents')
      },
      aiOptimizations: {
        current: usageData.usage.aiOptimizations,
        limit: usageData.limits.aiOptimizations,
        percentage: getUsagePercentage('aiOptimizations'),
        remaining: getRemainingCapacity('aiOptimizations'),
        isNearLimit: isUsageNearLimit('aiOptimizations')
      }
    };
  };

  // Subscription lifecycle management
  const getSubscriptionStatus = (): {
    status: string;
    label: string;
    color: string;
    description: string;
  } => {
    if (!subscription) {
      return {
        status: 'none',
        label: 'No Subscription',
        color: 'text-gray-500',
        description: 'You don\'t have an active subscription'
      };
    }

    switch (subscription.status) {
      case 'active':
        return {
          status: 'active',
          label: 'Active',
          color: 'text-green-600',
          description: 'Your subscription is active and working'
        };
      case 'on_trial':
        return {
          status: 'trial',
          label: 'Trial',
          color: 'text-blue-600',
          description: `Trial ends in ${trialDaysRemaining} days`
        };
      case 'cancelled':
        return {
          status: 'cancelled',
          label: 'Cancelled',
          color: 'text-red-600',
          description: 'Your subscription has been cancelled'
        };
      case 'expired':
        return {
          status: 'expired',
          label: 'Expired',
          color: 'text-red-600',
          description: 'Your subscription has expired'
        };
      case 'paused':
        return {
          status: 'paused',
          label: 'Paused',
          color: 'text-yellow-600',
          description: 'Your subscription is currently paused'
        };
      case 'lifetime':
        return {
          status: 'lifetime',
          label: 'Lifetime',
          color: 'text-purple-600',
          description: 'You have lifetime access to all features'
        };
      default:
        return {
          status: 'unknown',
          label: 'Unknown',
          color: 'text-gray-500',
          description: 'Subscription status is unknown'
        };
    }
  };

  const getBillingInfo = () => {
    if (!subscription?.billingInfo) return null;
    
    return {
      customerEmail: subscription.billingInfo.customerEmail,
      customerName: subscription.billingInfo.customerName,
      currency: subscription.billingInfo.currency || 'USD',
      price: subscription.billingInfo.price,
      interval: subscription.billingInfo.interval || 'monthly',
      nextBillingDate: getNextBillingDate(),
      isRecurring: subscription.status === 'active'
    };
  };

  const getSubscriptionAnalytics = () => {
    if (!usageData?.usage || !usageData?.limits) return null;
    
    const totalUsage = Object.values(usageData.usage).reduce((sum, value) => sum + value, 0);
    const totalLimits = Object.values(usageData.limits).reduce((sum, value) => sum + value, 0);
    const overallUsagePercentage = totalLimits > 0 ? (totalUsage / totalLimits) * 100 : 0;
    
    return {
      overallUsage: {
        percentage: Math.min(overallUsagePercentage, 100),
        totalUsage,
        totalLimits,
        isNearLimit: overallUsagePercentage >= 80
      },
      mostUsedFeature: Object.entries(usageData.usage).reduce((max, [key, value]) => 
        value > max.value ? { key, value } : max, 
        { key: 'websites', value: 0 }
      ),
      leastUsedFeature: Object.entries(usageData.usage).reduce((min, [key, value]) => 
        value < min.value ? { key, value } : min, 
        { key: 'websites', value: Infinity }
      ),
      usageTrends: {
        isGrowing: false, // This would need historical data to calculate
        growthRate: 0,    // This would need historical data to calculate
        projectedOverage: overallUsagePercentage > 100 ? totalUsage - totalLimits : 0
      }
    };
  };

  const getUpgradeRecommendations = (): Array<{
    plan: PlanId;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    benefits: string[];
  }> => {
    if (!usageData?.usage || !usageData?.limits) return [];
    
    const recommendations: Array<{
      plan: PlanId;
      reason: string;
      priority: 'high' | 'medium' | 'low';
      benefits: string[];
    }> = [];
    
    // Check for high usage areas
    const usagePercentages = {
      websites: getUsagePercentage('websites'),
      workflows: getUsagePercentage('workflows'),
      monthlyEvents: getUsagePercentage('monthlyEvents'),
      aiOptimizations: getUsagePercentage('aiOptimizations')
    };
    
    // High priority: usage over 90%
    if (usagePercentages.websites >= 90 || usagePercentages.workflows >= 90) {
      recommendations.push({
        plan: 'standard',
        reason: 'High usage of core features',
        priority: 'high',
        benefits: ['Increased limits', 'Better performance', 'Priority support']
      });
    }
    
    // Medium priority: usage over 75%
    if (usagePercentages.monthlyEvents >= 75 || usagePercentages.aiOptimizations >= 75) {
      recommendations.push({
        plan: 'pro',
        reason: 'Approaching limits on advanced features',
        priority: 'medium',
        benefits: ['Higher event limits', 'More AI optimizations', 'Advanced analytics']
      });
    }
    
    // Low priority: general upgrade suggestion
    if (subscription?.plan === 'free') {
      const totalUsage = Object.values(usageData.usage).reduce((sum, value) => sum + value, 0);
      if (totalUsage > 0) {
        recommendations.push({
          plan: 'standard',
          reason: 'You\'re actively using the platform',
          priority: 'low',
          benefits: ['Remove restrictions', 'Access to premium features', 'Better support']
        });
      }
    }
    
    return recommendations;
  };

  const validateSubscriptionAction = (action: 'create' | 'update' | 'cancel' | 'upgrade' | 'downgrade') => {
    if (!subscription) {
      return { valid: false, reason: 'No subscription found' };
    }
    
    switch (action) {
      case 'create':
        return { valid: false, reason: 'Subscription already exists' };
      case 'update':
        return { valid: true, reason: 'Subscription can be updated' };
      case 'cancel':
            // Simplified plan validation
        return { valid: true, reason: 'Subscription can be cancelled' };
              case 'upgrade':
          return { valid: true, reason: 'Subscription can be upgraded' };
        case 'downgrade':
        return { valid: true, reason: 'Subscription can be downgraded' };
      default:
        return { valid: false, reason: 'Invalid action' };
    }
  };

  const getSubscriptionHistory = () => {
    // This would typically fetch from an API endpoint
    // For now, return mock data structure
    return {
      changes: [],
      invoices: [],
      payments: [],
      refunds: []
    };
  };

  const exportSubscriptionData = () => {
    if (!subscription || !usageData) return null;
    
    return {
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        createdAt: subscription.renewsAt,
        expiresAt: subscription.endsAt,
        trialEndsAt: subscription.trialEndsAt
      },
      usage: usageData.usage,
      limits: usageData.limits,
      planDetails: currentPlan,
      exportDate: new Date().toISOString()
    };
  };

  return {
    // Data
    subscription,
    usage: usageData?.usage,
    limits: usageData?.limits,
    currentPlan,
    allPlans,
    
    // States
    isLoading,
    hasError,
    isActive,
    isExpired,
    
    // Calculations
    daysUntilRenewal,
    trialDaysRemaining,
    getUsagePercentage,
    getUsageColor,
    isUsageNearLimit,
    getRemainingCapacity,
    
    // Actions
    canPerformAction,
    checkLimit,
    cancelSubscription: cancelMutation.mutate,
    upgradeSubscription: upgradeMutation.mutate,
    refresh,
    
    // Mutations
    isCancelling: cancelMutation.isPending,
    isUpgrading: upgradeMutation.isPending,
    cancelError: cancelMutation.error,
    upgradeError: upgradeMutation.error,
    
    // Enhanced utility functions
    isTrialActive,
    // Removed lifetime plan functionality
    isCancelled,
    isPaused,
    getNextBillingDate,
    getTrialEndDate,
    getSubscriptionEndDate,
    canUpgrade,
    canDowngrade,
    getUpgradePrice,
    getDowngradeRefund,
    isFeatureAvailable,
    getPlanComparison,
    getUsageSummary,
    getSubscriptionStatus,
    getBillingInfo,
    getSubscriptionAnalytics,
    getUpgradeRecommendations,
    validateSubscriptionAction,
    getSubscriptionHistory,
    exportSubscriptionData,
    
    // Error handling
    errors: {
      subscription: subscriptionError,
      usage: usageError,
      cancel: cancelMutation.error,
      upgrade: upgradeMutation.error
    }
  };
}
