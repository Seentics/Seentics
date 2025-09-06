
'use client';
import Link from 'next/link';
import { BarChart3, Bolt, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardStats } from '@/components/dashboard-stats';
import { WorkflowsTable } from '@/components/workflows-table';
import { useParams } from 'next/navigation';
import { AnalyticsSummaryCard } from '@/components/analytics-summary-card';
import { AnalyticsTable } from '@/components/analytics-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyStats, useHourlyStats } from '@/lib/analytics-api';
import { TrafficOverview } from '@/components/analytics/TrafficOverview';

export default function DashboardPage() {
  const params = useParams();
  const siteId = params?.websiteId as string

  // Traffic overview data (real API)
  const { data: dailyStats, isLoading: loadingDaily } = useDailyStats(siteId || '', 30);
  const { data: hourlyStats, isLoading: loadingHourly } = useHourlyStats(siteId || '', 1); // Always 24 hours

  // Remove realtime snapshot; show traffic overview instead

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">Analytics and workflows overview for this site.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg" className="shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow">
              <Link href={`/websites/${siteId}/workflows/edit/new`}>
                <PlusCircle className="mr-2" />
                Create Workflow
              </Link>
            </Button>
            <Button asChild size="lg" variant="link">
              <Link href={`/websites/${siteId}/analytics`}>
                <BarChart3 className="mr-2" />
                View Analytics
              </Link>
            </Button>
          </div>
        </div>
        <DashboardStats siteId={siteId} />
        <div className="grid grid-cols-1">
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
