
'use client';

import { subDays } from 'date-fns';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from '@/components/flow/custom-node';
import { useToast } from '@/hooks/use-toast';
import type { WorkflowFunnelData } from '@/lib/workflow-api';
import {
  deleteWorkflow,
  getWorkflow,
  getWorkflowFunnelData,
  getWorkflowSummary,
  updateWorkflow,
  type Workflow,
  type WorkflowActivitySummary
} from '@/lib/workflow-api';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/stores/useAuthStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Import new chart components

// Import shared component
import { WorkflowDetail } from '@/components/workflow-detail';

const nodeTypes: NodeTypes = { custom: CustomNode };

export default function WorkflowDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const websiteId = params.websiteId as string;
  const searchParams = useSearchParams();
  const siteId = searchParams.get('siteId') || websiteId;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Debug logging
  console.log('WorkflowDetailPage - ID:', id);
  console.log('WorkflowDetailPage - WebsiteID:', websiteId);
  console.log('WorkflowDetailPage - SiteID:', siteId);
  console.log('WorkflowDetailPage - User:', user);

  const { data: workflowData, isLoading: isLoadingWorkflow, refetch: refetchWorkflow } = useQuery<Workflow | null>({
    queryKey: ['workflow', id],
    queryFn: async () => {
      if (!id || !user) return null;
      const wf = await getWorkflow(id);
      if (!wf) {
        toast({
          title: 'Not Found',
          description: 'This workflow does not exist.',
          variant: 'destructive',
        });
        router.push(`/websites/${siteId}/workflows`);
        return null;
      }
      return wf;
    },
    enabled: !!id && !!user,
  });

  // Ensure workflow is properly handled
  const workflow = workflowData;

  // Debug: Log workflow structure
  console.log('Workflow data:', workflow);
  console.log('Workflow nodes:', workflow?.nodes);

  // Note: RealtimeActivityFeed now fetches its own data, so we don't need this query here
  // const { data: activityLogData, isLoading: isLoadingLog } = useQuery<ActivityLog[]>({
  //   queryKey: ['activityLog', id],
  //   queryFn: () => getWorkflowActivity(id),
  //   enabled: !!id,
  //   refetchInterval: 5000,
  // });

  // Ensure activityLog is always an array
  const activityLog: any[] = [];

  const { data: activitySummaryData, isLoading: isLoadingSummary } = useQuery<WorkflowActivitySummary[]>({
    queryKey: ['workflowSummary', id],
    queryFn: () => getWorkflowSummary(id, subDays(new Date(), 29), new Date()),
    enabled: !!id,
  });

  // Fetch real funnel data - moved here to ensure consistent hook ordering
  const { data: funnelData, isLoading: funnelLoading } = useQuery<WorkflowFunnelData | null>({
    queryKey: ['workflowFunnel', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const data = await getWorkflowFunnelData(id);
        console.log('Fetched funnel data:', data);
        return data;
      } catch (error) {
        console.error('Error fetching funnel data:', error);
        // Fallback to basic data if funnel data fails
        return {
          totalVisitors: 0,
          steps: [],
          dropOffRates: [],
          averageTimePerStep: [],
          pathAnalysis: [],
          totalRuns: 0,
          successfulCompletions: 0
        };
      }
    },
    enabled: !!id,
  });

  // Ensure activitySummary is always an array
  const activitySummary: any[] = Array.isArray(activitySummaryData) ? activitySummaryData as any[] :
    (activitySummaryData as any)?.summary ? (activitySummaryData as any).summary :
      (activitySummaryData as any)?.data ? (activitySummaryData as any).data :
        [];

  const handleStatusChange = async (newStatus: 'Active' | 'Paused') => {
    if (!workflow || !user) return;
    try {
      await updateWorkflow(workflow.id, { status: newStatus });
      await refetchWorkflow();
      await queryClient.invalidateQueries({ queryKey: ['workflows', siteId] });

      toast({
        title: 'Workflow Updated',
        description: `"${workflow.name}" is now ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update workflow status.`,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!workflow || !user) return;
    try {
      await deleteWorkflow(workflow.id);
      toast({ title: "Workflow Deleted", description: `"${workflow.name}" has been deleted.` });
      await queryClient.invalidateQueries({ queryKey: ['workflows', siteId] });
      router.push(`/workflows${siteId ? `?siteId=${siteId}` : ''}`);
    } catch (error) {
      toast({ title: "Error deleting workflow", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const loading = isLoadingWorkflow || isLoadingSummary;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Workflow not found.</h2>
        <Link href={`/workflows${siteId ? `?siteId=${siteId}` : ''}`} className="text-primary hover:underline">
          Return to workflows list
        </Link>
      </div>
    );
  }

  // Use the shared WorkflowDetail component
  return (
    <WorkflowDetail
      workflow={workflow}
      activitySummary={activitySummary}
      funnelData={funnelData || null}
      siteId={siteId}
      isDemo={false}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
    />
  );
}
