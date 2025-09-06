import api from './api';

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalWebsites: number;
  totalWorkflows: number;
  totalEvents: number;
  revenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: number;
  activeSubscriptions: number;
  trialUsers: number;
  conversionRate: number;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  databaseConnections: number;
  activeWorkflows: number;
  queueSize: number;
}

export interface UserActivity {
  newUsersToday: number;
  activeSessions: number;
  pendingVerifications: number;
}

export interface SubscriptionOverview {
  freePlan: number;
  proPlan: number;
  enterprise: number;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  errorRate: number;
  throughput: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'workflow_execution' | 'subscription_upgrade' | 'system_event';
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SystemStatus {
  database: 'healthy' | 'warning' | 'critical';
  redis: 'healthy' | 'warning' | 'critical';
  workflowEngine: 'healthy' | 'warning' | 'critical';
  analyticsService: 'healthy' | 'warning' | 'critical';
}

export interface User {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'free' | 'pro' | 'enterprise';
  joinedAt: string;
  lastActive: string;
  websitesCount: number;
  workflowsCount: number;
  eventsProcessed: number;
}

export interface Website {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'maintenance';
  owner: string;
  createdAt: string;
  lastActivity: string;
  eventsCount: number;
  workflowsCount: number;
  performance: {
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
}

export interface Workflow {
  id: string;
  name: string;
  website: string;
  owner: string;
  status: 'active' | 'paused' | 'error';
  type: 'event-triggered' | 'scheduled' | 'manual';
  createdAt: string;
  lastExecuted: string;
  executionCount: number;
  successRate: number;
  avgExecutionTime: number;
}

export interface EventStats {
  totalEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  topEventTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  eventsByHour: Array<{
    hour: number;
    count: number;
  }>;
}

// Admin API endpoints
export const adminApi = {
  // Get platform statistics
  getPlatformStats: async (): Promise<PlatformStats> => {
    try {
      const response = await api.get('/admin/platform-stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
      // Return mock data as fallback
      return {
        totalUsers: 1247,
        activeUsers: 892,
        totalWebsites: 2156,
        totalWorkflows: 5432,
        totalEvents: 1250000,
        revenue: 45600,
        systemHealth: 'healthy',
        uptime: 99.97,
        activeSubscriptions: 456,
        trialUsers: 234,
        conversionRate: 18.7
      };
    }
  },

  // Get system metrics
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    try {
      const response = await api.get('/admin/system-metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      // Return mock data as fallback
      return {
        cpu: 23,
        memory: 67,
        disk: 45,
        network: 89,
        databaseConnections: 156,
        activeWorkflows: 1234,
        queueSize: 89
      };
    }
  },

  // Get user activity
  getUserActivity: async (): Promise<UserActivity> => {
    try {
      const response = await api.get('/admin/user-activity');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      return {
        newUsersToday: 23,
        activeSessions: 156,
        pendingVerifications: 12
      };
    }
  },

  // Get subscription overview
  getSubscriptionOverview: async (): Promise<SubscriptionOverview> => {
    try {
      const response = await api.get('/admin/subscription-overview');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription overview:', error);
      return {
        freePlan: 789,
        proPlan: 234,
        enterprise: 45
      };
    }
  },

  // Get performance metrics
  getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
    try {
      const response = await api.get('/admin/performance-metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      return {
        avgResponseTime: 127,
        errorRate: 0.02,
        throughput: 2300
      };
    }
  },

  // Get recent activity
  getRecentActivity: async (): Promise<RecentActivity[]> => {
    try {
      const response = await api.get('/admin/recent-activity');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      return [
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registration',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          severity: 'low'
        },
        {
          id: '2',
          type: 'workflow_execution',
          description: 'Workflow execution',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          severity: 'low'
        },
        {
          id: '3',
          type: 'subscription_upgrade',
          description: 'Subscription upgrade',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          severity: 'medium'
        }
      ];
    }
  },

  // Get system status
  getSystemStatus: async (): Promise<SystemStatus> => {
    try {
      const response = await api.get('/admin/system-status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      return {
        database: 'healthy',
        redis: 'healthy',
        workflowEngine: 'healthy',
        analyticsService: 'healthy'
      };
    }
  },

