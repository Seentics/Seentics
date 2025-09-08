'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, subDays } from 'date-fns';

import { 
  useFunnels,
  useFunnelAnalytics,
  useDetailedFunnelAnalytics,
  useUpdateFunnel,
  useDeleteFunnel,
  type Funnel,
  type FunnelAnalytics
} from '@/lib/analytics-api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Edit, Play, Pause, Trash2, Target, CircleCheckBig, Percent, Activity, ArrowLeft, TrendingUp, TrendingDown, Clock, Users, AlertCircle } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/stores/useAuthStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsKeys } from '@/lib/analytics-api';

// Import funnel components
import { EnhancedFunnelChart } from '@/components/analytics/EnhancedFunnelChart';
import { StepByStepAnalysis } from '@/components/analytics/StepByStepAnalysis';
import { CohortAnalysis } from '@/components/analytics/CohortAnalysis';
import { FunnelComparison } from '@/components/analytics/FunnelComparison';

// Helper function to format time with proper precision
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00.00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const wholeSeconds = Math.floor(remainingSeconds);
  const milliseconds = Math.round((remainingSeconds - wholeSeconds) * 100);
  
  return `${minutes}:${wholeSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

export default function FunnelDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const websiteId = params.websiteId as string;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<number>(7);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug logging
  console.log('FunnelDetailPage - ID:', id);
  console.log('FunnelDetailPage - WebsiteID:', websiteId);
  console.log('FunnelDetailPage - User:', user);

  const { data: funnels = [], isLoading: isLoadingFunnels } = useFunnels(websiteId);
  const funnel = funnels.find(f => f.id === id);
  
  const { data: funnelAnalyticsResponse, isLoading: isLoadingAnalytics } = useFunnelAnalytics(id, dateRange);
  const { data: detailedAnalyticsResponse, isLoading: isLoadingDetailed } = useDetailedFunnelAnalytics(id, dateRange);
  
  // Transform API response to match expected interface using real data
  const funnelAnalytics = funnelAnalyticsResponse?.analytics?.[0] ? {
    funnelId: id,
    totalVisitors: funnelAnalyticsResponse.analytics[0].total_starts,
    steps: detailedAnalyticsResponse?.data?.step_analytics?.map((stepAnalytics: any, index: number) => ({
      stepId: stepAnalytics.step_id,
      name: stepAnalytics.step_name,
      count: stepAnalytics.visitors_reached || 0,
      conversionRate: isFinite(stepAnalytics.conversion_rate) ? stepAnalytics.conversion_rate : 0,
      dropOffRate: isFinite(stepAnalytics.drop_off_rate) ? stepAnalytics.drop_off_rate : 0,
      avgTimeOnStep: stepAnalytics.avg_time_on_step || 0
    })) || funnel?.steps?.map((step, index) => {
      if (index === 0) {
        // First step - all visitors enter here
        return {
          stepId: `step${step.order}`,
          name: step.name,
          count: funnelAnalyticsResponse.analytics[0].total_starts,
          conversionRate: 100,
          dropOffRate: 0,
          avgTimeOnStep: funnelAnalyticsResponse.analytics[0].avg_value || 0
        };
      } else if (index === funnel.steps.length - 1) {
        // Last step - conversion goal
        return {
          stepId: `step${step.order}`,
          name: step.name,
          count: funnelAnalyticsResponse.analytics[0].total_conversions,
          conversionRate: funnelAnalyticsResponse.analytics[0].conversion_rate,
          dropOffRate: 100 - funnelAnalyticsResponse.analytics[0].conversion_rate,
          avgTimeOnStep: funnelAnalyticsResponse.analytics[0].avg_value || 0
        };
      } else {
        // Fallback for middle steps if detailed analytics not available
        const previousStepCount = index === 1 ? funnelAnalyticsResponse.analytics[0].total_starts : 0;
        const currentStepCount = Math.floor(previousStepCount * 0.8);
        const conversionRate = previousStepCount > 0 ? (currentStepCount / previousStepCount) * 100 : 0;
        const dropOffRate = previousStepCount > 0 ? ((previousStepCount - currentStepCount) / previousStepCount) * 100 : 0;
        return {
          stepId: `step${step.order}`,
          name: step.name,
          count: currentStepCount,
          conversionRate: isFinite(conversionRate) ? conversionRate : 0,
          dropOffRate: isFinite(dropOffRate) ? dropOffRate : 0,
          avgTimeOnStep: funnelAnalyticsResponse.analytics[0].avg_value || 0
        };
      }
    }) || [
      {
        stepId: 'step1',
        name: 'Funnel Entry',
        count: funnelAnalyticsResponse.analytics[0].total_starts,
        conversionRate: 100,
        dropOffRate: 0,
        avgTimeOnStep: funnelAnalyticsResponse.analytics[0].avg_value || 0
      },
      {
        stepId: 'step2',
        name: 'Funnel Completion',
        count: funnelAnalyticsResponse.analytics[0].total_conversions,
        conversionRate: isFinite(funnelAnalyticsResponse.analytics[0].conversion_rate) ? funnelAnalyticsResponse.analytics[0].conversion_rate : 0,
        dropOffRate: isFinite(funnelAnalyticsResponse.analytics[0].conversion_rate) ? 100 - funnelAnalyticsResponse.analytics[0].conversion_rate : 0,
        avgTimeOnStep: funnelAnalyticsResponse.analytics[0].avg_value || 0
      }
    ],
    overallConversionRate: isFinite(funnelAnalyticsResponse.analytics[0].conversion_rate) ? funnelAnalyticsResponse.analytics[0].conversion_rate : 0,
    biggestDropOff: {
      stepName: detailedAnalyticsResponse?.data?.step_analytics?.reduce((max: any, step: any) => 
        step.drop_off_rate > max.drop_off_rate ? step : max
      )?.step_name || funnel?.steps?.[0]?.name || 'Funnel Entry',
      dropOffRate: detailedAnalyticsResponse?.data?.step_analytics?.reduce((max: any, step: any) => 
        step.drop_off_rate > max.drop_off_rate ? step : max
      )?.drop_off_rate || (isFinite(funnelAnalyticsResponse.analytics[0].conversion_rate) ? 100 - funnelAnalyticsResponse.analytics[0].conversion_rate : 0)
    },
    dateRange: {
      startDate: new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    }
  } : null;

  // Debug logging to see what's happening with the data
  console.log('🔍 Debug - funnelAnalyticsResponse:', funnelAnalyticsResponse);
  console.log('🔍 Debug - funnelAnalytics:', funnelAnalytics);
  console.log('🔍 Debug - funnel:', funnel);
  
  const updateFunnelMutation = useUpdateFunnel();
  const deleteFunnelMutation = useDeleteFunnel();

  // Real-time updates effect
  useEffect(() => {
    if (isRealTimeEnabled && funnel?.is_active) {
      // Refresh data every 30 seconds for active funnels
      refreshIntervalRef.current = setInterval(async () => {
        setIsRefreshing(true);
        try {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: [...analyticsKeys.all, 'funnel-analytics', id] }),
            queryClient.invalidateQueries({ queryKey: [...analyticsKeys.all, 'detailed-funnel-analytics', id] })
          ]);
        } finally {
          setTimeout(() => setIsRefreshing(false), 1000); // Show refresh indicator for 1 second
        }
      }, 30000);
    } else {
      // Clear interval if real-time is disabled or funnel is inactive
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isRealTimeEnabled, funnel?.is_active, id, queryClient]);

  const handleStatusChange = async (newStatus: boolean) => {
    if (!funnel || !user) return;
    try {
      await updateFunnelMutation.mutateAsync({
        funnelId: funnel.id,
        funnelData: { is_active: newStatus }
      });

      toast({
        title: 'Funnel Updated',
        description: `"${funnel.name}" is now ${newStatus ? 'active' : 'paused'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update funnel status.`,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
     if (!funnel || !user) return;
    try {
        await deleteFunnelMutation.mutateAsync(funnel.id);
        toast({ 
          title: "Funnel Deleted", 
          description: `"${funnel.name}" has been deleted.`
        });
        router.push(`/websites/${websiteId}/funnels`);
    } catch (error) {
         toast({ 
           title: "Error deleting funnel", 
           description: "An unexpected error occurred.", 
           variant: "destructive"
         });
    }
  };

  const handleCreateWorkflow = (eventType: string = 'general') => {
    // Create a default workflow configuration based on the funnel
    const defaultWorkflow = {
      name: `${funnel?.name} - ${eventType === 'dropoff' ? 'Recovery' : eventType === 'conversion' ? 'Celebration' : 'Automation'}`,
      description: `Automated workflow for ${funnel?.name} funnel ${eventType} events`,
      nodes: [
        {
          id: 'funnel-trigger-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: {
            title: 'Funnel',
            type: 'Trigger',
            iconName: 'BarChart3',
            color: 'hsl(var(--chart-1))',
            settings: {
              funnelId: funnel?.id || '',
              eventType: eventType === 'general' ? 'dropoff' : eventType,
              stepIndex: eventType === 'conversion' ? (funnel?.steps?.length || 1) : 1,
              timeThreshold: 0,
              userSegment: '',
              minValue: 0,
              maxValue: null
            }
          }
        },
        {
          id: 'show-modal-1',
          type: 'custom',
          position: { x: 400, y: 100 },
          data: {
            title: 'Show Modal',
            type: 'Action',
            iconName: 'MessageSquare',
            color: 'hsl(var(--chart-4))',
            settings: {
              displayMode: 'simple',
              modalTitle: eventType === 'dropoff' ? 'Don\'t leave yet! 🛒' : 
                          eventType === 'conversion' ? 'Congratulations! 🎉' : 
                          'Funnel Event Detected',
              modalContent: eventType === 'dropoff' ? 
                `Complete your ${funnel?.name} journey and get exclusive benefits!` :
                eventType === 'conversion' ? 
                `You've successfully completed the ${funnel?.name} funnel!` :
                `A ${eventType} event occurred in your ${funnel?.name} funnel.`,
              bannerCtaText: eventType === 'dropoff' ? 'Continue' : 'Great!',
              bannerCtaUrl: eventType === 'dropoff' ? '/cart' : '#'
            }
          }
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'funnel-trigger-1',
          target: 'show-modal-1'
        }
      ]
    };

    // Encode the workflow data and navigate to workflow builder
    const workflowData = encodeURIComponent(JSON.stringify(defaultWorkflow));
    const params = new URLSearchParams({
      context: 'funnel',
      funnelId: funnel?.id || '',
      funnelName: funnel?.name || '',
      eventType: eventType,
      defaultWorkflow: workflowData
    });
    
    window.open(`/websites/${websiteId}/workflows/edit/new?${params.toString()}`, '_blank');
  };
  
  const loading = isLoadingFunnels || isLoadingAnalytics || isLoadingDetailed;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Funnel not found</h2>
        <p className="text-muted-foreground mb-4">
          The funnel you're looking for doesn't exist or has been deleted.
        </p>
        <Link href={`/websites/${websiteId}/funnels`}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Funnels
          </Button>
        </Link>
      </div>
    );
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 1: return 'Today';
      case 7: return 'Last 7 days';
      case 30: return 'Last 30 days';
      case 90: return 'Last 90 days';
      default: return `${dateRange} days`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/websites/${websiteId}`}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/websites/${websiteId}/funnels`}>Funnels</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{funnel.name}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section with Enhanced Design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/30">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        <div className="relative p-6 sm:p-8">
          {/* Title and Status */}
          <div className="flex flex-col space-y-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {funnel.name}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-2">
                  {funnel.description || 'Conversion funnel analysis'}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <Badge 
                    variant={funnel.is_active ? "default" : "secondary"} 
                    className={`px-3 py-1 text-sm font-medium ${
                      funnel.is_active 
                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {funnel.is_active ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                        Active
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                        Paused
                      </>
                    )}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {funnel.steps?.length || 0} steps • Created {format(new Date(funnel.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
              {/* Real-time Toggle */}
              {funnel?.is_active && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/20 backdrop-blur-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    isRealTimeEnabled 
                      ? (isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500 animate-pulse') 
                      : 'bg-gray-400'
                  }`} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {isRefreshing ? 'Updating...' : 'Live'}
                  </span>
                  <Switch
                    checked={isRealTimeEnabled}
                    onCheckedChange={setIsRealTimeEnabled}
                    className="scale-75"
                    disabled={isRefreshing}
                  />
                </div>
              )}
            </div>
          </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Time period:</span>
              <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(parseInt(value))}>
                <SelectTrigger className="w-36 bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 backdrop-blur-sm">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Today</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                onClick={() => handleCreateWorkflow('general')}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
              
              <Select onValueChange={(value) => handleCreateWorkflow(value)}>
                <SelectTrigger className="w-36 bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 backdrop-blur-sm">
                  <SelectValue placeholder="Quick Create" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dropoff">Dropoff Recovery</SelectItem>
                  <SelectItem value="conversion">Conversion Celebration</SelectItem>
                  <SelectItem value="milestone">Milestone Alert</SelectItem>
                  <SelectItem value="abandonment">Abandonment Recovery</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`/websites/${websiteId}/funnels/${id}/edit`, '_blank')}
                className="bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 backdrop-blur-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 backdrop-blur-sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Funnel</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{funnel.name}"? This action cannot be undone and will permanently remove all funnel data and analytics.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Funnel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics Cards */}
      {funnelAnalytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    People who entered your funnel
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {funnelAnalyticsResponse?.analytics?.[0]?.total_starts?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getDateRangeLabel()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Percent className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    People who completed all steps
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl sm:text-2xl font-bold">
                      {funnelAnalytics?.overallConversionRate?.toFixed(1) || '0'}%
                    </p>
                    {(funnelAnalytics?.overallConversionRate || 0) > 5 ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Good</span>
                    ) : (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Can improve</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {funnelAnalytics?.steps?.[1]?.count || 0} people finished
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Average time to complete
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {funnelAnalytics?.steps?.[0]?.avgTimeOnStep ? formatTime(funnelAnalytics.steps[0].avgTimeOnStep) : '0:00.00'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Average time per step
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Biggest problem area
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {funnelAnalytics?.biggestDropOff?.dropOffRate?.toFixed(1) || '0'}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Overall drop-off rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Funnel Visualization */}
      {funnelAnalytics && (
        <EnhancedFunnelChart 
          funnel={funnel}
          analytics={funnelAnalytics}
          isLoading={isLoadingAnalytics}
          onCreateWorkflow={handleCreateWorkflow}
        />
      )}

      {/* Simple Performance Overview */}
      {funnelAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Daily Performance */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">How your funnel performed daily</CardTitle>
              <CardDescription className="text-sm">
                Shows conversion rates for each day in the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Real daily performance chart */}
              {detailedAnalyticsResponse?.data?.daily_performance && detailedAnalyticsResponse.data.daily_performance.length > 0 ? (
                <>
                  <div className="h-40 sm:h-48 bg-muted/20 rounded-lg p-2 sm:p-4 flex items-end justify-between overflow-x-auto">
                    {detailedAnalyticsResponse.data.daily_performance.slice(0, dateRange > 7 ? 15 : 7).map((day: any, i: number) => {
                      const maxRate = Math.max(...detailedAnalyticsResponse.data.daily_performance.map((d: any) => d.conversion_rate));
                      const height = (day.conversion_rate / maxRate) * 100;
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 sm:gap-2 min-w-0 flex-shrink-0">
                          <div className="text-xs font-medium text-blue-600">{day.conversion_rate.toFixed(1)}%</div>
                          <div 
                            className="w-4 sm:w-6 bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors cursor-pointer"
                            style={{ height: `${Math.max(height, 5)}%` }}
                            title={`${day.date}: ${day.conversion_rate.toFixed(1)}% conversion (${day.conversions}/${day.total_starts})`}
                          />
                          <div className="text-xs text-muted-foreground text-center">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Real summary */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-muted-foreground">Best day</p>
                      <p className="text-base sm:text-lg font-bold text-green-600">
                        {Math.max(...detailedAnalyticsResponse.data.daily_performance.map((d: any) => d.conversion_rate)).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-muted-foreground">Your average</p>
                      <p className="text-base sm:text-lg font-bold">{funnelAnalytics?.overallConversionRate?.toFixed(1) || '0'}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-muted-foreground">Worst day</p>
                      <p className="text-base sm:text-lg font-bold text-red-600">
                        {Math.min(...detailedAnalyticsResponse.data.daily_performance.map((d: any) => d.conversion_rate)).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-48 bg-muted/20 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No daily performance data available</p>
                    <p className="text-xs">Data will appear as your funnel collects more events</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step by Step Breakdown */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">How many people complete each step</CardTitle>
              <CardDescription className="text-sm">
                See where people are getting stuck in your funnel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelAnalytics?.steps?.map((step: any, index: number) => {
                  const maxCount = Math.max(...(funnelAnalytics.steps?.map((s: any) => s.count) || [0]));
                  const widthPercentage = (step.count / maxCount) * 100;
                  
                  return (
                    <div key={step.stepId} className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="font-medium truncate">{step.name}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <span className="text-muted-foreground">{step.count?.toLocaleString() || '0'} people</span>
                          <span className="font-semibold">
                            {isFinite(step.conversionRate) ? step.conversionRate.toFixed(1) : '0'}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${widthPercentage}%` }}
                        />
                      </div>
                      {index > 0 && isFinite(step.dropOffRate) && step.dropOffRate > 0 && (
                        <div className="text-xs text-red-600 flex items-center gap-1">
                          <span>⚠️ {step.dropOffRate.toFixed(1)}% left here</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Simple insights */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700 font-medium">✅ Working well</p>
                    <p className="text-sm font-bold text-green-800">
                      {funnelAnalytics?.steps?.reduce((best: any, step: any) => 
                        step.conversionRate > best.conversionRate ? step : best
                      )?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-700 font-medium">⚠️ Needs fixing</p>
                    <p className="text-sm font-bold text-red-800">
                      {funnelAnalytics?.biggestDropOff?.stepName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Analytics Section */}
      {detailedAnalyticsResponse?.data && (
        <div className="space-y-8">
          {/* Step-by-Step Analysis */}
          <StepByStepAnalysis 
            stepAnalytics={detailedAnalyticsResponse.data.step_analytics}
            totalVisitors={funnelAnalyticsResponse?.analytics?.[0]?.total_starts || 0}
          />

          {/* Cohort Analysis */}
          <CohortAnalysis 
            cohortData={detailedAnalyticsResponse.data.cohort_data}
          />
        </div>
      )}

      {/* Funnel Comparison */}
      <FunnelComparison websiteId={websiteId} />

        {/* What You Can Do */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* How your funnel is set up */}

          {/* Performance Summary */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">How well it's working</CardTitle>
              <CardDescription>
                Quick health check of your funnel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{
                  backgroundColor: funnelAnalytics && funnelAnalytics.overallConversionRate > 5 ? '#22c55e' :
                                   funnelAnalytics && funnelAnalytics.overallConversionRate > 2 ? '#f59e0b' :
                                   '#ef4444'
                }}>
                  {funnelAnalytics ? Math.round(funnelAnalytics.overallConversionRate) : 0}%
                </div>
                <div className="space-y-1">
                  <p className="font-medium">
                    {funnelAnalytics && funnelAnalytics.overallConversionRate > 5 ? '✅ Working great!' :
                     funnelAnalytics && funnelAnalytics.overallConversionRate > 2 ? '⚠️ Could be better' :
                     '❌ Needs improvement'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {(funnelAnalytics?.overallConversionRate || 0).toFixed(1)}% of visitors complete your funnel
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-700">✅ Good:</span>
                  <span className="text-sm font-medium text-green-800">
                    {funnelAnalytics ? funnelAnalytics.steps.length : 0} steps (not too many)
                  </span>
                </div>
                {funnelAnalytics && funnelAnalytics.biggestDropOff.dropOffRate > 30 && (
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm text-red-700">⚠️ Problem:</span>
                    <span className="text-sm font-medium text-red-800">
                      Too many people leaving
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Things you can do */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">What you can do</CardTitle>
              <CardDescription>
                Actions to improve your funnel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => handleCreateWorkflow('optimization')}
                className="w-full justify-start text-left p-4 h-auto"
                variant="outline"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Auto-improve funnel</p>
                    <p className="text-xs text-gray-600 mt-1">Let us create a workflow to fix problems automatically</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={() => window.open(`/websites/${websiteId}/funnels/${id}/edit`, '_blank')}
                className="w-full justify-start text-left p-4 h-auto"
                variant="outline"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Edit className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Change the steps</p>
                    <p className="text-xs text-gray-600 mt-1">Add, remove, or modify what you're tracking</p>
                  </div>
                </div>
              </Button>

              <Button 
                onClick={() => window.open(`/websites/${websiteId}/analytics`, '_blank')}
                className="w-full justify-start text-left p-4 h-auto"
                variant="outline"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">See more data</p>
                    <p className="text-xs text-gray-600 mt-1">View detailed analytics and visitor behavior</p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Workflow Automation */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Workflow Automation</CardTitle>
              <CardDescription>
                Create automated workflows that respond to funnel events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => handleCreateWorkflow('dropoff')}
                className="w-full justify-start text-left p-4 h-auto"
                variant="outline"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Dropoff Recovery</p>
                    <p className="text-xs text-gray-600 mt-1">Automatically recover users who abandon your funnel</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={() => handleCreateWorkflow('conversion')}
                className="w-full justify-start text-left p-4 h-auto"
                variant="outline"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CircleCheckBig className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Conversion Celebration</p>
                    <p className="text-xs text-gray-600 mt-1">Reward and engage users who complete your funnel</p>
                  </div>
                </div>
              </Button>

              <Button 
                onClick={() => handleCreateWorkflow('milestone')}
                className="w-full justify-start text-left p-4 h-auto"
                variant="outline"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Milestone Alerts</p>
                    <p className="text-xs text-gray-600 mt-1">Notify users when they reach important steps</p>
                  </div>
                </div>
              </Button>

              <Button 
                onClick={() => handleCreateWorkflow('abandonment')}
                className="w-full justify-start text-left p-4 h-auto"
                variant="outline"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Abandonment Recovery</p>
                    <p className="text-xs text-gray-600 mt-1">Re-engage users who leave without completing</p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
