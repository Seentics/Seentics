import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Play, Pause } from 'lucide-react';

interface FunnelTriggerManagerProps {
  websiteId: string;
  userId: string;
}

interface FunnelTrigger {
  _id: string;
  workflowId: string;
  funnelId: string;
  websiteId: string;
  userId: string;
  eventType: string;
  stepIndex: number;
  conditions: {
    timeThreshold: number;
    userSegment: string;
    customMetrics: Record<string, any>;
    minValue: number;
    maxValue: number | null;
  };
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
  workflow?: {
    name: string;
    status: string;
  };
}

const FunnelTriggerManager: React.FC<FunnelTriggerManagerProps> = ({
  websiteId,
  userId
}) => {
  const [triggers, setTriggers] = useState<FunnelTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadTriggers();
  }, [websiteId]);

  const loadTriggers = async () => {
    try {
      setIsLoading(true);
      // Funnel triggers are now embedded in workflow definitions
      // No need to fetch separate trigger data
      setTriggers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load funnel triggers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTriggerStatus = async (triggerId: string, currentStatus: boolean) => {
    // Funnel triggers are now managed within workflow definitions
    toast({
      title: "Info",
      description: "Funnel triggers are now managed within workflow definitions. Please edit the workflow to modify trigger settings.",
    });
  };

  const deleteTrigger = async (triggerId: string) => {
    // Funnel triggers are now managed within workflow definitions
    toast({
      title: "Info",
      description: "Funnel triggers are now managed within workflow definitions. Please edit the workflow to remove trigger nodes.",
    });
  };

  const getEventTypeBadge = (eventType: string) => {
    const badgeVariants = {
      dropoff: "destructive",
      conversion: "default",
      milestone: "secondary",
      abandonment: "outline",
      step_completion: "secondary"
    } as const;

    return (
      <Badge variant={badgeVariants[eventType as keyof typeof badgeVariants] || "outline"}>
        {eventType.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConditionsSummary = (conditions: FunnelTrigger['conditions']) => {
    const parts = [];
    
    if (conditions.timeThreshold > 0) {
      parts.push(`${conditions.timeThreshold}m delay`);
    }
    
    if (conditions.userSegment) {
      parts.push(conditions.userSegment.replace('_', ' '));
    }
    
    if (conditions.minValue > 0 || conditions.maxValue) {
      const range = [];
      if (conditions.minValue > 0) range.push(`≥${conditions.minValue}`);
      if (conditions.maxValue) range.push(`≤${conditions.maxValue}`);
      parts.push(`Value: ${range.join(' - ')}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No conditions';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading triggers...</div>
        </CardContent>
      </Card>
    );
  }

  if (triggers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No funnel triggers found. Create your first trigger to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            🎯
          </Badge>
          Funnel Triggers ({triggers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Funnel Event</TableHead>
              <TableHead>Conditions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Executions</TableHead>
              <TableHead>Last Triggered</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {triggers.map((trigger) => (
              <TableRow key={trigger._id}>
                <TableCell>
                  <div className="font-medium">
                    {trigger.workflow?.name || 'Unknown Workflow'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trigger.workflow?.status || 'Unknown Status'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {getEventTypeBadge(trigger.eventType)}
                    {trigger.stepIndex >= 0 && (
                      <div className="text-sm text-muted-foreground">
                        Step {trigger.stepIndex}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {getConditionsSummary(trigger.conditions)}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={trigger.isActive}
                    onCheckedChange={() => toggleTriggerStatus(trigger._id, trigger.isActive)}
                    disabled={isUpdating === trigger._id}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {trigger.triggerCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  {trigger.lastTriggered ? (
                    <div className="text-sm text-muted-foreground">
                      {formatDate(trigger.lastTriggered)}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(trigger.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => toggleTriggerStatus(trigger._id, trigger.isActive)}
                        disabled={isUpdating === trigger._id}
                      >
                        {trigger.isActive ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteTrigger(trigger._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FunnelTriggerManager;
