import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface FunnelTriggerBuilderProps {
  workflowId: string;
  websiteId: string;
  userId: string;
  onTriggerCreated: (trigger: any) => void;
}

interface Funnel {
  id: string;
  name: string;
  steps: any[];
}

interface FunnelTrigger {
  id?: string;
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
}

const FunnelTriggerBuilder: React.FC<FunnelTriggerBuilderProps> = ({
  workflowId,
  websiteId,
  userId,
  onTriggerCreated
}) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('');
  const [eventType, setEventType] = useState<string>('dropoff');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [conditions, setConditions] = useState({
    timeThreshold: 0,
    userSegment: '',
    customMetrics: {},
    minValue: 0,
    maxValue: null as number | null
  });
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { toast } = useToast();

  // Load available funnels
  useEffect(() => {
    loadFunnels();
  }, [websiteId]);

  const loadFunnels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics/funnels?website_id=${websiteId}`);
      if (response.ok) {
        const data = await response.json();
        setFunnels(data.funnels || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load funnels",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrigger = async () => {
    if (!selectedFunnel) {
      toast({
        title: "Validation Error",
        description: "Please select a funnel",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreating(true);
      
      const triggerData: FunnelTrigger = {
        workflowId,
        funnelId: selectedFunnel,
        websiteId,
        userId,
        eventType,
        stepIndex,
        conditions,
        isActive
      };

      // Funnel triggers are now embedded in workflow definitions
      // This component is deprecated - triggers should be created within workflows
      toast({
        title: "Info",
        description: "Funnel triggers are now created within workflow definitions. Please use the workflow editor to add funnel trigger nodes.",
        variant: "default"
      });
      
      // Reset form
      setSelectedFunnel('');
      setEventType('dropoff');
      setStepIndex(0);
      setConditions({
        timeThreshold: 0,
        userSegment: '',
        customMetrics: {},
        minValue: 0,
        maxValue: null
      });
      setIsActive(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create trigger",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getEventTypeDescription = (type: string) => {
    const descriptions = {
      dropoff: "User leaves the funnel at a specific step",
      conversion: "User completes the entire funnel",
      milestone: "User reaches a specific milestone step",
      abandonment: "User abandons the funnel after some time",
      step_completion: "User completes a specific step"
    };
    return descriptions[type as keyof typeof descriptions] || '';
  };

  const getUserSegmentOptions = () => [
    { value: '', label: 'All Users' },
    { value: 'new_users', label: 'New Users' },
    { value: 'returning_users', label: 'Returning Users' },
    { value: 'high_value', label: 'High Value Users' },
    { value: 'mobile_users', label: 'Mobile Users' },
    { value: 'desktop_users', label: 'Desktop Users' }
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            🎯
          </Badge>
          Funnel Trigger Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Funnel Selection */}
        <div className="space-y-2">
          <Label htmlFor="funnel-select">Select Funnel</Label>
          <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a funnel to monitor" />
            </SelectTrigger>
            <SelectContent>
              {funnels.map((funnel) => (
                <SelectItem key={funnel.id} value={funnel.id}>
                  {funnel.name} ({funnel.steps?.length || 0} steps)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {funnels.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">
              No funnels found. Create a funnel first to set up triggers.
            </p>
          )}
        </div>

        {/* Event Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="event-type">Trigger Event</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dropoff">Drop-off</SelectItem>
              <SelectItem value="conversion">Conversion</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
              <SelectItem value="abandonment">Abandonment</SelectItem>
              <SelectItem value="step_completion">Step Completion</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {getEventTypeDescription(eventType)}
          </p>
        </div>

        {/* Step Index (for relevant event types) */}
        {(eventType === 'dropoff' || eventType === 'milestone' || eventType === 'step_completion') && (
          <div className="space-y-2">
            <Label htmlFor="step-index">Step Index</Label>
            <Input
              id="step-index"
              type="number"
              min="0"
              value={stepIndex}
              onChange={(e) => setStepIndex(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-sm text-muted-foreground">
              Which step should trigger this workflow? (0 = first step)
            </p>
          </div>
        )}

        <Separator />

        {/* Advanced Conditions */}
        <div className="space-y-4">
          <h4 className="font-medium">Advanced Conditions</h4>
          
          {/* Time Threshold */}
          <div className="space-y-2">
            <Label htmlFor="time-threshold">Time Threshold (minutes)</Label>
            <Input
              id="time-threshold"
              type="number"
              min="0"
              value={conditions.timeThreshold}
              onChange={(e) => setConditions(prev => ({
                ...prev,
                timeThreshold: parseInt(e.target.value) || 0
              }))}
              placeholder="0"
            />
            <p className="text-sm text-muted-foreground">
              Wait this many minutes before triggering (0 = immediate)
            </p>
          </div>

          {/* User Segment */}
          <div className="space-y-2">
            <Label htmlFor="user-segment">User Segment</Label>
            <Select 
              value={conditions.userSegment} 
              onValueChange={(value) => setConditions(prev => ({ ...prev, userSegment: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                {getUserSegmentOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-value">Minimum Value</Label>
              <Input
                id="min-value"
                type="number"
                min="0"
                value={conditions.minValue}
                onChange={(e) => setConditions(prev => ({
                  ...prev,
                  minValue: parseFloat(e.target.value) || 0
                }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-value">Maximum Value</Label>
              <Input
                id="max-value"
                type="number"
                min="0"
                value={conditions.maxValue || ''}
                onChange={(e) => setConditions(prev => ({
                  ...prev,
                  maxValue: e.target.value ? parseFloat(e.target.value) : null
                }))}
                placeholder="No limit"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Switch
            id="active-status"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="active-status">Active</Label>
        </div>

        {/* Create Button */}
        <Button 
          onClick={handleCreateTrigger}
          disabled={!selectedFunnel || isCreating || isLoading}
          className="w-full"
        >
          {isCreating ? 'Creating...' : 'Create Funnel Trigger'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FunnelTriggerBuilder;
