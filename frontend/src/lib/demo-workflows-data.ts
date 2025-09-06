// =============================================================================
// DEMO WORKFLOWS DATA
// =============================================================================

export interface DemoWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'archived';
  trigger_type: 'page_view' | 'click' | 'form_submit' | 'scroll' | 'exit_intent' | 'custom_event';
  conditions: string[];
  actions: string[];
  created_at: string;
  updated_at: string;
  last_executed?: string;
  execution_count: number;
  success_rate: number;
  avg_execution_time: number;
  is_enabled: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface DemoWorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  visitor_id: string;
  session_id: string;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  started_at: string;
  completed_at?: string;
  execution_time?: number;
  error_message?: string;
  page_url: string;
  trigger_data: Record<string, any>;
  action_results: Array<{
    action: string;
    status: 'success' | 'failed';
    result?: any;
    error?: string;
  }>;
}

export interface DemoWorkflowStats {
  total_workflows: number;
  active_workflows: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time: number;
  success_rate: number;
  executions_today: number;
  executions_this_week: number;
  executions_this_month: number;
}

export class DemoWorkflowsData {
  // =============================================================================
  // WORKFLOWS LIST
  // =============================================================================

  static getWorkflows(): DemoWorkflow[] {
    return [
      {
        id: 'wf-001',
        name: 'Welcome Message for New Visitors',
        description: 'Shows a personalized welcome message to first-time visitors',
        status: 'active',
        trigger_type: 'page_view',
        conditions: ['is_new_user = true', 'page = "/"'],
        actions: ['show_popup', 'set_cookie'],
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        last_executed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        execution_count: 1247,
        success_rate: 98.5,
        avg_execution_time: 0.8,
        is_enabled: true,
        priority: 'high',
        tags: ['onboarding', 'conversion']
      },
      {
        id: 'wf-002',
        name: 'Exit Intent Popup',
        description: 'Captures visitors before they leave with a special offer',
        status: 'active',
        trigger_type: 'exit_intent',
        conditions: ['page_views > 2', 'time_on_page > 30'],
        actions: ['show_popup', 'track_event'],
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        last_executed: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        execution_count: 892,
        success_rate: 94.2,
        avg_execution_time: 1.2,
        is_enabled: true,
        priority: 'medium',
        tags: ['retention', 'conversion']
      },
      {
        id: 'wf-003',
        name: 'Product Recommendation Engine',
        description: 'Suggests relevant products based on browsing behavior',
        status: 'active',
        trigger_type: 'custom_event',
        conditions: ['event_type = "product_view"', 'browsing_time > 60'],
        actions: ['show_recommendations', 'update_profile'],
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        last_executed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        execution_count: 2156,
        success_rate: 96.8,
        avg_execution_time: 2.1,
        is_enabled: true,
        priority: 'high',
        tags: ['personalization', 'sales']
      },
      {
        id: 'wf-004',
        name: 'Form Abandonment Recovery',
        description: 'Follows up with users who started but didn\'t complete forms',
        status: 'active',
        trigger_type: 'form_submit',
        conditions: ['form_started = true', 'form_completed = false'],
        actions: ['send_email', 'show_reminder'],
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        last_executed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        execution_count: 567,
        success_rate: 89.3,
        avg_execution_time: 0.5,
        is_enabled: true,
        priority: 'medium',
        tags: ['lead_generation', 'follow_up']
      },
      {
        id: 'wf-005',
        name: 'Scroll Depth Engagement',
        description: 'Tracks and rewards deep page engagement',
        status: 'active',
        trigger_type: 'scroll',
        conditions: ['scroll_depth > 80', 'time_on_page > 45'],
        actions: ['show_achievement', 'track_engagement'],
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        last_executed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        execution_count: 1893,
        success_rate: 99.1,
        avg_execution_time: 0.3,
        is_enabled: true,
        priority: 'low',
        tags: ['engagement', 'gamification']
      },
      {
        id: 'wf-006',
        name: 'Mobile Experience Optimizer',
        description: 'Adapts content and interactions for mobile users',
        status: 'paused',
        trigger_type: 'page_view',
        conditions: ['device = "mobile"', 'screen_width < 768'],
        actions: ['optimize_layout', 'adjust_content'],
        created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        last_executed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        execution_count: 3421,
        success_rate: 92.7,
        avg_execution_time: 1.8,
        is_enabled: false,
        priority: 'medium',
        tags: ['mobile', 'optimization']
      },
      {
        id: 'wf-007',
        name: 'A/B Test Coordinator',
        description: 'Manages and tracks A/B test variations',
        status: 'draft',
        trigger_type: 'custom_event',
        conditions: ['test_group = "active"', 'page_load = true'],
        actions: ['assign_variant', 'track_performance'],
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        last_executed: undefined,
        execution_count: 0,
        success_rate: 0,
        avg_execution_time: 0,
        is_enabled: false,
        priority: 'high',
        tags: ['testing', 'optimization']
      },
      {
        id: 'wf-008',
        name: 'Customer Support Chat',
        description: 'Automatically offers help to struggling users',
        status: 'active',
        trigger_type: 'custom_event',
        conditions: ['error_count > 0', 'time_on_page > 120'],
        actions: ['show_chat_widget', 'offer_help'],
        created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        last_executed: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        execution_count: 234,
        success_rate: 97.4,
        avg_execution_time: 0.9,
        is_enabled: true,
        priority: 'high',
        tags: ['support', 'user_experience']
      }
    ];
  }

