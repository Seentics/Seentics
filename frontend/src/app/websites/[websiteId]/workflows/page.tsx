'use client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WorkflowsTable } from '@/components/workflows-table';
import { useToast } from '@/hooks/use-toast';
import { getWorkflows, type Workflow } from '@/lib/workflow-api';
import { useAuth } from '@/stores/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';



export default function WorkflowsPage() {
  const params = useParams();
  const siteId = params?.websiteId as string
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: workflows = [], isLoading: isLoadingWorkflows } = useQuery<Workflow[]>({
    queryKey: ['workflows', user?._id, siteId],
    queryFn: () => getWorkflows(siteId!),
    enabled: !!user && !!siteId,
  });

  // In open source version, all features are unlimited
  const canAddWorkflow = true;
  const planName = 'Open Source';

  // Derived metrics for stats cards
  const totalWorkflows = workflows?.length || 0;
  const activeWorkflowsCount = Array.isArray(workflows) ? workflows.filter(w => w.status === 'Active').length : 0;
  const totalTriggers = Array.isArray(workflows) ? workflows.reduce((sum, w) => sum + (w.totalTriggers || 0), 0) : 0;
  const avgCompletionRate = (() => {
    const rates = Array.isArray(workflows)
      ? workflows.filter(w => w.completionRate).map(w => parseFloat((w.completionRate as string).replace('%', '')))
      : [];
    return rates.length > 0 ? parseFloat((rates.reduce((sum, rate) => sum + rate, 0) / rates.length).toFixed(1)) : 0;
  })();

  const handleCreateWorkflowFromFunnel = (context: { funnelStep: string; funnelName: string }) => {
    // Navigate to workflow creation with funnel context
    const params = new URLSearchParams({
      context: 'funnel',
      funnelStep: context.funnelStep,
      funnelName: context.funnelName
    });
    window.open(`/websites/${siteId}/workflows/edit/new?${params.toString()}`, '_blank');
  };

  const CreateWorkflowButton = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            <Button asChild size="lg" disabled={!canAddWorkflow || !siteId} className="shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow">
              <Link href={`/websites/${siteId}/workflows/edit/new`} onClick={() => console.log('Create Workflow clicked, navigating to:', `/websites/${siteId}/workflows/edit/new`)}>
                <PlusCircle className="mr-2" />
                Create Workflow
              </Link>
            </Button>
          </div>
        </TooltipTrigger>
        {!canAddWorkflow && (
          <TooltipContent>
            <p>You've reached the workflow limit for the {planName} plan. Please upgrade to add more.</p>
          </TooltipContent>
        )}
        {!siteId && (
          <TooltipContent>
            <p>Please select a site to create a workflow.</p>
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
            Workflows
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and monitor your automated workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateWorkflowButton />
        </div>
      </div>

      {/* Key Metrics - Unified Cards Container (analytics-style) */}
      <div className="bg-white dark:bg-transparent  dark:border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
          {/* Total Workflows */}
          <div className="group cursor-default hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 p-6">
            <div className="flex items-center justify-between pb-2.5">
              <div className="text-sm font-semibold text-foreground/90 truncate pr-2">Total Workflows</div>
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-2xl font-bold leading-tight text-foreground group-hover:text-foreground/90 transition-colors">{totalWorkflows}</div>
            </div>
          </div>

          {/* Active Workflows */}
          <div className="group cursor-default hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 p-6">
            <div className="flex items-center justify-between pb-2.5">
              <div className="text-sm font-semibold text-foreground/90 truncate pr-2">Active Workflows</div>
              <div className="p-2 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-2xl font-bold leading-tight text-foreground group-hover:text-foreground/90 transition-colors">{activeWorkflowsCount}</div>
            </div>
          </div>

          {/* Total Triggers */}
          <div className="group cursor-default hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 p-6">
            <div className="flex items-center justify-between pb-2.5">
              <div className="text-sm font-semibold text-foreground/90 truncate pr-2">Total Triggers</div>
              <div className="p-2 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-2xl font-bold leading-tight text-foreground group-hover:text-foreground/90 transition-colors">{totalTriggers.toLocaleString()}</div>
            </div>
          </div>

          {/* Avg Completion Rate */}
          <div className="group cursor-default hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 p-6">
            <div className="flex items-center justify-between pb-2.5">
              <div className="text-sm font-semibold text-foreground/90 truncate pr-2">Avg Completion Rate</div>
              <div className="p-2 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h3a2 2 0 012 2v14a2 2 0 01-2 2h-3a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-2xl font-bold leading-tight text-foreground group-hover:text-foreground/90 transition-colors">{`${avgCompletionRate.toFixed(1)}%`}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workflows Table - Core Data */}
      <div>
        <WorkflowsTable siteId={siteId} />
      </div>

    </div>
  );
}