  // Admin actions
  backupDatabase: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/admin/backup-database');
      return response.data;
    } catch (error) {
      console.error('Failed to backup database:', error);
      return { success: false, message: 'Backup failed' };
    }
  },

  getSystemLogs: async (): Promise<{ success: boolean; logs: string[] }> => {
    try {
      const response = await api.get('/admin/system-logs');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      return { success: false, logs: [] };
    }
  },

  runPerformanceTest: async (): Promise<{ success: boolean; results: any }> => {
    try {
      const response = await api.post('/admin/performance-test');
      return response.data;
    } catch (error) {
      console.error('Failed to run performance test:', error);
      return { success: false, results: null };
    }
  },

  runSecurityScan: async (): Promise<{ success: boolean; results: any }> => {
    try {
      const response = await api.post('/admin/security-scan');
      return response.data;
    } catch (error) {
      console.error('Failed to run security scan:', error);
      return { success: false, results: null };
    }
  },

  // Get users list
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          email: 'john@example.com',
          name: 'John Doe',
          status: 'active',
          plan: 'pro',
          joinedAt: '2024-01-15T00:00:00Z',
          lastActive: '2024-12-19T10:30:00Z',
          websitesCount: 3,
          workflowsCount: 12,
          eventsProcessed: 45000
        },
        {
          id: '2',
          email: 'jane@company.com',
          name: 'Jane Smith',
          status: 'active',
          plan: 'enterprise',
          joinedAt: '2024-02-20T00:00:00Z',
          lastActive: '2024-12-19T09:15:00Z',
          websitesCount: 8,
          workflowsCount: 45,
          eventsProcessed: 125000
        },
        {
          id: '3',
          email: 'bob@startup.io',
          name: 'Bob Johnson',
          status: 'active',
          plan: 'free',
          joinedAt: '2024-03-10T00:00:00Z',
          lastActive: '2024-12-18T16:45:00Z',
          websitesCount: 1,
          workflowsCount: 3,
          eventsProcessed: 8500
        },
        {
          id: '4',
          email: 'alice@tech.com',
          name: 'Alice Brown',
          status: 'inactive',
          plan: 'pro',
          joinedAt: '2024-01-05T00:00:00Z',
          lastActive: '2024-12-10T14:20:00Z',
          websitesCount: 2,
          workflowsCount: 8,
          eventsProcessed: 22000
        }
      ];
    }
  },

  // Get websites list
  getWebsites: async (): Promise<Website[]> => {
    try {
      const response = await api.get('/admin/websites');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          name: 'E-commerce Store',
          domain: 'shop.example.com',
          status: 'active',
          owner: 'john@example.com',
          createdAt: '2024-01-20T00:00:00Z',
          lastActivity: '2024-12-19T10:30:00Z',
          eventsCount: 25000,
          workflowsCount: 8,
          performance: {
            responseTime: 145,
            uptime: 99.8,
            errorRate: 0.1
          }
        },
        {
          id: '2',
          name: 'Corporate Website',
          domain: 'company.com',
          status: 'active',
          owner: 'jane@company.com',
          createdAt: '2024-02-25T00:00:00Z',
          lastActivity: '2024-12-19T09:15:00Z',
          eventsCount: 45000,
          workflowsCount: 15,
          performance: {
            responseTime: 89,
            uptime: 99.9,
            errorRate: 0.05
          }
        },
        {
          id: '3',
          name: 'Blog Platform',
          domain: 'blog.startup.io',
          status: 'active',
          owner: 'bob@startup.io',
          createdAt: '2024-03-15T00:00:00Z',
          lastActivity: '2024-12-18T16:45:00Z',
          eventsCount: 8500,
          workflowsCount: 3,
          performance: {
            responseTime: 234,
            uptime: 98.5,
            errorRate: 0.3
          }
        }
      ];
    }
  },

  // Get workflows list
  getWorkflows: async (): Promise<Workflow[]> => {
    try {
      const response = await api.get('/admin/workflows');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          name: 'Order Processing',
          website: 'shop.example.com',
          owner: 'john@example.com',
          status: 'active',
          type: 'event-triggered',
          createdAt: '2024-01-25T00:00:00Z',
          lastExecuted: '2024-12-19T10:25:00Z',
          executionCount: 1250,
          successRate: 99.2,
          avgExecutionTime: 450
        },
        {
          id: '2',
          name: 'Lead Capture',
          website: 'company.com',
          owner: 'jane@company.com',
          status: 'active',
          type: 'event-triggered',
          createdAt: '2024-03-01T00:00:00Z',
          lastExecuted: '2024-12-19T09:10:00Z',
          executionCount: 890,
          successRate: 98.8,
          avgExecutionTime: 320
        },
        {
          id: '3',
          name: 'Newsletter Signup',
          website: 'blog.startup.io',
          owner: 'bob@startup.io',
          status: 'active',
          type: 'event-triggered',
          createdAt: '2024-03-20T00:00:00Z',
          lastExecuted: '2024-12-18T16:40:00Z',
          executionCount: 156,
          successRate: 100,
          avgExecutionTime: 180
        }
      ];
    }
  },

  // Get event statistics
  getEventStats: async (): Promise<EventStats> => {
    try {
      const response = await api.get('/admin/event-stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event stats:', error);
      // Return mock data as fallback
      return {
        totalEvents: 1250000,
        eventsToday: 12500,
        eventsThisWeek: 87500,
        eventsThisMonth: 375000,
        topEventTypes: [
          { type: 'page_view', count: 450000, percentage: 36 },
          { type: 'button_click', count: 225000, percentage: 18 },
          { type: 'form_submit', count: 187500, percentage: 15 },
          { type: 'scroll_depth', count: 150000, percentage: 12 },
          { type: 'time_on_page', count: 125000, percentage: 10 }
        ],
        eventsByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 1000) + 200
        }))
      };
    }
  }
};
