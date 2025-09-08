import type { Node, Edge } from 'reactflow';
import type { CustomNodeData } from '@/components/flow/custom-node';
import type { ChartConfig } from '@/components/ui/chart';
import api from './api';
import axios from 'axios';

export type Workflow = {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Draft';
  category: string;
  siteId: string;
  userId: string;
  totalTriggers: number;
  totalCompletions: number;
  completionRate: string; // This is now a string like "50.0%" from the backend
  createdAt: string;
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  analytics?: WorkflowAnalytics;
};

export type WorkflowAnalytics = {
  totalTriggers: number;
  totalCompletions: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  conversionRate: string;
  successRate: string;
  lastTriggered?: string;
  nodeStats: Record<string, NodeStats>;
  nodeTypeSummary: NodeTypeSummary;
  insights: AnalyticsInsight[];
};

export type NodeStats = {
  triggers?: number;
  completions?: number;
  failures?: number;
  skipped?: number;
  conditionsPassed?: number;
  conditionsFailed?: number;
  nodeTitle: string;
  nodeType: string;
  totalExecutions?: number;
  successRate?: string;
};

export type NodeTypeSummary = {
  triggers: { count: number; executions: number };
  conditions: { count: number; passed: number; failed: number };
  actions: { count: number; completions: number; failures: number; skipped: number };
};

export type AnalyticsInsight = {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
};

export type ActivityLog = {
    id: string;
    event: 'Trigger' | 'Action Executed';
    nodeId?: string;
    nodeTitle?: string;
    detail?: string;
    timestamp: string; // ISO String
};

export type WorkflowActivitySummary = {
  date: string;
  triggers: number;
  completions: number;
  completionRate: number;
}

export type NodePerformance = {
  nodeId: string;
  nodeTitle: string;
  triggers: number;
  executions: number;
  performance: number;
}

export type TriggerTypeData = {
  triggerType: string;
  count: number;
  percentage: number;
}

export type ActionTypeData = {
  actionType: string;
  count: number;
  successRate: number;
  avgExecutionTime?: number;
}

export type HourlyData = {
  hour: number;
  triggers: number;
  completions: number;
  completionRate: number;
}

export type FunnelStep = {
  name: string;
  nodeType: string;
  count: number;
  completed: number;
  conversionRate: string;
  dropOff: number;
  avgTime: number;
  stepOrder: number;
  successRate: string;
}

export type DropOffRate = {
  fromStep: string;
  toStep: string;
  dropOffCount: number;
  dropOffRate: number;
  critical: boolean;
}

export type StepTiming = {
  stepName: string;
  averageTime: number;
  totalExecutions: number;
}

export type VisitorPath = {
  path: string;
  count: number;
  visitors: string[];
}

export type WorkflowFunnelData = {
  totalVisitors: number;
  steps: FunnelStep[];
  dropOffRates: DropOffRate[];
  averageTimePerStep: StepTiming[];
  pathAnalysis: VisitorPath[];
  totalRuns: number;
  successfulCompletions: number;
}

