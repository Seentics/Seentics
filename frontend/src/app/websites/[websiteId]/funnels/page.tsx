'use client';

import { FunnelsTable } from '@/components/funnels-table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useFunnels } from '@/lib/analytics-api';
import { useAuth } from '@/stores/useAuthStore';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FunnelsPageProps {
  params: {
    websiteId: string;
  };
}

export default function FunnelsPage({ params }: FunnelsPageProps) {
  const { websiteId } = params;
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: funnels = [], isLoading: isLoadingFunnels } = useFunnels(websiteId);

  // In open source version, all features are unlimited
  const canAddFunnel = true;
  const planName = 'Open Source';

  // Real metrics from actual funnel data
  const totalFunnels = funnels?.length || 0;
  const activeFunnelsCount = Array.isArray(funnels) ? funnels.filter(f => f.is_active).length : 0;

  // Calculate real metrics from funnel analytics
  const [overviewStats, setOverviewStats] = useState({
    totalVisitors: 0,
    avgConversionRate: 0
  });

  // Fetch analytics for all funnels to calculate overview stats
  useEffect(() => {
    if (funnels.length > 0) {
      const fetchOverviewStats = async () => {
        try {
          let totalVisitors = 0;
          let totalConversions = 0;
          let totalConversionRate = 0;
          let funnelCount = 0;

          for (const funnel of funnels) {
            try {
              const response = await fetch(`/api/v1/funnels/${funnel.id}/analytics?days=7`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state.access_token : ''}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.ok) {
                const data = await response.json();
                // Handle both response formats: direct object or analytics array
                const analytics = data.analytics?.[0] || data;
                if (analytics && (analytics.total_starts !== undefined || analytics.total_conversions !== undefined)) {
                  totalVisitors += analytics.total_starts || 0;
                  totalConversions += analytics.total_conversions || 0;
                  funnelCount++;
                }
              }
            } catch (error) {
              console.error(`Error fetching analytics for funnel ${funnel.id}:`, error);
            }
          }

          // Calculate average conversion rate
          if (totalVisitors > 0) {
            totalConversionRate = (totalConversions / totalVisitors) * 100;
          }

          setOverviewStats({
            totalVisitors,
            avgConversionRate: totalConversionRate
          });
        } catch (error) {
          console.error('Error calculating overview stats:', error);
        }
      };

      fetchOverviewStats();
    }
  }, [funnels]);

  const totalVisitors = overviewStats.totalVisitors;
  const avgConversionRate = overviewStats.avgConversionRate;

  const CreateFunnelButton = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            <Button asChild size="lg" disabled={!canAddFunnel || !websiteId} className="shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow">
              <Link href={`/websites/${websiteId}/funnels/edit/new`} onClick={() => console.log('Create Funnel clicked, navigating to:', `/websites/${websiteId}/funnels/edit/new`)}>
                <PlusCircle className="mr-2" />
                Create Funnel
              </Link>
            </Button>
          </div>
        </TooltipTrigger>
        {!canAddFunnel && (
          <TooltipContent>
            <p>You've reached the funnel limit for the {planName} plan. Please upgrade to add more.</p>
          </TooltipContent>
        )}
        {!websiteId && (
          <TooltipContent>
            <p>Please select a site to create a funnel.</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-6">
      {/* Header Section with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            Conversion Funnels
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and monitor your conversion funnels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateFunnelButton />
        </div>
      </div>


      {/* Key Metrics - Unified Cards Container (analytics-style) */}
      <div className="bg-white dark:bg-transparent  dark:border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
          {/* Total Funnels */}
          <div className="group cursor-default hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 p-6">
            <div className="flex items-center justify-between pb-2.5">
              <div className="text-sm font-semibold text-foreground/90 truncate pr-2">Total Funnels</div>
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-2xl font-bold leading-tight text-foreground group-hover:text-foreground/90 transition-colors">{totalFunnels}</div>
            </div>
          </div>

          {/* Active Funnels */}
          <div className="group cursor-default hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 p-6">
            <div className="flex items-center justify-between pb-2.5">
              <div className="text-sm font-semibold text-foreground/90 truncate pr-2">Active Funnels</div>
              <div className="p-2 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-2xl font-bold leading-tight text-foreground group-hover:text-foreground/90 transition-colors">{activeFunnelsCount}</div>
            </div>
          </div>

          {/* Total Visitors */}
          <div className="group cursor-default hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 p-6">
            <div className="flex items-center justify-between pb-2.5">
              <div className="text-sm font-semibold text-foreground/90 truncate pr-2">Total Visitors</div>
              <div className="p-2 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-2xl font-bold leading-tight text-foreground group-hover:text-foreground/90 transition-colors">{totalVisitors.toLocaleString()}</div>
            </div>
          </div>

          {/* Avg Conversion Rate */}
          <div className="group cursor-default hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 p-6">
            <div className="flex items-center justify-between pb-2.5">
              <div className="text-sm font-semibold text-foreground/90 truncate pr-2">Avg Conversion Rate</div>
              <div className="p-2 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h3a2 2 0 012 2v14a2 2 0 01-2 2h-3a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-2xl font-bold leading-tight text-foreground group-hover:text-foreground/90 transition-colors">{`${avgConversionRate.toFixed(1)}%`}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Funnels Table - Core Data */}
      <div>
        <FunnelsTable siteId={websiteId} />
      </div>


    </div>
  );
}
