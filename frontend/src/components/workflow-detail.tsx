'use client';

import { CustomNode } from '@/components/flow/custom-node';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  getWorkflowNodeStats,
  getWorkflowStats,
  type NodeStats,
  type Workflow,
  type WorkflowActivitySummary,
  type WorkflowAnalytics,
  type WorkflowFunnelData
} from '@/lib/workflow-api';
import { Activity, CircleCheckBig, Edit, Loader2, Percent, Target } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

interface WorkflowDetailProps {
  workflow: Workflow;
  activitySummary: WorkflowActivitySummary[];
  funnelData: WorkflowFunnelData | null;
  siteId: string;
  isDemo?: boolean;
  onStatusChange?: (newStatus: 'Active' | 'Paused') => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function WorkflowDetail({
  workflow,
  activitySummary,
  funnelData,
  siteId,
  isDemo = false,
  onStatusChange,
  onDelete,
  onEdit
}: WorkflowDetailProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [workflowStats, setWorkflowStats] = useState<WorkflowAnalytics | null>(null);
  const [nodeStats, setNodeStats] = useState<NodeStats[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Load aggregated analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (isDemo) return; // Skip API calls for demo mode

      try {
        setIsLoadingStats(true);
        const [stats, nodes] = await Promise.all([
          getWorkflowStats(workflow.id),
          getWorkflowNodeStats(workflow.id)
        ]);
        setWorkflowStats(stats);
        setNodeStats(nodes);
      } catch (error) {
        console.error('Error loading workflow analytics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workflow analytics',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadAnalytics();
  }, [workflow.id, isDemo, toast]);

  // Helper function to get actual workflow step names
  const getWorkflowStepNames = () => {
    if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
      return {
        trigger: 'Workflow Triggered',
        firstAction: 'First Action',
        condition: 'Condition Check',
        finalAction: 'Final Action'
      };
    }

    const triggerNode = workflow.nodes.find((node: any) => node.data?.type === 'Trigger');
    const actionNodes = workflow.nodes
      .filter((node: any) => node.data?.type === 'Action')
      .sort((a: any, b: any) => (a.position?.x || 0) - (b.position?.x || 0));
    const conditionNodes = workflow.nodes
      .filter((node: any) => node.data?.type === 'Condition')
      .sort((a: any, b: any) => (a.position?.x || 0) - (b.position?.x || 0));

    return {
      trigger: triggerNode?.data?.title || 'Workflow Triggered',
      firstAction: actionNodes[0]?.data?.title || 'First Action',
      condition: conditionNodes[0]?.data?.title || 'Condition Check',
      finalAction: actionNodes[actionNodes.length - 1]?.data?.title || 'Final Action'
    };
  };

  // Branch analytics helpers
  const computeBranchAnalytics = () => {
    if (!workflow) return [] as Array<{ splitNodeId: string; splitTitle: string; branches: Array<{ label: string; count: number; percent: number }> }>;
    const edges: any[] = Array.isArray(workflow.edges) ? workflow.edges : [];
    const nodes: any[] = Array.isArray(workflow.nodes) ? workflow.nodes : [];

    // Find Branch Split nodes
    const splitNodes = nodes.filter((n: any) => n?.data?.title === 'Branch Split');
    const results: Array<{ splitNodeId: string; splitTitle: string; branches: Array<{ label: string; count: number; percent: number }> }> = [];

    // Build adjacency map
    const outMap = new Map<string, string[]>();
    edges.forEach(e => {
      if (!outMap.has(e.source)) outMap.set(e.source, []);
      outMap.get(e.source)!.push(e.target);
    });

    const getReachableActions = (startId: string) => {
      const visited = new Set<string>();
      const actions = new Set<string>();
      const stack = [startId];
      while (stack.length) {
        const curr = stack.pop()!;
        if (visited.has(curr)) continue;
        visited.add(curr);
        const node = nodes.find(n => n.id === curr) as any;
        if (!node) continue;
        if (node.data?.type === 'Action') actions.add(curr);
        const children = outMap.get(curr) || [];
        children.forEach(c => stack.push(c));
      }
      return actions;
    };

    // For demo, generate some sample branch data
    if (isDemo) {
      return [
        {
          splitNodeId: '5',
          splitTitle: 'User Engaged?',
          branches: [
            { label: 'Yes', count: 856, percent: 78.6 },
            { label: 'No', count: 233, percent: 21.4 }
          ]
        }
      ];
    }

    // For real data, compute actual analytics
    splitNodes.forEach((split: any) => {
      const outgoing = edges.filter(e => e.source === split.id);
      if (outgoing.length === 0) return;
      const branches: Array<{ label: string; count: number; percent: number }> = [];

      outgoing.forEach((edge, idx) => {
        const targetId = edge.target;
        const edgeLabel = (edge as any).label || ((edge as any).data && (edge as any).data.label) || (['A', 'B', 'C'][idx] || `Branch ${idx + 1}`);
        const reachable = getReachableActions(targetId);
        // For demo, generate sample counts
        const count = isDemo ? Math.floor(Math.random() * 1000) + 100 : 0;
        branches.push({ label: String(edgeLabel), count, percent: 0 });
      });

      const total = branches.reduce((s, b) => s + b.count, 0) || 1;
      branches.forEach(b => { b.percent = Math.round((b.count / total) * 1000) / 10; });
      results.push({ splitNodeId: split.id, splitTitle: split.data?.title || 'Branch Split', branches });
    });

    return results;
  };


  const handleStatusChange = async (newStatus: 'Active' | 'Paused') => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    } else if (!isDemo) {
      toast({
        title: 'Error',
        description: 'Status change not implemented for demo mode.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete();
    } else if (!isDemo) {
      toast({
        title: 'Error',
        description: 'Delete not implemented for demo mode.',
        variant: 'destructive',
      });
    }
  };

  // Use aggregated analytics data or fallback to workflow properties for demo
  const overallTriggers = isDemo ? (workflow.totalTriggers || 0) : (workflowStats?.totalTriggers || 0);
  const overallCompletions = isDemo ? (workflow.totalCompletions || 0) : (workflowStats?.totalCompletions || 0);
  const overallRuns = isDemo ? (workflow.totalTriggers || 0) : (workflowStats?.totalRuns || 0);
  const successfulRuns = isDemo ? (workflow.totalCompletions || 0) : (workflowStats?.successfulRuns || 0);
  const failedRuns = isDemo ? 0 : (workflowStats?.failedRuns || 0);
  const completionRateValue = isDemo
    ? (parseFloat(workflow.completionRate) || 0)
    : (workflowStats?.conversionRate ? parseFloat(workflowStats.conversionRate.replace('%', '')) : 0);
  const successRateValue = isDemo
    ? (parseFloat(workflow.completionRate) || 0)
    : (workflowStats?.successRate ? parseFloat(workflowStats.successRate.replace('%', '')) : 0);

  const stats = [
    { name: "Total Triggers", value: (overallTriggers).toLocaleString(), icon: Target, color: "blue" },
    { name: "Total Completions", value: (overallCompletions).toLocaleString(), icon: CircleCheckBig, color: "green" },
    { name: "Conversion Rate", value: `${completionRateValue.toFixed(1)}%`, icon: Percent, color: "purple" },
    { name: "Success Rate", value: `${successRateValue.toFixed(1)}%`, icon: Activity, color: "emerald" },
  ];

  const additionalStats = [
    { name: "Total Runs", value: (overallRuns).toLocaleString(), color: "indigo" },
    { name: "Successful Runs", value: (successfulRuns).toLocaleString(), color: "green" },
    { name: "Failed Runs", value: (failedRuns).toLocaleString(), color: "red" },
    { name: "Last Triggered", value: workflowStats?.lastTriggered ? new Date(workflowStats.lastTriggered).toLocaleString() : 'Never', color: "gray" },
  ];



  const getBasePath = () => isDemo ? '/demo' : `/websites/${siteId}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={getBasePath()}>Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`${getBasePath()}/workflows`}>Workflows</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{workflow.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3">
            <h1 className="font-headline text-3xl font-bold tracking-tight">{workflow.name}</h1>
            {isDemo && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                DEMO
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{workflow.category}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="status-toggle"
              checked={workflow.status === 'Active'}
              onCheckedChange={(checked) => handleStatusChange(checked ? 'Active' : 'Paused')}
            />
            <Label htmlFor="status-toggle" className="text-sm font-medium">
              {workflow.status === 'Active' ? 'Active' : 'Paused'}
            </Label>
          </div>
          <Button variant="outline" asChild>
            <Link href={`${getBasePath()}/workflows/edit/${workflow.id}`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Workflow
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Performance Overview */}
      <Card className="bg-gradient-to-br from-card to-card/50 shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Performance Overview</CardTitle>
          <CardDescription>Real-time analytics and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStats && !isDemo ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-base text-muted-foreground">Loading analytics...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Primary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 border-none shadow-md">
                {stats.map((stat) => (
                  <div key={stat.name} className={`relative overflow-hidden  p-6 border`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium text-${stat.color}-700 dark:text-${stat.color}-300`}>{stat.name}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-900 dark:text-${stat.color}-100 mt-1`}>{stat.value}</p>
                      </div>
                      <div className={`p-3 bg-${stat.color}-200 dark:bg-${stat.color}-800 rounded-lg`}>
                        <stat.icon className={`h-6 w-6 text-${stat.color}-700 dark:text-${stat.color}-300`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Stats */}
              {/* {!isDemo && workflowStats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {additionalStats.map((stat) => (
                    <div key={stat.name} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                      <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                      <p className={`text-lg font-semibold mt-1 text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              )} */}

              {/* Insights */}
              {!isDemo && workflowStats?.insights && workflowStats.insights.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Insights</h4>
                  <div className="space-y-2">
                    {workflowStats.insights.map((insight, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${insight.type === 'success' ? 'bg-green-50 dark:bg-green-950/20 border-l-green-500 text-green-800 dark:text-green-200' :
                        insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/20 border-l-yellow-500 text-yellow-800 dark:text-yellow-200' :
                          insight.type === 'error' ? 'bg-red-50 dark:bg-red-950/20 border-l-red-500 text-red-800 dark:text-red-200' :
                            'bg-blue-50 dark:bg-blue-950/20 border-l-blue-500 text-blue-800 dark:text-blue-200'
                        }`}>
                        <p className="text-sm font-medium">{insight.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>



      {/* Individual Node Performance */}
      {!isDemo && workflowStats?.nodeStats && Object.keys(workflowStats.nodeStats).length > 0 && (
        <Card className="bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Individual Node Performance</CardTitle>
            <CardDescription>Detailed performance metrics for each workflow node</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
              {Object.entries(workflowStats.nodeStats).map(([nodeId, node]) => (
                <div key={nodeId} className="border border-border/50 rounded-xl p-6 bg-gradient-to-r from-card to-card/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{node.nodeTitle}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {node.nodeType}
                        </Badge>
                        {node.successRate && (
                          <Badge variant="outline" className={`text-xs ${parseFloat(node.successRate.replace('%', '')) >= 90 ? 'border-green-500 text-green-700' :
                            parseFloat(node.successRate.replace('%', '')) >= 70 ? 'border-yellow-500 text-yellow-700' :
                              'border-red-500 text-red-700'
                            }`}>
                            {node.successRate} success rate
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid ">
                    {node.triggers !== undefined && (
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{node.triggers}</div>
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">Triggers</div>
                      </div>
                    )}
                    {node.completions !== undefined && (
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-xl font-bold text-green-700 dark:text-green-300">{node.completions}</div>
                        <div className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">Completions</div>
                      </div>
                    )}
                    {node.failures !== undefined && (
                      <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="text-xl font-bold text-red-700 dark:text-red-300">{node.failures}</div>
                        <div className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">Failures</div>
                      </div>
                    )}
                    {node.skipped !== undefined && (
                      <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{node.skipped}</div>
                        <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mt-1">Skipped</div>
                      </div>
                    )}
                    {node.conditionsPassed !== undefined && (
                      <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{node.conditionsPassed}</div>
                        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">Passed</div>
                      </div>
                    )}
                    {node.conditionsFailed !== undefined && (
                      <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="text-xl font-bold text-red-700 dark:text-red-300">{node.conditionsFailed}</div>
                        <div className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">Failed</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Insights */}
      {!isDemo && workflowStats?.insights && workflowStats.insights.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analytics Insights</CardTitle>
            <CardDescription>AI-powered recommendations based on workflow performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowStats.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${insight.type === 'success'
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : insight.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'
                      : insight.type === 'error'
                        ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                        : 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded ${insight.type === 'success'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : insight.type === 'warning'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30'
                        : insight.type === 'error'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                      {insight.type === 'success' && (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {insight.type === 'warning' && (
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      )}
                      {insight.type === 'error' && (
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {insight.type === 'info' && (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <p className={`text-sm ${insight.type === 'success'
                      ? 'text-green-700 dark:text-green-300'
                      : insight.type === 'warning'
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : insight.type === 'error'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-blue-700 dark:text-blue-300'
                      }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Preview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Workflow Preview</CardTitle>
          <CardDescription>Interactive visual representation of your workflow structure. You can zoom, pan, and explore the flow.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Workflow Diagram */}
            <div className="border rounded-lg bg-muted/20" style={{ height: '400px' }}>
              <ReactFlowProvider>
                <ReactFlow
                  nodes={workflow.nodes || []}
                  edges={workflow.edges || []}
                  nodeTypes={{ custom: CustomNode }}
                  fitView
                  className="[&_.react-flow__edge-path]:stroke-primary"
                  proOptions={{ hideAttribution: true }}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  zoomOnScroll={true}
                  panOnScroll={true}
                  zoomOnPinch={true}
                  preventScrolling={false}
                >
                  <Controls className="bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg" />
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    className="opacity-30"
                  />
                  <MiniMap
                    className="bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg"
                    nodeColor="hsl(var(--primary))"
                    maskColor="hsl(var(--background) / 0.1)"
                  />
                  <Panel
                    position="top-right"
                    className="bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg p-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="text-xs">
                        {workflow.nodes?.length || 0} nodes
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {workflow.edges?.length || 0} connections
                      </Badge>
                    </div>
                  </Panel>
                </ReactFlow>
              </ReactFlowProvider>
            </div>

            {/* Workflow Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-lg font-semibold text-blue-600">
                  {workflow.nodes?.filter((node: any) => node.data?.type === 'Trigger').length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Triggers</div>
              </div>
              <div className="text-center p-3 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-800">
                <div className="text-lg font-semibold text-violet-600">
                  {workflow.nodes?.filter((node: any) => node.data?.type === 'Action').length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Actions</div>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="text-lg font-semibold text-amber-600">
                  {workflow.nodes?.filter((node: any) => node.data?.type === 'Condition').length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Conditions</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-950/20 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-lg font-semibold text-slate-600">
                  {workflow.edges?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Connections</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>




    </div>
  );
}
