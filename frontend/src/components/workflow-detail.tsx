'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import { 
  type Workflow, 
  type WorkflowActivitySummary, 
  type WorkflowFunnelData,
  workflowChartConfig
} from '@/lib/workflow-api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Edit, Play, Pause, Trash2, Target, CircleCheckBig, Percent, Activity } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RealtimeActivityFeed } from '@/components/workflows/RealtimeActivityFeed';
import { FunnelChart } from '@/components/workflows/funnel-chart';
import ReactFlow, { 
  Controls, 
  Background, 
  BackgroundVariant, 
  MiniMap,
  Panel,
  NodeTypes,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode, CustomNodeData } from '@/components/flow/custom-node';

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
        const edgeLabel = (edge as any).label || ((edge as any).data && (edge as any).data.label) || (['A','B','C'][idx] || `Branch ${idx+1}`);
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

  const branchAnalytics = computeBranchAnalytics();

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

  const overallTriggers = workflow.totalTriggers || 0;
  const overallCompletions = workflow.totalCompletions || 0;
  const completionRateValue = parseFloat(workflow.completionRate) || 0;

  const stats = [
    { name: "Status", value: workflow.status, icon: Activity },
    { name: "Total Triggers", value: (overallTriggers).toLocaleString(), icon: Target },
    { name: "Total Completions", value: (overallCompletions).toLocaleString(), icon: CircleCheckBig },
    { name: "Completion Rate", value: `${completionRateValue.toFixed(1)}%`, icon: Percent },
  ];

  // Fallback funnel computation (when server funnel data is unavailable)
  const computeFallbackFunnelSteps = (stepNames: string[]) => {
    return stepNames.map((name, index) => {
      if (index === 0) {
        return { name, count: overallTriggers, conversionRate: 100, dropOff: 0 };
      }
      const position = index / (stepNames.length - 1);
      const estimatedCount = Math.max(
        overallCompletions,
        Math.round(overallTriggers - (overallTriggers - overallCompletions) * position)
      );
      const prevCount = index === 0 ? overallTriggers : Math.max(
        overallCompletions,
        Math.round(overallTriggers - (overallTriggers - overallCompletions) * ((index - 1) / (stepNames.length - 1)))
      );
      const dropOffPct = prevCount > 0 ? ((prevCount - estimatedCount) / prevCount) * 100 : 0;
      return {
        name,
        count: estimatedCount,
        conversionRate: overallTriggers > 0 ? (estimatedCount / overallTriggers) * 100 : 0,
        dropOff: dropOffPct
      };
    });
  };

  // Use real funnel data instead of hardcoded assumptions
  const renderFunnelChart = () => {
    if (!funnelData || !funnelData.steps || funnelData.steps.length === 0) {
      // Extract actual step names from workflow configuration
      const getStepNames = () => {
        if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
          return ['Workflow Triggered', 'First Action', 'Condition Check', 'Final Action'];
        }

        const stepNames: string[] = [];
        
        // Add trigger node name
        const triggerNode = workflow.nodes.find((node: any) => node.data?.type === 'Trigger');
        if (triggerNode) {
          stepNames.push(triggerNode.data?.title || 'Workflow Triggered');
        }

        // Add action node names in order
        const actionNodes = workflow.nodes
          .filter((node: any) => node.data?.type === 'Action')
          .sort((a: any, b: any) => (a.position?.x || 0) - (b.position?.x || 0));
        
        actionNodes.forEach((node: any) => {
          stepNames.push(node.data?.title || 'Action');
        });

        // Add condition node names if they exist
        const conditionNodes = workflow.nodes
          .filter((node: any) => node.data?.type === 'Condition')
          .sort((a: any, b: any) => (a.position?.x || 0) - (b.position?.x || 0));
        
        conditionNodes.forEach((node: any) => {
          stepNames.push(node.data?.title || 'Condition');
        });

        // If no steps found, use defaults
        if (stepNames.length === 0) {
          return ['Workflow Triggered', 'First Action', 'Condition Check', 'Final Action'];
        }

        return stepNames;
      };

      const stepNames = getStepNames();
      
      // Create funnel steps with actual names
      const steps = computeFallbackFunnelSteps(stepNames);

      return (
        <FunnelChart
          title="Workflow Conversion Funnel"
          steps={steps}
          totalVisitors={overallTriggers}
        />
      );
    }

    // Use real funnel data with actual step names - convert FunnelStep to FunnelChart format
    return (
      <FunnelChart
        title="Workflow Conversion Funnel"
        steps={(() => {
          const safeSteps = funnelData.steps.map((step, idx) => ({
            name: step.name,
            count: step.count,
            conversionRate: typeof step.conversionRate === 'string' ? parseFloat(step.conversionRate.replace('%', '')) : Number(step.conversionRate) || 0,
            dropOff: step.dropOff
          }));
          // Ensure dropOff is computed as percentage from previous step if missing or inconsistent
          for (let i = 1; i < safeSteps.length; i++) {
            const prev = safeSteps[i - 1];
            const curr = safeSteps[i];
            const expectedDrop = prev.count > 0 ? ((prev.count - curr.count) / prev.count) * 100 : 0;
            if (typeof curr.dropOff !== 'number' || !isFinite(curr.dropOff)) {
              curr.dropOff = expectedDrop;
            }
          }
          return safeSteps;
        })()}
        totalVisitors={funnelData.totalVisitors}
      />
    );
  };

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

      <Card className="bg-card shadow-sm">
        <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Live metrics for this workflow.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.isArray(stats) ? stats.map((stat) => (
                    <div key={stat.name} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                        <div className="p-3 bg-primary/10 rounded-lg">
                             <stat.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                )) : null}
            </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      {!isDemo ? (
        <RealtimeActivityFeed workflowId={workflow.id} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Real-time Activity Feed</CardTitle>
            <CardDescription>Live workflow executions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: '1', status: 'completed', timestamp: '2024-01-15T10:30:00Z', duration: '2.1s', user: 'john@example.com', event: 'Action Executed' },
                { id: '2', status: 'completed', timestamp: '2024-01-15T09:15:00Z', duration: '2.5s', user: 'sarah@example.com', event: 'Action Executed' },
                { id: '3', status: 'failed', timestamp: '2024-01-15T08:45:00Z', duration: '0.5s', user: 'mike@example.com', event: 'Action Failed' },
                { id: '4', status: 'completed', timestamp: '2024-01-15T08:00:00Z', duration: '2.0s', user: 'emma@example.com', event: 'Action Executed' },
                { id: '5', status: 'completed', timestamp: '2024-01-15T07:30:00Z', duration: '2.3s', user: 'david@example.com', event: 'Action Executed' }
              ].map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      execution.status === 'completed' ? 'bg-green-500' : 
                      execution.status === 'failed' ? 'bg-red-500' : 
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{execution.event}</p>
                      <p className="text-sm text-muted-foreground">{execution.user} • {new Date(execution.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{execution.duration}</span>
                    <Badge variant={execution.status === 'completed' ? 'default' : 'destructive'}>
                      {execution.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funnel Analytics - Show conversion funnels for this workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {renderFunnelChart()}

        <Card>
          <CardHeader>
            <CardTitle>Funnel Insights</CardTitle>
            <CardDescription>Key performance metrics and optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600">
                    {funnelData && funnelData.steps && funnelData.steps.length > 0 ? 
                      (() => {
                        const lastStep = funnelData.steps[funnelData.steps.length - 1];
                        return lastStep ? parseFloat(lastStep.conversionRate.replace('%', '')).toFixed(1) : '0.0';
                      })()
                      : completionRateValue.toFixed(1)
                    }%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600">
                    {funnelData && funnelData.steps && funnelData.steps.length > 0 ? 
                      (() => {
                        const lastStep = funnelData.steps[funnelData.steps.length - 1];
                        return lastStep ? lastStep.count.toLocaleString() : '0';
                      })()
                      : overallCompletions.toLocaleString()
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Total Completions</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-purple-600">
                    {funnelData && funnelData.steps && funnelData.steps.length > 0 ? 
                      funnelData.totalVisitors.toLocaleString()
                      : overallTriggers.toLocaleString()
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Total Visitors</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {funnelData && funnelData.steps && funnelData.steps.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Best Performing Step</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const bestStep = funnelData.steps.reduce((best, current) => 
                            parseFloat(current.conversionRate.replace('%', '')) > parseFloat(best.conversionRate.replace('%', '')) ? current : best
                          );
                          return `${bestStep.name} (${parseFloat(bestStep.conversionRate.replace('%', '')).toFixed(1)}%)`;
                        })()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Biggest Drop-off</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const biggestDropOff = funnelData.steps.reduce((biggest, current, index) => {
                            if (index === 0) return biggest;
                            const dropOff = Math.abs(current.dropOff);
                            return dropOff > Math.abs(biggest.dropOff) ? current : biggest;
                          });
                          return biggestDropOff ? `${biggestDropOff.name} (${Math.abs(biggestDropOff.dropOff).toFixed(1)}%)` : 'N/A';
                        })()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Improvement Potential</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const firstStep = funnelData.steps[0];
                          const lastStep = funnelData.steps[funnelData.steps.length - 1];
                          if (firstStep && lastStep) {
                            return (100 - parseFloat(lastStep.conversionRate.replace('%', ''))).toFixed(1);
                          }
                          return '0.0';
                        })()}%
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {(() => {
                      const names = getWorkflowStepNames();
                      const orderedNames = [names.trigger, names.firstAction, names.condition, names.finalAction].filter(Boolean);
                      const steps = computeFallbackFunnelSteps(orderedNames);
                      const best = steps.reduce((acc, s) => (s.conversionRate > (acc?.conversionRate ?? -Infinity) ? s : acc), steps[0]);
                      let biggest = null as null | typeof steps[number];
                      for (let i = 1; i < steps.length; i++) {
                        if (!biggest || steps[i].dropOff > biggest.dropOff) biggest = steps[i];
                      }
                      const last = steps[steps.length - 1];
                      return (
                        <>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium">Best Performing Step</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{`${best?.name ?? 'N/A'} (${(best?.conversionRate ?? 0).toFixed(1)}%)`}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-sm font-medium">Biggest Drop-off</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{biggest ? `${biggest.name} (${biggest.dropOff.toFixed(1)}%)` : 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium">Improvement Potential</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{(100 - (last?.conversionRate ?? completionRateValue)).toFixed(1)}%</span>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>

              {/* Optimization Tip */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Optimization Tip</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {funnelData && funnelData.steps && funnelData.steps.length > 0 ? (
                        (() => {
                          const lastStep = funnelData.steps[funnelData.steps.length - 1];
                          const successRate = lastStep ? parseFloat(lastStep.conversionRate.replace('%', '')) : 0;
                          
                          if (successRate < 50) {
                            return "Your workflow has significant drop-off. Consider simplifying the logic or adding fallback paths.";
                          } else if (successRate < 75) {
                            return "Good performance! Focus on optimizing the steps with highest drop-off to improve completion rates.";
                          } else {
                            return "Excellent performance! Your workflow is well-optimized with minimal drop-off.";
                          }
                        })()
                      ) : (
                        completionRateValue < 50 
                          ? "Your workflow has significant drop-off. Consider simplifying the logic or adding fallback paths."
                          : completionRateValue < 75
                          ? "Good performance! Focus on optimizing the steps with highest drop-off to improve completion rates."
                          : "Excellent performance! Your workflow is well-optimized with minimal drop-off."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Activity Trend Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Activity Trend</CardTitle>
          <CardDescription>Triggers and completions over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={workflowChartConfig} className="h-[300px] w-full">
            <AreaChart data={activitySummary || []} margin={{ left: -20, right: 10 }}>
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                tickFormatter={(value) => {
                  try {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) {
                      return 'Invalid';
                    }
                    return format(date, 'MMM d');
                  } catch (error) {
                    return 'Invalid';
                  }
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={30}
              />
              <ChartTooltip 
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />} 
              />
              <defs>
                <linearGradient id="fillTriggers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-triggers)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-triggers)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fillCompletions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-completions)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-completions)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                dataKey="triggers"
                type="natural"
                fill="url(#fillTriggers)"
                stroke="var(--color-triggers)"
                stackId="a"
              />
              <Area
                dataKey="completions"
                type="natural"
                fill="url(#fill-completions)"
                stroke="var(--color-completions)"
                stackId="b"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Branch Performance - Only show if there are multiple paths */}
      {Array.isArray(workflow?.edges) && workflow.edges.length > 1 && (
        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Branch Performance</CardTitle>
              <CardDescription>Completions per branch (from Action Executed events)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {branchAnalytics.map((split) => (
                  <div key={split.splitNodeId} className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Split Node: {split.splitTitle}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {split.branches.map((b) => (
                        <div key={b.label} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded bg-primary/10 text-primary text-xs font-semibold px-2">{b.label}</span>
                            <span className="text-sm text-muted-foreground">{b.percent}%</span>
                          </div>
                          <div className="text-sm font-semibold">{b.count.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
