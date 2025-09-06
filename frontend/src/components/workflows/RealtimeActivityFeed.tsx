import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Play, Target, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { getWorkflowActivity } from '@/lib/workflow-api';

interface ActivityEvent {
  id: string;
  event: string; // Make this more flexible to handle any event type from API
  nodeId: string;
  nodeTitle: string;
  detail?: string;
  timestamp: string;
  visitorId: string;
  runId?: string | null;
}

interface RealtimeActivityFeedProps {
  workflowId: string;
  initialData?: ActivityEvent[];
  onRefresh?: () => void;
}

const EVENT_ICONS = {
  'Trigger': Target,
  'Action Executed': CheckCircle,
  'Condition Met': CheckCircle,
  'Condition Failed': AlertCircle,
  'Error': AlertCircle
};

const EVENT_COLORS = {
  'Trigger': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Action Executed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Condition Met': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Condition Failed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Error': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export function RealtimeActivityFeed({ workflowId, initialData = [], onRefresh }: RealtimeActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>(initialData);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivities = async () => {
    if (!workflowId) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching activities for workflow:', workflowId);
      const response = await getWorkflowActivity(workflowId);
      console.log('Activities response:', response);
      console.log('Response type:', typeof response);
      console.log('Response length:', response?.length);
      
      if (!Array.isArray(response)) {
        console.error('Response is not an array:', response);
        setActivities([]);
        return;
      }
      
      if (response.length === 0) {
        console.log('No activities found');
        setActivities([]);
        return;
      }
      
      console.log('First item structure:', response[0]);
      console.log('First item type:', typeof response[0]);
      console.log('First item keys:', Object.keys(response[0]));
      
      // Transform the API response to match our ActivityEvent interface
      const transformedActivities: ActivityEvent[] = [];
      
      for (let i = 0; i < response.length; i++) {
        const item = response[i];
        console.log(`Processing item ${i}:`, item);
        console.log(`Item type:`, typeof item);
        console.log(`Item keys:`, Object.keys(item));
        
        try {
          // Ensure all fields are properly typed and safe
          const transformedItem: ActivityEvent = {
            id: String(item._id || item.id || `event-${Date.now()}-${Math.random()}`),
            event: String(item.event || 'Unknown'),
            nodeId: String(item.nodeId || ''),
            nodeTitle: String(item.nodeTitle || 'Unknown Node'),
            detail: item.detail ? String(item.detail) : undefined,
            timestamp: String(item.timestamp || new Date().toISOString()),
            visitorId: String(item.visitorId || 'Unknown'),
            runId: item.runId ? String(item.runId) : null
          };
          
          console.log(`Transformed item ${i}:`, transformedItem);
          transformedActivities.push(transformedItem);
        } catch (transformError) {
          console.error(`Error transforming item ${i}:`, transformError, item);
          // Skip this item if it can't be transformed
        }
      }
      
      console.log('Final transformed activities:', transformedActivities);
      setActivities(transformedActivities);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching workflow activities:', error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial data
    fetchActivities();
  }, [workflowId]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchActivities();
    }, 10000); // Fetch every 10 seconds when live

    return () => clearInterval(interval);
  }, [isLive, workflowId]);

  const handleRefresh = () => {
    fetchActivities();
    if (onRefresh) {
      onRefresh();
    }
  };

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  const getEventIcon = (event: string) => {
    const IconComponent = EVENT_ICONS[event as keyof typeof EVENT_ICONS] || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getEventColor = (event: string) => {
    return EVENT_COLORS[event as keyof typeof EVENT_COLORS] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return formatDistanceToNow(date, { addSuffix: true });
      
      return format(date, 'MMM d, h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Safety function to ensure we never render objects
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    // If it's an object, convert to JSON string
    return JSON.stringify(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <CardTitle>Real-time Activity</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLive}
              className={isLive ? 'bg-green-50 border-green-200 text-green-700' : ''}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {isLive ? 'Live' : 'Paused'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Live workflow activity feed. Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Loading activity feed...</p>
            </div>
          )}
          {activities.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity recorded yet</p>
              <p className="text-sm">Workflow activity will appear here in real-time</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              // Final safety check - ensure all fields are strings
              const safeActivity = {
                id: String(activity.id || ''),
                event: String(activity.event || 'Unknown'),
                nodeId: String(activity.nodeId || ''),
                nodeTitle: String(activity.nodeTitle || 'Unknown Node'),
                detail: activity.detail ? String(activity.detail) : undefined,
                timestamp: String(activity.timestamp || ''),
                visitorId: String(activity.visitorId || 'Unknown'),
                runId: activity.runId ? String(activity.runId) : null
              };
              
              try {
                return (
                  <div
                    key={`${safeActivity.id}-${index}`}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                      index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card hover:bg-muted/50'
                    }`}
                  >
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(activity.event)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className={getEventColor(activity.event)}>
                      {activity.event}
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground">
                      {activity.nodeTitle}
                    </span>
                  </div>
                  
                  {activity.detail && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {safeRender(activity.detail)}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <span>Visitor: {safeRender(activity.visitorId).substring(0, 8)}...</span>
                    {activity.runId && (
                      <span>Run: {safeRender(activity.runId).substring(0, 8)}...</span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
                );
              } catch (error) {
                console.error(`Error rendering activity ${index}:`, error, activity);
                return (
                  <div key={`error-${index}`} className="p-3 rounded-lg border border-red-200 bg-red-50">
                    <p className="text-sm text-red-600">Error rendering activity</p>
                  </div>
                );
              }
            })
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{activities.length} recent activities</span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {isLive ? 'Live updates enabled' : 'Live updates paused'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
