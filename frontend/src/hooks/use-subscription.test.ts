/**
 * Test file demonstrating the useSubscription hook functionality
 * This file shows how to use the various features of the subscription hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSubscription } from './use-subscription';

// Mock the auth store
jest.mock('@/stores/useAuthStore', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}));

// Mock the subscription API
jest.mock('@/lib/subscription-api', () => ({
  getSubscription: jest.fn(),
  getSubscriptionUsage: jest.fn(),
  checkActionLimit: jest.fn(),
  cancelSubscription: jest.fn(),
  upgradeSubscription: jest.fn(),
  checkPermission: jest.fn(),
  getPlanDetails: jest.fn(),
  getAllPlans: jest.fn(),
  isPlanActive: jest.fn(),
  isPlanExpired: jest.fn(),
  getDaysUntilRenewal: jest.fn(),
  getTrialDaysRemaining: jest.fn(),
}));

describe('useSubscription Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should provide comprehensive subscription management', async () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    // Wait for the hook to initialize
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // Check that all expected properties are available
    expect(result.current.subscription).toBeDefined();
    expect(result.current.usage).toBeDefined();
    expect(result.current.limits).toBeDefined();
    expect(result.current.currentPlan).toBeDefined();
    expect(result.current.allPlans).toBeDefined();
    
    // Check state properties
    expect(typeof result.current.isLoading).toBe('boolean');
    expect(typeof result.current.hasError).toBe('boolean');
    expect(typeof result.current.isActive).toBe('boolean');
    expect(typeof result.current.isExpired).toBe('boolean');
    
    // Check core functions
    expect(typeof result.current.getUsagePercentage).toBe('function');
    expect(typeof result.current.getUsageColor).toBe('function');
    expect(typeof result.current.isUsageNearLimit).toBe('function');
    expect(typeof result.current.getRemainingCapacity).toBe('function');
    expect(typeof result.current.canPerformAction).toBe('function');
    expect(typeof result.current.checkLimit).toBe('function');
    
    // Check subscription management
    expect(typeof result.current.cancelSubscription).toBe('function');
    expect(typeof result.current.upgradeSubscription).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
    
    // Check enhanced utilities
    expect(typeof result.current.isTrialActive).toBe('function');
    expect(typeof result.current.isLifetimePlan).toBe('function');
    expect(typeof result.current.canUpgrade).toBe('function');
    expect(typeof result.current.canDowngrade).toBe('function');
    expect(typeof result.current.getUpgradePrice).toBe('function');
    expect(typeof result.current.isFeatureAvailable).toBe('function');
    expect(typeof result.current.getPlanComparison).toBe('function');
    expect(typeof result.current.getSubscriptionStatus).toBe('function');
    expect(typeof result.current.getBillingInfo).toBe('function');
    expect(typeof result.current.getSubscriptionAnalytics).toBe('function');
    expect(typeof result.current.getUpgradeRecommendations).toBe('function');
    expect(typeof result.current.validateSubscriptionAction).toBe('function');
    expect(typeof result.current.exportSubscriptionData).toBe('function');
  });

  it('should handle usage calculations correctly', async () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // Test usage percentage calculation
    const percentage = result.current.getUsagePercentage('websites');
    expect(typeof percentage).toBe('number');
    expect(percentage).toBeGreaterThanOrEqual(0);
    expect(percentage).toBeLessThanOrEqual(100);

    // Test usage color
    const color = result.current.getUsageColor('websites');
    expect(typeof color).toBe('string');
    expect(['bg-red-500', 'bg-yellow-500', 'bg-green-500']).toContain(color);

    // Test remaining capacity
    const remaining = result.current.getRemainingCapacity('websites');
    expect(typeof remaining).toBe('number');
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  it('should provide subscription status information', async () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const status = result.current.getSubscriptionStatus();
    expect(status).toBeDefined();
    expect(status.status).toBeDefined();
    expect(status.label).toBeDefined();
    expect(status.color).toBeDefined();
    expect(status.description).toBeDefined();
  });

  it('should handle plan comparisons', async () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const comparison = result.current.getPlanComparison('free', 'standard');
    expect(comparison).toBeDefined();
    expect(comparison.plan1).toBeDefined();
    expect(comparison.plan2).toBeDefined();
    expect(typeof comparison.priceDifference).toBe('number');
    expect(typeof comparison.isUpgrade).toBe('boolean');
  });

  it('should validate subscription actions', async () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const validation = result.current.validateSubscriptionAction('upgrade');
    expect(validation).toBeDefined();
    expect(typeof validation.valid).toBe('boolean');
    expect(typeof validation.reason).toBe('string');
  });

  it('should provide upgrade recommendations', async () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const recommendations = result.current.getUpgradeRecommendations();
    expect(Array.isArray(recommendations)).toBe(true);
    
    if (recommendations.length > 0) {
      const recommendation = recommendations[0];
      expect(recommendation.plan).toBeDefined();
      expect(recommendation.reason).toBeDefined();
      expect(['high', 'medium', 'low']).toContain(recommendation.priority);
      expect(Array.isArray(recommendation.benefits)).toBe(true);
    }
  });

  it('should export subscription data', async () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const exportedData = result.current.exportSubscriptionData();
    if (exportedData) {
      expect(exportedData.subscription).toBeDefined();
      expect(exportedData.usage).toBeDefined();
      expect(exportedData.limits).toBeDefined();
      expect(exportedData.planDetails).toBeDefined();
      expect(exportedData.exportDate).toBeDefined();
    }
  });
});

/**
 * Example usage patterns for the useSubscription hook:
 * 
 * 1. Basic subscription display:
 * ```tsx
 * const { subscription, currentPlan, isLoading } = useSubscription();
 * if (isLoading) return <div>Loading...</div>;
 * return <div>Current Plan: {currentPlan.name}</div>;
 * ```
 * 
 * 2. Usage monitoring:
 * ```tsx
 * const { getUsagePercentage, isUsageNearLimit } = useSubscription();
 * const websiteUsage = getUsagePercentage('websites');
 * const isNearLimit = isUsageNearLimit('websites', 90);
 * ```
 * 
 * 3. Upgrade recommendations:
 * ```tsx
 * const { getUpgradeRecommendations, upgradeSubscription } = useSubscription();
 * const recommendations = getUpgradeRecommendations();
 * recommendations.forEach(rec => {
 *   if (rec.priority === 'high') {
 *     // Show prominent upgrade button
 *   }
 * });
 * ```
 * 
 * 4. Feature gating:
 * ```tsx
 * const { isFeatureAvailable, canPerformAction } = useSubscription();
 * if (isFeatureAvailable('AI Optimization Assistant')) {
 *   // Show AI features
 * }
 * if (canPerformAction('websites', currentWebsiteCount)) {
 *   // Allow creating new website
 * }
 * ```
 * 
 * 5. Subscription analytics:
 * ```tsx
 * const { getSubscriptionAnalytics, getBillingInfo } = useSubscription();
 * const analytics = getSubscriptionAnalytics();
 * const billing = getBillingInfo();
 * 
 * if (analytics?.overallUsage.isNearLimit) {
 *   // Show upgrade warning
 * }
 * ```
 */
