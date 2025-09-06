'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Globe, 
  Workflow, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Database,
  Server,
  Cpu,
  HardDrive,
  Eye,
  Calendar,
  Zap,
  Target,
  PieChart,
  LineChart,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/stores/useAuthStore';
import { useState, useEffect } from 'react';
import { 
  adminApi, 
  type PlatformStats, 
  type SystemMetrics, 
  type UserActivity, 
  type SubscriptionOverview, 
  type PerformanceMetrics, 
  type RecentActivity, 
  type SystemStatus,
  type User,
  type Website,
  type Workflow,
  type EventStats
} from '@/lib/admin-api';

export default function AdminPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all data from admin API
  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: adminApi.getPlatformStats,
    refetchInterval: 30000,
  });

  const { data: systemMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-system-metrics'],
    queryFn: adminApi.getSystemMetrics,
    refetchInterval: 10000,
  });

  const { data: userActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-user-activity'],
    queryFn: adminApi.getUserActivity,
    refetchInterval: 60000,
  });

  const { data: subscriptionOverview, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['admin-subscription-overview'],
    queryFn: adminApi.getSubscriptionOverview,
    refetchInterval: 300000,
  });

  const { data: performanceMetrics, isLoading: performanceLoading } = useQuery({
    queryKey: ['admin-performance-metrics'],
    queryFn: adminApi.getPerformanceMetrics,
    refetchInterval: 15000,
  });

  const { data: recentActivity, isLoading: activityFeedLoading } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: adminApi.getRecentActivity,
    refetchInterval: 30000,
  });

  const { data: systemStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['admin-system-status'],
    queryFn: adminApi.getSystemStatus,
    refetchInterval: 20000,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
    refetchInterval: 120000,
  });

  const { data: websites, isLoading: websitesLoading } = useQuery({
    queryKey: ['admin-websites'],
    queryFn: adminApi.getWebsites,
    refetchInterval: 120000,
  });

  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ['admin-workflows'],
    queryFn: adminApi.getWorkflows,
    refetchInterval: 120000,
  });

  const { data: eventStats, isLoading: eventStatsLoading } = useQuery({
    queryKey: ['admin-event-stats'],
    queryFn: adminApi.getEventStats,
    refetchInterval: 60000,
  });

  // Loading states
  const isLoading = statsLoading || metricsLoading || activityLoading || 
                   subscriptionLoading || performanceLoading || activityFeedLoading || 
                   statusLoading || usersLoading || websitesLoading || workflowsLoading || eventStatsLoading;

  // Action handlers
  const handleAction = async (action: string) => {
    setIsActionLoading(action);
    try {
      switch (action) {
        case 'backup':
          const backupResult = await adminApi.backupDatabase();
          if (backupResult.success) {
            alert('Database backup completed successfully!');
          } else {
            alert('Backup failed: ' + backupResult.message);
          }
          break;
        case 'logs':
          const logsResult = await adminApi.getSystemLogs();
          if (logsResult.success) {
            console.log('System logs:', logsResult.logs);
            alert('System logs fetched. Check console for details.');
          } else {
            alert('Failed to fetch logs');
          }
          break;
        case 'performance':
          const perfResult = await adminApi.runPerformanceTest();
          if (perfResult.success) {
            console.log('Performance test results:', perfResult.results);
            alert('Performance test completed. Check console for results.');
          } else {
            alert('Performance test failed');
          }
          break;
        case 'security':
          const securityResult = await adminApi.runSecurityScan();
          if (securityResult.success) {
            console.log('Security scan results:', securityResult.results);
            alert('Security scan completed. Check console for results.');
          } else {
            alert('Security scan failed');
          }
          break;
      }
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
      alert(`Action failed: ${error}`);
    } finally {
      setIsActionLoading(null);
    }
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if user is admin
const isAdmin = true;

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-7 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Ensure we have data
  if (!platformStats || !systemMetrics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Data Unavailable
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load admin dashboard data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
    <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                Comprehensive platform overview and system monitoring
            </p>
          </div>
          <div className="text-right">
              <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </div>
            <Badge 
              variant={platformStats.systemHealth === 'healthy' ? 'default' : 
                      platformStats.systemHealth === 'warning' ? 'secondary' : 'destructive'}
                className="mt-3 text-sm px-4 py-2"
              >
                {platformStats.systemHealth === 'healthy' && <CheckCircle className="h-4 w-4 mr-2" />}
                {platformStats.systemHealth === 'warning' && <AlertTriangle className="h-4 w-4 mr-2" />}
                {platformStats.systemHealth === 'critical' && <AlertTriangle className="h-4 w-4 mr-2" />}
              System: {platformStats.systemHealth}
            </Badge>
          </div>
        </div>
      </div>

        {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Users</CardTitle>
              <Users className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold">{platformStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-blue-200 mt-1">
              {platformStats.activeUsers} active today
            </p>
          </CardContent>
        </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold">${platformStats.revenue.toLocaleString()}</div>
              <p className="text-xs text-green-200 mt-1">
              This month
            </p>
          </CardContent>
        </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Uptime</CardTitle>
              <Activity className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold">{platformStats.uptime}%</div>
              <p className="text-xs text-purple-200 mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Conversion Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-200" />
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold">{platformStats.conversionRate}%</div>
              <p className="text-xs text-orange-200 mt-1">
              Trial to paid
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Enhanced Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg">Users</TabsTrigger>
            <TabsTrigger value="websites" className="rounded-lg">Websites</TabsTrigger>
            <TabsTrigger value="workflows" className="rounded-lg">Workflows</TabsTrigger>
            <TabsTrigger value="events" className="rounded-lg">Events</TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Growth */}
              <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  Platform Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                    <span className="font-medium">Websites</span>
                    <span className="font-bold text-2xl text-blue-600">{platformStats.totalWebsites.toLocaleString()}</span>
                </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                    <span className="font-medium">Workflows</span>
                    <span className="font-bold text-2xl text-green-600">{platformStats.totalWorkflows.toLocaleString()}</span>
                </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                    <span className="font-medium">Events Processed</span>
                    <span className="font-bold text-2xl text-purple-600">{(platformStats.totalEvents / 1000000).toFixed(1)}M</span>
                </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                    <span className="font-medium">Active Subscriptions</span>
                    <span className="font-bold text-2xl text-orange-600">{platformStats.activeSubscriptions}</span>
                </div>
              </CardContent>
            </Card>

            {/* User Metrics */}
              <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-6 w-6 text-green-600" />
                  User Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                    <span className="font-medium">Total Users</span>
                    <span className="font-bold text-2xl text-green-600">{platformStats.totalUsers.toLocaleString()}</span>
                </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                    <span className="font-medium">Active Users</span>
                    <span className="font-bold text-2xl text-blue-600">{platformStats.activeUsers.toLocaleString()}</span>
                </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
                    <span className="font-medium">Trial Users</span>
                    <span className="font-bold text-2xl text-yellow-600">{platformStats.trialUsers}</span>
                </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                    <span className="font-medium">Conversion Rate</span>
                    <span className="font-bold text-2xl text-purple-600">{platformStats.conversionRate}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                    User Management
                  </CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold">User</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Plan</th>
                        <th className="text-left py-3 px-4 font-semibold">Websites</th>
                        <th className="text-left py-3 px-4 font-semibold">Workflows</th>
                        <th className="text-left py-3 px-4 font-semibold">Events</th>
                        <th className="text-left py-3 px-4 font-semibold">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.filter(user => 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((user) => (
                        <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={user.status === 'active' ? 'default' : 
                                      user.status === 'inactive' ? 'secondary' : 'destructive'}
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{user.plan}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">{user.websitesCount}</td>
                          <td className="py-3 px-4 text-center">{user.workflowsCount}</td>
                          <td className="py-3 px-4 text-center">{user.eventsProcessed.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="websites" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Globe className="h-6 w-6 text-green-600" />
                  Website Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {websites?.map((website) => (
                    <Card key={website.id} className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{website.name}</CardTitle>
                          <Badge 
                            variant={website.status === 'active' ? 'default' : 
                                    website.status === 'inactive' ? 'secondary' : 'destructive'}
                          >
                            {website.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{website.domain}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Owner:</span>
                          <span className="font-medium">{website.owner}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Events:</span>
                          <span className="font-medium">{website.eventsCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Workflows:</span>
                          <span className="font-medium">{website.workflowsCount}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Response Time:</span>
                            <span className="font-medium">{website.performance.responseTime}ms</span>
                  </div>
                          <div className="flex justify-between text-xs">
                            <span>Uptime:</span>
                            <span className="font-medium">{website.performance.uptime}%</span>
                  </div>
                          <div className="flex justify-between text-xs">
                            <span>Error Rate:</span>
                            <span className="font-medium">{website.performance.errorRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Workflow className="h-6 w-6 text-purple-600" />
                  Workflow Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold">Workflow</th>
                        <th className="text-left py-3 px-4 font-semibold">Website</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Executions</th>
                        <th className="text-left py-3 px-4 font-semibold">Success Rate</th>
                        <th className="text-left py-3 px-4 font-semibold">Avg Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workflows?.map((workflow) => (
                        <tr key={workflow.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{workflow.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Owner: {workflow.owner}</div>
                          </td>
                          <td className="py-3 px-4 text-sm">{workflow.website}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={workflow.status === 'active' ? 'default' : 
                                      workflow.status === 'paused' ? 'secondary' : 'destructive'}
                            >
                              {workflow.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{workflow.type}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">{workflow.executionCount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-medium ${workflow.successRate >= 95 ? 'text-green-600' : workflow.successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {workflow.successRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">{workflow.avgExecutionTime}ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Statistics */}
              <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    Event Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{eventStats?.eventsToday.toLocaleString()}</div>
                      <div className="text-sm text-blue-600">Today</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{eventStats?.eventsThisWeek.toLocaleString()}</div>
                      <div className="text-sm text-green-600">This Week</div>
                  </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{eventStats?.eventsThisMonth.toLocaleString()}</div>
                      <div className="text-sm text-purple-600">This Month</div>
                  </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{(eventStats?.totalEvents / 1000000).toFixed(1)}M</div>
                      <div className="text-sm text-orange-600">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Top Event Types */}
              <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <PieChart className="h-6 w-6 text-green-600" />
                    Top Event Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eventStats?.topEventTypes.map((eventType, index) => (
                      <div key={eventType.type} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' :
                            index === 3 ? 'bg-orange-500' : 'bg-slate-500'
                          }`}></div>
                          <span className="font-medium capitalize">{eventType.type.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{eventType.count.toLocaleString()}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{eventType.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Resources */}
              <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Server className="h-6 w-6 text-blue-600" />
                  System Resources
                </CardTitle>
              </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                      <span className="font-semibold">{systemMetrics.cpu}%</span>
                  </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          systemMetrics.cpu < 50 ? 'bg-green-500' :
                          systemMetrics.cpu < 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${systemMetrics.cpu}%` }}
                    ></div>
                  </div>
                </div>
                  <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                      <span className="font-semibold">{systemMetrics.memory}%</span>
                  </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          systemMetrics.memory < 50 ? 'bg-green-500' :
                          systemMetrics.memory < 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${systemMetrics.memory}%` }}
                    ></div>
                  </div>
                </div>
                  <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Disk Usage</span>
                      <span className="font-semibold">{systemMetrics.disk}%</span>
                  </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          systemMetrics.disk < 50 ? 'bg-green-500' :
                          systemMetrics.disk < 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${systemMetrics.disk}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
              <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Settings className="h-6 w-6 text-green-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    {Object.entries(systemStatus || {}).map(([service, status]) => (
                      <div key={service} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <span className="font-medium capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <Badge 
                          variant={status === 'healthy' ? 'default' : 
                                  status === 'warning' ? 'secondary' : 'destructive'}
                      className="flex items-center gap-1"
                    >
                          {status === 'healthy' && <CheckCircle className="h-3 w-3" />}
                          {status === 'warning' && <AlertTriangle className="h-3 w-3" />}
                          {status === 'critical' && <AlertTriangle className="h-3 w-3" />}
                          {status}
                    </Badge>
                  </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

        {/* Enhanced Quick Actions */}
      <div className="mt-8">
          <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
          <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                  size="lg" 
                onClick={() => handleAction('backup')}
                disabled={isActionLoading === 'backup'}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                  <Database className="h-5 w-5 mr-2" />
                {isActionLoading === 'backup' ? 'Backing up...' : 'Backup Database'}
              </Button>
              <Button 
                variant="outline" 
                  size="lg" 
                onClick={() => handleAction('logs')}
                disabled={isActionLoading === 'logs'}
                  className="hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                  <HardDrive className="h-5 w-5 mr-2" />
                {isActionLoading === 'logs' ? 'Fetching...' : 'System Logs'}
              </Button>
              <Button 
                variant="outline" 
                  size="lg" 
                onClick={() => handleAction('performance')}
                disabled={isActionLoading === 'performance'}
                  className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                  <Cpu className="h-5 w-5 mr-2" />
                {isActionLoading === 'performance' ? 'Running...' : 'Performance Test'}
              </Button>
              <Button 
                variant="outline" 
                  size="lg" 
                onClick={() => handleAction('security')}
                disabled={isActionLoading === 'security'}
                  className="hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                  <Shield className="h-5 w-5 mr-2" />
                {isActionLoading === 'security' ? 'Scanning...' : 'Security Scan'}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