  // =============================================================================
  // WORKFLOW EXECUTIONS
  // =============================================================================

  static getWorkflowExecutions(): DemoWorkflowExecution[] {
    const workflows = this.getWorkflows();
    const executions: DemoWorkflowExecution[] = [];
    
    workflows.forEach(workflow => {
      if (workflow.execution_count > 0) {
        // Generate some recent executions for each workflow
        for (let i = 0; i < Math.min(workflow.execution_count, 10); i++) {
          const executionTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
          const isSuccess = Math.random() > 0.05; // 95% success rate
          
          executions.push({
            id: `exec-${workflow.id}-${i}`,
            workflow_id: workflow.id,
            workflow_name: workflow.name,
            visitor_id: `visitor-${Math.floor(Math.random() * 1000)}`,
            session_id: `session-${Math.floor(Math.random() * 1000)}`,
            status: isSuccess ? 'success' : 'failed',
            started_at: executionTime.toISOString(),
            completed_at: new Date(executionTime.getTime() + workflow.avg_execution_time * 1000).toISOString(),
            execution_time: workflow.avg_execution_time,
            error_message: isSuccess ? undefined : 'Action timeout exceeded',
            page_url: ['/', '/products', '/about', '/contact', '/blog'][Math.floor(Math.random() * 5)],
            trigger_data: {
              page: '/',
              timestamp: executionTime.toISOString(),
              user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            action_results: workflow.actions.map(action => ({
              action,
              status: isSuccess ? 'success' : (Math.random() > 0.5 ? 'success' : 'failed'),
              result: isSuccess ? { completed: true, timestamp: executionTime.toISOString() } : undefined,
              error: isSuccess ? undefined : 'Action execution failed'
            }))
          });
        }
      }
    });
    
    // Sort by most recent
    return executions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  // =============================================================================
  // WORKFLOW STATISTICS
  // =============================================================================

  static getWorkflowStats(): DemoWorkflowStats {
    const workflows = this.getWorkflows();
    const executions = this.getWorkflowExecutions();
    
    const totalExecutions = workflows.reduce((sum, w) => sum + w.execution_count, 0);
    const successfulExecutions = workflows.reduce((sum, w) => sum + Math.floor(w.execution_count * w.success_rate / 100), 0);
    const failedExecutions = totalExecutions - successfulExecutions;
    
    const avgExecutionTime = workflows.reduce((sum, w) => sum + w.avg_execution_time, 0) / workflows.length;
    const overallSuccessRate = (successfulExecutions / totalExecutions) * 100;
    
    // Calculate recent executions
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const executionsToday = executions.filter(e => new Date(e.started_at) > oneDayAgo).length;
    const executionsThisWeek = executions.filter(e => new Date(e.started_at) > oneWeekAgo).length;
    const executionsThisMonth = executions.filter(e => new Date(e.started_at) > oneMonthAgo).length;
    
    return {
      total_workflows: workflows.length,
      active_workflows: workflows.filter(w => w.status === 'active').length,
      total_executions: totalExecutions,
      successful_executions: successfulExecutions,
      failed_executions: failedExecutions,
      avg_execution_time: avgExecutionTime,
      success_rate: overallSuccessRate,
      executions_today: executionsToday,
      executions_this_week: executionsThisWeek,
      executions_this_month: executionsThisMonth
    };
  }

  // =============================================================================
  // WORKFLOW TEMPLATES
  // =============================================================================

  static getWorkflowTemplates() {
    return [
      {
        id: 'template-001',
        name: 'Lead Generation Funnel',
        description: 'Complete funnel from visitor to lead conversion',
        category: 'conversion',
        difficulty: 'intermediate',
        estimated_time: '2-3 hours',
        tags: ['funnel', 'conversion', 'lead_generation'],
        preview_image: '/api/placeholder/400/300'
      },
      {
        id: 'template-002',
        name: 'User Onboarding Sequence',
        description: 'Welcome and guide new users through your platform',
        category: 'onboarding',
        difficulty: 'beginner',
        estimated_time: '1-2 hours',
        tags: ['onboarding', 'user_experience', 'retention'],
        preview_image: '/api/placeholder/400/300'
      },
      {
        id: 'template-003',
        name: 'E-commerce Optimization',
        description: 'Boost sales with product recommendations and cart recovery',
        category: 'ecommerce',
        difficulty: 'advanced',
        estimated_time: '3-4 hours',
        tags: ['ecommerce', 'sales', 'optimization'],
        preview_image: '/api/placeholder/400/300'
      },
      {
        id: 'template-004',
        name: 'Customer Support Automation',
        description: 'Automate common support scenarios and improve response times',
        category: 'support',
        difficulty: 'intermediate',
        estimated_time: '2-3 hours',
        tags: ['support', 'automation', 'customer_service'],
        preview_image: '/api/placeholder/400/300'
      }
    ];
  }

  // =============================================================================
  // PERFORMANCE METRICS
  // =============================================================================

  static getPerformanceMetrics() {
    return {
      trigger_performance: [
        { trigger: 'page_view', count: 15420, success_rate: 98.2, avg_time: 0.8 },
        { trigger: 'click', count: 8920, success_rate: 96.8, avg_time: 1.1 },
        { trigger: 'form_submit', count: 3450, success_rate: 94.5, avg_time: 0.6 },
        { trigger: 'scroll', count: 12340, success_rate: 99.1, avg_time: 0.3 },
        { trigger: 'exit_intent', count: 5670, success_rate: 93.2, avg_time: 1.2 },
        { trigger: 'custom_event', count: 7890, success_rate: 97.8, avg_time: 1.5 }
      ],
      action_performance: [
        { action: 'show_popup', count: 12340, success_rate: 98.5, avg_time: 0.4 },
        { action: 'send_email', count: 5670, success_rate: 96.2, avg_time: 0.8 },
        { action: 'track_event', count: 18920, success_rate: 99.8, avg_time: 0.2 },
        { action: 'update_profile', count: 3450, success_rate: 94.7, avg_time: 1.2 },
        { action: 'show_recommendations', count: 8920, success_rate: 97.3, avg_time: 0.9 }
      ]
    };
  }
}

// =============================================================================
// DEMO HOOKS (REPLACEMENT FOR REAL API HOOKS)
// =============================================================================

export const useDemoWorkflows = () => {
  return {
    data: DemoWorkflowsData.getWorkflows(),
    isLoading: false,
    error: null,
  };
};

export const useDemoWorkflowExecutions = () => {
  return {
    data: DemoWorkflowsData.getWorkflowExecutions(),
    isLoading: false,
    error: null,
  };
};

export const useDemoWorkflowStats = () => {
  return {
    data: DemoWorkflowsData.getWorkflowStats(),
    isLoading: false,
    error: null,
  };
};

export const useDemoWorkflowTemplates = () => {
  return {
    data: DemoWorkflowsData.getWorkflowTemplates(),
    isLoading: false,
    error: null,
  };
};

export const useDemoWorkflowPerformance = () => {
  return {
    data: DemoWorkflowsData.getPerformanceMetrics(),
    isLoading: false,
    error: null,
  };
};