export const workflowChartConfig = {
  triggers: {
    label: 'Triggers',
    color: 'hsl(var(--chart-2))',
  },
  completions: {
    label: 'Completions',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export const nodePerformanceChartConfig = {
  performance: {
    label: 'Success Rate (%)',
    color: 'hsl(var(--chart-2))',
  },
  executions: {
    label: 'Executions',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export const triggerTypeChartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--chart-1))',
  },
  percentage: {
    label: 'Percentage',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export const actionTypeChartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--chart-1))',
  },
  successRate: {
    label: 'Success Rate (%)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export const hourlyChartConfig = {
  triggers: {
    label: 'Triggers',
    color: 'hsl(var(--chart-2))',
  },
  completions: {
    label: 'Completions',
    color: 'hsl(var(--chart-4))',
  },
  completionRate: {
    label: 'Completion Rate (%)',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

/**
 * Clean workflow data by removing UI-specific properties before sending to API
 * @param workflow - The workflow data to clean
 * @returns Cleaned workflow data
 */
function cleanWorkflowData<T extends Partial<Workflow>>(workflow: T): T {
  console.log('cleanWorkflowData input:', workflow);
  
  const { 
    userId,           // Remove userId - should be handled by server
    triggerRate, 
    completionRate, 
    totalTriggers,
    totalCompletions,
    createdAt,
    id,
    ...cleanData 
  } = workflow as any;
  
  console.log('cleanWorkflowData after destructuring:', cleanData);
  
  // Clean nodes - remove UI-specific properties
  if (cleanData.nodes && Array.isArray(cleanData.nodes)) {
    cleanData.nodes = cleanData.nodes.map((node: any) => {
      const { 
        selected, 
        dragging, 
        positionAbsolute,
        measured,
        resizing,
        ...cleanNode 
      } = node as any;
      return cleanNode;
    });
  }
  
  // Clean edges - remove UI-specific properties
  if (cleanData.edges && Array.isArray(cleanData.edges)) {
    cleanData.edges = cleanData.edges.map((edge: any) => {
      const { 
        selected,
        markerEnd,
        markerStart,
        sourceHandle,
        targetHandle,
        ...cleanEdge 
      } = edge as any;
      return cleanEdge;
    });
  }
  
  console.log('cleanWorkflowData output:', cleanData);
  return cleanData as T;
}

export async function getWorkflows(siteId: string): Promise<Workflow[]> {
  try {
    const res: any = await api.get(`/workflows?siteId=${siteId}`);
    return res?.data || [];
  } catch (error) {
    console.error('Error fetching workflows: ', error);
    return [];
  }
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
  try {
    const res: any = await api.get(`/workflows/${id}`);
    return res?.data ?? null;
  } catch (error) {
    console.error("Error getting workflow:", error);
    return null;
  }
}

export async function deleteWorkflow(id: string): Promise<void> {
    try {
        await api.delete(`/workflows/${id}`);
    } catch (error) {
        console.error("Error deleting workflow: ", error);
        throw error;
    }
}

export async function addWorkflow(workflow: Partial<Workflow>, userId: string): Promise<Workflow> {
  try {
    console.log('addWorkflow called with:', { workflow, userId });
    
    // Clean the workflow data before sending to API (removes userId and other server-managed props)
    const cleanData = cleanWorkflowData(workflow);
    console.log('Cleaned workflow data:', cleanData);
    
    // Send cleanData (without userId) - the server will add userId from the auth context or parameter
    const res: any = await api.post('/workflows/', cleanData);
    console.log('API response:', res);
    return res?.data;
  } catch (error) {
    console.error('Error adding workflow: ', error);
    throw error;
  }
}

export async function updateWorkflow(id: string, updatedData: Partial<Workflow>, userId?: string): Promise<void> {
  try {
    // Clean the workflow data before sending to API (removes userId and other server-managed props)
    const cleanData = cleanWorkflowData(updatedData);
    
    // Send cleanData without modifying siteId - let the server handle it
    await api.put(`/workflows/${id}`, cleanData);
  } catch (error) {
    console.error('Error updating workflow: ', error);
    throw error;
  }
}

// Add a dedicated function for status updates
export async function updateWorkflowStatus(id: string, status: 'Active' | 'Paused' | 'Draft'): Promise<void> {
  try {
    await api.patch(`/workflows/${id}/status`, { status });
  } catch (error) {
    console.error('Error updating workflow status: ', error);
    throw error;
  }
}

// New aggregated analytics API
export async function getWorkflowStats(workflowId: string): Promise<WorkflowAnalytics> {
  try {
    const res: any = await api.get(`/workflows/${workflowId}/stats`);
    // The API returns { success: true, data: { actualData } }, so we need res.data.data
    return res?.data?.data || {};
  } catch (error) {
    console.error(`Error fetching workflow stats for ${workflowId}:`, error);
    throw error;
  }
}

export async function getWorkflowNodeStats(workflowId: string): Promise<NodeStats[]> {
  try {
    const res: any = await api.get(`/workflows/${workflowId}/stats/nodes`);
    // The API returns { success: true, data: { actualData } }, so we need res.data.data
    return res?.data?.data || [];
  } catch (error) {
    console.error(`Error fetching node stats for ${workflowId}:`, error);
    throw error;
  }
}

export async function getWorkflowsSummary(siteId: string): Promise<any> {
  try {
    const res: any = await api.get(`/workflows/stats/summary?siteId=${siteId}`);
    return res?.data || {};
  } catch (error) {
    console.error(`Error fetching workflows summary for site ${siteId}:`, error);
    throw error;
  }
}

// Legacy activity API (still available)
export async function getWorkflowActivity(workflowId: string): Promise<ActivityLog[]> {
  try {
    const res: any = await api.get(`/workflows/analytics/workflow/${workflowId}/activity`);
    // The backend returns { activities, totalCount, hasMore }, we need the activities array
    return res?.data?.activities || res?.data || [];
  } catch (error) {
    console.error(`Error fetching activity for workflow ${workflowId}:`, error);
    throw error;
  }
}

export const getWorkflowSummary = async (workflowId: string, from: Date, to: Date): Promise<WorkflowActivitySummary[]> => {
  try {
    const response = await api.get(`/workflows/analytics/workflow/${workflowId}/chart`, {
      params: {
        period: '30d'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching workflow summary:', error);
    return [];
  }
};

export const getWorkflowNodePerformance = async (workflowId: string): Promise<NodePerformance[]> => {
  try {
    console.log('Fetching node performance for workflow:', workflowId);
    const response = await api.get(`/workflows/analytics/workflow/${workflowId}/nodes`);
    console.log('Node performance response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching node performance:', error);
    return [];
  }
};

export const getWorkflowTriggerTypes = async (workflowId: string): Promise<TriggerTypeData[]> => {
  try {
    console.log('Fetching trigger types for workflow:', workflowId);
    const response = await api.get(`/workflows/analytics/workflow/${workflowId}/triggers`);
    console.log('Trigger types response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching trigger types:', error);
    return [];
  }
};

export const getWorkflowActionTypes = async (workflowId: string): Promise<ActionTypeData[]> => {
  try {
    console.log('Fetching action types for workflow:', workflowId);
    const response = await api.get(`/workflows/analytics/workflow/${workflowId}/actions`);
    console.log('Action types response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching action types:', error);
    return [];
  }
};

export const getWorkflowHourlyData = async (workflowId: string): Promise<HourlyData[]> => {
  try {
    console.log('Fetching hourly data for workflow:', workflowId);
    const response = await api.get(`/workflows/analytics/workflow/${workflowId}/hourly`);
    console.log('Hourly data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching hourly data:', error);
    return [];
  }
};

export async function getWorkflowFunnelData(workflowId: string, dateRange?: { startDate?: Date; endDate?: Date }): Promise<WorkflowFunnelData> {
  try {
    const params: any = {};
    if (dateRange?.startDate) {
      params.startDate = dateRange.startDate.toISOString();
    }
    if (dateRange?.endDate) {
      params.endDate = dateRange.endDate.toISOString();
    }

    const response = await api.get(`/workflows/analytics/funnel/${workflowId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching workflow funnel data:', error);
    throw error;
  }
}

// Export the cleaning function in case you need it elsewhere
export { cleanWorkflowData };