
'use client';
import { TrafficOverview } from '@/components/analytics/TrafficOverview';
import { DashboardStats } from '@/components/dashboard-stats';
import { Button } from '@/components/ui/button';
import { WorkflowsTable } from '@/components/workflows-table';
import { useDailyStats, useHourlyStats } from '@/lib/analytics-api';
import { BarChart3, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DashboardPage() {
  const params = useParams();
  const siteId = params?.websiteId as string

  // Traffic overview data (real API)
  const { data: dailyStats, isLoading: loadingDaily } = useDailyStats(siteId || '', 30);
  const { data: hourlyStats, isLoading: loadingHourly } = useHourlyStats(siteId || '', 1); // Always 24 hours


  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Analytics and workflows overview for this site.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow">
              <Link href={`/websites/${siteId}/workflows/edit/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Create Workflow</span>
                <span className="sm:hidden">Create</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href={`/websites/${siteId}/analytics`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">View Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats siteId={siteId} />

        {/* Content Grid */}
        <div className="space-y-4 sm:space-y-6 ">
          <TrafficOverview
            dailyStats={dailyStats}
            hourlyStats={hourlyStats}
            isLoading={!siteId || loadingDaily || loadingHourly}
          />
          <WorkflowsTable siteId={siteId} />
        </div>
      </div>
      {/* <OptimizationAssistant siteId={siteId} /> */}
    </>
  );
}
