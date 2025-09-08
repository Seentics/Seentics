
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { X, Code, PlusCircle, Trash2, Info, AlertCircle, CheckCircle } from 'lucide-react';
import type { Node } from 'reactflow';
import type { CustomNodeData, NodeSettings } from './custom-node';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getFunnels } from '@/lib/analytics-api';

interface SettingsPanelProps {
  node: Node<CustomNodeData>;
  onClose: () => void;
  onSettingsChange: (nodeId: string, settings: NodeSettings) => void;
}

const LocalStorageForm: React.FC<{
    settings: NodeSettings;
    onSettingsChange: (newSettings: NodeSettings) => void;
}> = ({ settings, onSettingsChange }) => {
    const localStorageData = settings.localStorageData || [];

    const handleLocalStorageKeyChange = (index: number, value: string) => {
        const newData = [...localStorageData];
        newData[index] = { ...newData[index], localStorageKey: value, payloadKey: value };
        onSettingsChange({ ...settings, localStorageData: newData });
    };

    const addLocalStorageDataItem = () => {
        onSettingsChange({ ...settings, localStorageData: [...localStorageData, { localStorageKey: '', payloadKey: '' }] });
    };

    const removeLocalStorageDataItem = (index: number) => {
        const newData = localStorageData.filter((_, i) => i !== index);
        onSettingsChange({ ...settings, localStorageData: newData });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <Label className="text-sm font-medium">Include Data from localStorage</Label>
            </div>
            <p className="text-xs text-muted-foreground">
                Add keys from your site's localStorage to use in placeholders. For example, if you add the key "cartId", you can use <code className="bg-muted px-1 rounded">&#123;&#123;cartId&#125;&#125;</code> in your text.
            </p>
            <div className="space-y-3">
                {localStorageData.map((item, index) => (
                    <motion.div 
                        key={index} 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <Input 
                            placeholder="localStorage Key (e.g. cartId)" 
                            value={item.localStorageKey} 
                            onChange={(e) => handleLocalStorageKeyChange(index, e.target.value)} 
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="shrink-0 text-destructive hover:text-destructive" 
                            onClick={() => removeLocalStorageDataItem(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </motion.div>
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={addLocalStorageDataItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Key
            </Button>
        </div>
    );
};

const NodeSettingsForm: React.FC<{
  node: Node<CustomNodeData>;
  settings: NodeSettings;
  onSettingsChange: (newSettings: NodeSettings) => void;
}> = ({ node, settings, onSettingsChange }) => {
  const [funnels, setFunnels] = useState<any[]>([]);
  const [isLoadingFunnels, setIsLoadingFunnels] = useState(false);

  // Fetch funnels when component mounts
  useEffect(() => {
    const fetchFunnels = async () => {
      try {
        setIsLoadingFunnels(true);
        // Get websiteId from the current URL or context
        const pathParts = window.location.pathname.split('/');
        const websiteIdIndex = pathParts.findIndex(part => part === 'websites') + 1;
        const websiteId = pathParts[websiteIdIndex];
        
        if (websiteId && websiteId !== '[websiteId]') {
          const funnelsData = await getFunnels(websiteId);
          setFunnels(funnelsData);
        }
      } catch (error) {
        console.error('Error fetching funnels:', error);
        // Set empty array to show error state
        setFunnels([]);
      } finally {
        setIsLoadingFunnels(false);
      }
    };

    fetchFunnels();
  }, []);

  const handleSettingChange = (key: keyof NodeSettings, value: any) => {
    // Ensure displayMode is always set for modal/banner actions
    let newSettings = { ...settings, [key]: value };
    
    // If this is a modal or banner action and displayMode is not set, default to 'simple'
    if ((node.data.title === 'Show Modal' || node.data.title === 'Show Banner') && 
        !newSettings.displayMode && key !== 'displayMode') {
      newSettings.displayMode = 'simple';
    }
    
    onSettingsChange(newSettings);
  };

  // Reusable Frequency Control Component for ALL Action Nodes
  const FrequencyControlSection = () => {
    // Only show frequency control for action nodes (not trigger/condition nodes)
    const isActionNode = ['Show Modal', 'Show Banner', 'Insert Section', 'Redirect URL', 
                         'Send Email', 'Add/Remove Tag', 'Webhook', 'Track Event', 'Wait'].includes(node.data.title || '');
    
    if (!isActionNode) return null;
    
    return (
      <>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Action Frequency</Label>
          <Select
            value={settings.displayFrequency || 'once_per_session'}
            onValueChange={(value) => handleSettingChange('displayFrequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="every_trigger">Every Trigger</SelectItem>
              <SelectItem value="once_per_session">Once Per Session</SelectItem>
              <SelectItem value="once_ever">Once Ever (Permanent)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {settings.displayFrequency === 'every_trigger' && 'Executes every time the workflow triggers'}
            {(settings.displayFrequency === 'once_per_session' || !settings.displayFrequency) && 'Executes once per browser session (recommended)'}
            {settings.displayFrequency === 'once_ever' && 'Executes once per user permanently'}
          </p>
        </div>
        <Separator />
      </>
    );
  };
  
  const displayMode = settings.displayMode || 'simple';

  // Ensure displayMode is always set for modal/banner actions
  useEffect(() => {
    if ((node.data.title === 'Show Modal' || node.data.title === 'Show Banner') && 
        !settings.displayMode) {
      onSettingsChange({ ...settings, displayMode: 'simple' });
    }
  }, [node.data.title, settings.displayMode]); // Remove onSettingsChange and settings from dependencies

          // Set default values for Funnel
        useEffect(() => {
          if (node.data.title === 'Funnel') {
            const defaults = {
              eventType: 'dropoff' as const,
              stepIndex: 0,
              timeThreshold: 0,
              minValue: 0,
              maxValue: null
            };
            
            const hasDefaults = Object.keys(defaults).every(key => 
              settings[key as keyof NodeSettings] !== undefined
            );
            
            if (!hasDefaults) {
              // Only update if we don't already have these values
              const newSettings = { ...settings, ...defaults };
              onSettingsChange(newSettings);
            }
          }
        }, [node.data.title]); // Remove settings and onSettingsChange from dependencies

  const renderFormFields = () => {
    switch (node.data.title) {
      
      // Triggers
      case 'Page View':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium">Page URL (optional)</Label>
              <Input
                id="url"
                placeholder="e.g., /pricing (leave blank for any page)"
                value={settings.url || ''}
                onChange={(e) => handleSettingChange('url', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Specify a specific page path to trigger on, or leave blank to trigger on any page.
              </p>
            </div>
          </div>
        );
      case 'Time Spent':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seconds" className="text-sm font-medium">Seconds on Page</Label>
              <Input
                id="seconds"
                type="number"
                placeholder="e.g., 30"
                value={settings.seconds || ''}
                onChange={(e) => handleSettingChange('seconds', parseInt(e.target.value, 10))}
              />
              <p className="text-xs text-muted-foreground">
                The number of seconds a visitor must spend on the page before the trigger fires.
              </p>
            </div>
          </div>
        );
      case 'Element Click':
         return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selector" className="text-sm font-medium">CSS Selector</Label>
              <Input
                id="selector"
                placeholder="e.g., #cta-button or .signup"
                value={settings.selector || ''}
                onChange={(e) => handleSettingChange('selector', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The CSS selector for the element that should trigger this workflow when clicked.
              </p>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const selector = settings.selector?.trim();
                    if (!selector) return;
                    try {
                      const path = window.location.pathname;
                      const match = path.match(/\/workflows\/edit\/(.+)$/);
                      const workflowId = match && match[1] !== 'new' ? match[1] : null;
                      if (!workflowId) {
                        alert('Save the workflow first to test in Preview.');
                        return;
                      }
                      const url = `/preview/${workflowId}?highlightSelector=${encodeURIComponent(selector)}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    } catch {}
                  }}
                >
                  Test in Preview
                </Button>
              </div>
            </div>
          </div>
        );
      case 'Scroll Depth':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scrollDepth" className="text-sm font-medium">Scroll Percentage</Label>
              <Input
                id="scrollDepth"
                type="number"
                placeholder="e.g., 50"
                value={settings.scrollDepth || ''}
                onChange={(e) => handleSettingChange('scrollDepth', parseInt(e.target.value, 10))}
              />
              <p className="text-xs text-muted-foreground">
                The percentage of the page the visitor must scroll to before the trigger fires (0-100).
              </p>
            </div>
          </div>
        );
      case 'Custom Event':
         return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customEventName" className="text-sm font-medium">Event Name</Label>
              <Input
                id="customEventName"
                placeholder="e.g., newsletter-signup"
                value={settings.customEventName || ''}
                onChange={(e) => handleSettingChange('customEventName', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The name of the event to listen for from <code className="bg-muted px-1 rounded">seentics.track()</code>.
              </p>
            </div>
          </div>
        );
      case 'Inactivity':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inactivitySeconds" className="text-sm font-medium">Seconds of Inactivity</Label>
              <Input
                id="inactivitySeconds"
                type="number"
                placeholder="e.g., 30"
                value={settings.inactivitySeconds || ''}
                onChange={(e) => handleSettingChange('inactivitySeconds', parseInt(e.target.value, 10))}
              />
              <p className="text-xs text-muted-foreground">Trigger after no mouse/keyboard/scroll activity for N seconds.</p>
            </div>
          </div>
        );
      case 'Funnel':
        return (
          <div className="space-y-4">
            {isLoadingFunnels && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading available funnels...</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="funnelId" className="text-sm font-medium">Funnel</Label>
              <Select
                value={settings.funnelId && funnels.some(f => f.id === settings.funnelId) ? settings.funnelId : undefined}
                onValueChange={(value) => {
                  // Only allow valid funnel IDs
                  if (value && value !== 'loading' && value !== 'no-funnels') {
                    handleSettingChange('funnelId', value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingFunnels ? "Loading funnels..." : 
                    funnels.length === 0 ? "No funnels available" : 
                    "Select a funnel"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingFunnels ? (
                    <SelectItem value="loading" disabled>Loading funnels...</SelectItem>
                  ) : funnels.length === 0 ? (
                    <SelectItem value="no-funnels" disabled>No funnels available</SelectItem>
                  ) : (
                    funnels.map((funnel) => (
                      <SelectItem key={funnel.id} value={funnel.id}>
                        {funnel.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {isLoadingFunnels 
                  ? "Loading available funnels..." 
                  : funnels.length === 0 
                    ? "No funnels found. Create a funnel first in the Funnels section."
                    : "Select which funnel this trigger should monitor. This trigger will ONLY fire when the specified funnel event occurs."
                }
              </p>
              
              {funnels.length === 0 && !isLoadingFunnels && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">No Funnels Available</p>
                  <p>You need to create a funnel first before you can use a funnel trigger. Go to the Funnels section to create one.</p>
                  <button 
                    onClick={() => {
                      const pathParts = window.location.pathname.split('/');
                      const websiteIdIndex = pathParts.findIndex(part => part === 'websites') + 1;
                      const websiteId = pathParts[websiteIdIndex];
                      if (websiteId && websiteId !== '[websiteId]') {
                        window.open(`/websites/${websiteId}/funnels`, '_blank');
                      }
                    }}
                    className="mt-2 text-amber-700 dark:text-amber-300 underline hover:no-underline"
                  >
                    Open Funnels Section
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventType" className="text-sm font-medium">Event Type</Label>
              <Select
                value={settings.eventType}
                onValueChange={(value) => handleSettingChange('eventType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dropoff">Dropoff</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="abandonment">Abandonment</SelectItem>
                  <SelectItem value="step_completion">Step Completion</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose what type of funnel event should trigger this workflow.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stepIndex" className="text-sm font-medium">Step Index (optional)</Label>
              <Input
                id="stepIndex"
                type="number"
                placeholder="e.g., 2"
                value={settings.stepIndex || ''}
                onChange={(e) => handleSettingChange('stepIndex', parseInt(e.target.value, 10))}
              />
              <p className="text-xs text-muted-foreground">
                Specific step to monitor (leave blank for any step). Step 1 is the first step.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeThreshold" className="text-sm font-medium">Time Threshold (minutes)</Label>
              <Input
                id="timeThreshold"
                type="number"
                placeholder="e.g., 5"
                value={settings.timeThreshold || ''}
                onChange={(e) => handleSettingChange('timeThreshold', parseInt(e.target.value, 10))}
              />
              <p className="text-xs text-muted-foreground">
                Minimum time spent before triggering (0 = no time requirement).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userSegment" className="text-sm font-medium">User Segment (optional)</Label>
              <Input
                id="userSegment"
                placeholder="e.g., premium-users, new-visitors"
                value={settings.userSegment || ''}
                onChange={(e) => handleSettingChange('userSegment', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Target specific user segments (comma-separated for multiple).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minValue" className="text-sm font-medium">Min Value</Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="0"
                  value={settings.minValue || ''}
                  onChange={(e) => handleSettingChange('minValue', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxValue" className="text-sm font-medium">Max Value</Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="No limit"
                  value={settings.maxValue || ''}
                  onChange={(e) => handleSettingChange('maxValue', e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Set value range constraints for the funnel event (e.g., cart value, time spent).
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Funnel-Only Trigger Active</p>
                  <p>This workflow will ONLY trigger when the specified funnel event occurs. It will not respond to other page interactions or events.</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-300">
                    <strong>Event:</strong> {settings.eventType} | 
                    <strong>Funnel:</strong> {funnels.find(f => f.id === settings.funnelId)?.name || 'Unknown'} | 
                    <strong>Step:</strong> {settings.stepIndex || 'Any'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        

      // Conditions
      case 'Device Type':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Device Type</Label>
              <Select
                value={settings.deviceType}
                onValueChange={(value) => handleSettingChange('deviceType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Desktop">🖥️ Desktop</SelectItem>
                  <SelectItem value="Mobile">📱 Mobile</SelectItem>
                  <SelectItem value="Tablet">📱 Tablet</SelectItem>
                  <SelectItem value="Any">🌐 Any Device</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only execute this workflow for visitors on the selected device type. Uses user agent detection.
              </p>
            </div>
            
            {/* Advanced Device Options */}
            {settings.deviceType && settings.deviceType !== 'Any' && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <Label className="text-sm font-medium">Advanced Options</Label>
                
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Screen Size Constraints (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Min Width (px)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 768"
                        value={settings.minScreenWidth || ''}
                        onChange={(e) => handleSettingChange('minScreenWidth', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Width (px)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 1200"
                        value={settings.maxScreenWidth || ''}
                        onChange={(e) => handleSettingChange('maxScreenWidth', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Optional: Add screen size constraints for more precise targeting.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Touch Support</Label>
                  <Select
                    value={settings.touchSupport || 'any'}
                    onValueChange={(value) => handleSettingChange('touchSupport', value === 'any' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any (Default)</SelectItem>
                      <SelectItem value="touch">Touch Enabled</SelectItem>
                      <SelectItem value="no-touch">No Touch</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Filter by touch capability detection.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
       case 'Browser':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Browser</Label>
              <Select
                value={settings.browser}
                onValueChange={(value) => handleSettingChange('browser', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select browser" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chrome">Chrome</SelectItem>
                  <SelectItem value="firefox">Firefox</SelectItem>
                  <SelectItem value="safari">Safari</SelectItem>
                  <SelectItem value="edge">Edge</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only execute this workflow for visitors using the selected browser.
              </p>
            </div>
          </div>
        );
      case 'URL Path':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Match Type</Label>
              <Select
                value={settings.urlMatchType}
                onValueChange={(value) => handleSettingChange('urlMatchType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Exact Match</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="startsWith">Starts With</SelectItem>
                  <SelectItem value="endsWith">Ends With</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium">Path Value</Label>
              <Input
                id="url"
                placeholder="/pricing"
                value={settings.url || ''}
                onChange={(e) => handleSettingChange('url', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The URL path to match against the current page.
              </p>
            </div>
          </div>
        );
      case 'Traffic Source':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Match Type</Label>
              <Select
                value={settings.referrerMatchType}
                onValueChange={(value) => handleSettingChange('referrerMatchType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Exact Match</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="startsWith">Starts With</SelectItem>
                  <SelectItem value="endsWith">Ends With</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referrerUrl" className="text-sm font-medium">Referrer URL</Label>
              <Input
                id="referrerUrl"
                placeholder="google.com"
                value={settings.referrerUrl || ''}
                onChange={(e) => handleSettingChange('referrerUrl', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a domain or URL. Leave blank for direct traffic.
              </p>
            </div>
          </div>
        );
      case 'New vs Returning':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Visitor Type</Label>
              <Select
                value={settings.visitorType}
                onValueChange={(value) => handleSettingChange('visitorType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visitor type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Visitor</SelectItem>
                  <SelectItem value="returning">Returning Visitor</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only execute this workflow for the selected visitor type.
              </p>
            </div>
          </div>
        );
       case 'Tag':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagName" className="text-sm font-medium">Tag Name</Label>
              <Input
                id="tagName"
                placeholder="e.g., hot-lead"
                value={settings.tagName || ''}
                onChange={(e) => handleSettingChange('tagName', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Checks if the visitor has this tag.
              </p>
            </div>
          </div>
        );
      case 'Frequency Cap':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cooldown" className="text-sm font-medium">Cooldown (seconds)</Label>
              <Input
                id="cooldown"
                type="number"
                placeholder="e.g., 3600"
                value={settings.cooldownSeconds || ''}
                onChange={(e) => handleSettingChange('cooldownSeconds', parseInt(e.target.value, 10))}
              />
              <p className="text-xs text-muted-foreground">
                Minimum time before the same visitor can trigger this workflow again.
              </p>
            </div>
          </div>
        );
      case 'A/B Split':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="variantA" className="text-sm font-medium">Variant A Percentage</Label>
              <Input
                id="variantA"
                type="number"
                placeholder="e.g., 50"
                value={settings.variantAPercent ?? 50}
                onChange={(e) => handleSettingChange('variantAPercent', Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)))}
              />
              <p className="text-xs text-muted-foreground">
                The remaining percentage goes to Variant B.
              </p>
            </div>
          </div>
        );
      case 'Branch Split':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Variants</Label>
              <Select value={(settings.variantsCount || 2).toString()} onValueChange={(v) => handleSettingChange('variantsCount', parseInt(v, 10))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select variants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">A/B</SelectItem>
                  <SelectItem value="3">A/B/C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">A %</Label>
                <Input type="number" value={settings.variantAPercent ?? 50} onChange={(e) => handleSettingChange('variantAPercent', Math.max(0, Math.min(100, parseInt(e.target.value,10)||0)))} />
                <Input placeholder="Label A" value={settings.variantALabel || 'A'} onChange={(e) => handleSettingChange('variantALabel', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">B %</Label>
                <Input type="number" value={settings.variantBPercent ?? 50} onChange={(e) => handleSettingChange('variantBPercent', Math.max(0, Math.min(100, parseInt(e.target.value,10)||0)))} />
                <Input placeholder="Label B" value={settings.variantBLabel || 'B'} onChange={(e) => handleSettingChange('variantBLabel', e.target.value)} />
              </div>
              { (settings.variantsCount || 2) === 3 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">C %</Label>
                  <Input type="number" value={settings.variantCPercent ?? 0} onChange={(e) => handleSettingChange('variantCPercent', Math.max(0, Math.min(100, parseInt(e.target.value,10)||0)))} />
                  <Input placeholder="Label C" value={settings.variantCLabel || 'C'} onChange={(e) => handleSettingChange('variantCLabel', e.target.value)} />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Ratios are normalized automatically.</p>
          </div>
        );
      case 'Join':
        return (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Join will wait until all inbound branches reach this node in the same run.</p>
            <div className="space-y-2">
              <Label htmlFor="joinTimeout" className="text-sm font-medium">Timeout (seconds, optional)</Label>
              <Input id="joinTimeout" type="number" placeholder="e.g., 10" value={settings.joinTimeoutSeconds || ''} onChange={(e) => handleSettingChange('joinTimeoutSeconds', parseInt(e.target.value, 10))} />
              <p className="text-xs text-muted-foreground">If set, Join will proceed when either all branches arrive or the timeout elapses.</p>
            </div>
          </div>
        );
      case 'Time Window':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hours (0-23)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Start" value={settings.startHour ?? ''} onChange={(e) => handleSettingChange('startHour', parseInt(e.target.value, 10))} />
                <Input type="number" placeholder="End" value={settings.endHour ?? ''} onChange={(e) => handleSettingChange('endHour', parseInt(e.target.value, 10))} />
              </div>
              <p className="text-xs text-muted-foreground">Local time range; if end is less than start, the range wraps midnight.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Days of Week</Label>
              <Input placeholder="e.g., 1,2,3 (Mon-Wed)" value={(settings.daysOfWeek || []).join(',')} onChange={(e) => {
                const val = e.target.value.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));
                handleSettingChange('daysOfWeek', val);
              }} />
              <p className="text-xs text-muted-foreground">0-6 = Sun-Sat. Leave empty for all days.</p>
            </div>
          </div>
        );
      case 'Query Param':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Param Name</Label>
              <Input value={settings.queryParam || ''} onChange={(e) => handleSettingChange('queryParam', e.target.value)} placeholder="utm_source" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Match Type</Label>
              <Select value={settings.queryMatchType} onValueChange={(v) => handleSettingChange('queryMatchType', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exists">Exists</SelectItem>
                  <SelectItem value="exact">Exact</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="startsWith">Starts With</SelectItem>
                  <SelectItem value="endsWith">Ends With</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {settings.queryMatchType !== 'exists' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Value</Label>
                <Input value={settings.queryValue || ''} onChange={(e) => handleSettingChange('queryValue', e.target.value)} placeholder="google" />
              </div>
            )}
          </div>
        );
      

      // Actions
      case 'Show Modal':
      case 'Show Banner':
          const isModal = node.data.title === 'Show Modal';
          return (
          <div className="space-y-6">
             <FrequencyControlSection />
             <div className="space-y-2">
              <Label className="text-sm font-medium">Mode</Label>
              <RadioGroup
                value={displayMode}
                onValueChange={(value) => handleSettingChange('displayMode', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="simple" />
                  <Label htmlFor="simple" className="text-sm">Simple</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="text-sm">Custom HTML</Label>
                </div>
              </RadioGroup>
              {!settings.displayMode && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Mode automatically set to "Simple" for better compatibility
                </p>
              )}
            </div>
            <Separator />
            {displayMode === 'simple' ? (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                    {isModal && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="modalTitle" className="text-sm font-medium">Modal Title</Label>
                                <Input id="modalTitle" placeholder="Enter modal title" value={settings.modalTitle || ''} onChange={(e) => handleSettingChange('modalTitle', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="modalContent" className="text-sm font-medium">Modal Content</Label>
                                <Textarea id="modalContent" placeholder="Enter modal content" value={settings.modalContent || ''} onChange={(e) => handleSettingChange('modalContent', e.target.value)} />
                            </div>
                        </>
                    )}
                    {!isModal && (
                        <>
                             <div className="space-y-2">
                                <Label className="text-sm font-medium">Position</Label>
                                <RadioGroup value={settings.bannerPosition || 'top'} onValueChange={(value) => handleSettingChange('bannerPosition', value)} className="flex space-x-4" >
                                    <div className="flex items-center space-x-2"> <RadioGroupItem value="top" id="top" /> <Label htmlFor="top" className="text-sm">Top</Label> </div>
                                    <div className="flex items-center space-x-2"> <RadioGroupItem value="bottom" id="bottom" /> <Label htmlFor="bottom" className="text-sm">Bottom</Label> </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bannerContent" className="text-sm font-medium">Banner Content</Label>
                                <Textarea id="bannerContent" placeholder="Get 10% off your next purchase!" value={settings.bannerContent || ''} onChange={(e) => handleSettingChange('bannerContent', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bannerCtaText" className="text-sm font-medium">Button Text (Optional)</Label>
                                <Input id="bannerCtaText" placeholder="e.g. Shop Now" value={settings.bannerCtaText || ''} onChange={(e) => handleSettingChange('bannerCtaText', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bannerCtaUrl" className="text-sm font-medium">Button URL (Optional)</Label>
                                <Input id="bannerCtaUrl" placeholder="https://example.com/shop" value={settings.bannerCtaUrl || ''} onChange={(e) => handleSettingChange('bannerCtaUrl', e.target.value)} />
                            </div>
                        </>
                    )}
                </motion.div>
            ) : (
                 <motion.div 
                   className="space-y-4"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.2 }}
                 >
                    <Alert>
                      <Code className="h-4 w-4" />
                      <AlertDescription>
                        You are in custom code mode. Use HTML, CSS, and JavaScript to create your own custom content.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                        <Label htmlFor="customHtml" className="text-sm font-medium">HTML</Label>
                        <Textarea id="customHtml" placeholder="<div>Your HTML here</div>" value={settings.customHtml || ''} onChange={(e) => handleSettingChange('customHtml', e.target.value)} rows={6} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customCss" className="text-sm font-medium">CSS (Optional)</Label>
                        <Textarea id="customCss" placeholder="div { color: red; }" value={settings.customCss || ''} onChange={(e) => handleSettingChange('customCss', e.target.value)} rows={4} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customJs" className="text-sm font-medium">JavaScript (Optional)</Label>
                        <Textarea id="customJs" placeholder="console.log('Modal shown');" value={settings.customJs || ''} onChange={(e) => handleSettingChange('customJs', e.target.value)} rows={4} />
                         <p className="text-xs text-muted-foreground">The element containing your HTML will be available as <code className="bg-muted px-1 rounded">this.element</code>.</p>
                    </div>
                </motion.div>
            )}
          </div>
        );
      case 'Insert Section':
        return (
          <div className="space-y-4">
            <FrequencyControlSection />
            <div className="space-y-2">
              <Label htmlFor="selector" className="text-sm font-medium">Target CSS Selector</Label>
              <Input
                id="selector"
                placeholder="e.g., #hero-section"
                value={settings.selector || ''}
                onChange={(e) => handleSettingChange('selector', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">The element to insert the section near.</p>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const selector = settings.selector?.trim();
                    if (!selector) return;
                    try {
                      const path = window.location.pathname;
                      const match = path.match(/\/workflows\/edit\/(.+)$/);
                      const workflowId = match && match[1] !== 'new' ? match[1] : null;
                      if (!workflowId) {
                        alert('Save the workflow first to test in Preview.');
                        return;
                      }
                      const url = `/preview/${workflowId}?highlightSelector=${encodeURIComponent(selector)}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    } catch {}
                  }}
                >
                  Test in Preview
                </Button>
              </div>
            </div>
             <div className="space-y-2">
              <Label className="text-sm font-medium">Position</Label>
              <Select
                value={settings.insertPosition}
                onValueChange={(value) => handleSettingChange('insertPosition', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select where to insert" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before the target</SelectItem>
                  <SelectItem value="after">After the target</SelectItem>
                  <SelectItem value="prepend">Inside, at the start of the target</SelectItem>
                  <SelectItem value="append">Inside, at the end of the target</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customHtml" className="text-sm font-medium">Custom HTML</Label>
              <Textarea
                id="customHtml"
                placeholder="<div style='background:blue; color:white;'>...</div>"
                value={settings.customHtml || ''}
                onChange={(e) => handleSettingChange('customHtml', e.target.value)}
                rows={8}
              />
            </div>
          </div>
        );
      case 'Redirect URL':
        return (
          <div className="space-y-4">
            <FrequencyControlSection />
            <div className="space-y-2">
              <Label htmlFor="redirectUrl" className="text-sm font-medium">Redirect URL</Label>
              <Input
                id="redirectUrl"
                placeholder="https://example.com/new-page"
                value={settings.redirectUrl || ''}
                onChange={(e) => handleSettingChange('redirectUrl', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The URL to redirect the visitor to when this action is triggered.
              </p>
            </div>
          </div>
        );
      case 'Send Email':
        return (
          <div className="space-y-4">
            <FrequencyControlSection />
            <Tabs defaultValue={settings.emailSendType || 'visitor'} onValueChange={(value) => handleSettingChange('emailSendType', value)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visitor">To Visitor</TabsTrigger>
                <TabsTrigger value="custom">To Custom Address</TabsTrigger>
            </TabsList>
            <TabsContent value="visitor" className="space-y-4 pt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Sends an email to the identified visitor. Use <code className="bg-muted px-1 rounded">seentics.identify()</code> on your site to provide their email address.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                    <Label htmlFor="emailSubject" className="text-sm font-medium">Subject</Label>
                    <Input id="emailSubject" value={settings.emailSubject || ''} placeholder="e.g. Regarding your cart..." onChange={(e) => handleSettingChange('emailSubject', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emailBody" className="text-sm font-medium">Body</Label>
                    <Textarea id="emailBody" value={settings.emailBody || ''} placeholder="Use placeholders like {{cartId}}." onChange={(e) => handleSettingChange('emailBody', e.target.value)} />
                </div>
                 <Separator className="my-4" />
                <LocalStorageForm settings={settings} onSettingsChange={onSettingsChange} />
            </TabsContent>
            <TabsContent value="custom" className="space-y-4 pt-4">
                 <Alert>
                   <Info className="h-4 w-4" />
                   <AlertDescription>
                     Sends an email to an address you define (e.g., your team for notifications).
                   </AlertDescription>
                 </Alert>
                <div className="space-y-2">
                    <Label htmlFor="emailTo" className="text-sm font-medium">Recipient Email</Label>
                    <Input id="emailTo" value={settings.emailTo || ''} onChange={(e) => handleSettingChange('emailTo', e.target.value)} placeholder="e.g. team@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emailSubjectCustom" className="text-sm font-medium">Subject</Label>
                    <Input id="emailSubjectCustom" value={settings.emailSubject || ''} placeholder="e.g. New Hot Lead: {{identifiedUser.attributes.email}}" onChange={(e) => handleSettingChange('emailSubject', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emailBodyCustom" className="text-sm font-medium">Body</Label>
                    <Textarea id="emailBodyCustom" value={settings.emailBody || ''} placeholder="Visitor with email {{identifiedUser.attributes.email}} triggered this." onChange={(e) => handleSettingChange('emailBody', e.target.value)} />
                </div>
                 <Separator className="my-4" />
                <LocalStorageForm settings={settings} onSettingsChange={onSettingsChange} />
             </TabsContent>
            </Tabs>
          </div>
         );
      case 'Add/Remove Tag':
        return (
          <div className="space-y-4">
            <FrequencyControlSection />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Action</Label>
              <RadioGroup
                value={settings.tagAction || 'add'}
                onValueChange={(value) => handleSettingChange('tagAction', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add-tag" />
                  <Label htmlFor="add-tag" className="text-sm">Add</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="remove" id="remove-tag" />
                  <Label htmlFor="remove-tag" className="text-sm">Remove</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagName" className="text-sm font-medium">Tag Name</Label>
              <Input
                id="tagName"
                placeholder="e.g., engaged-user"
                value={settings.tagName || ''}
                onChange={(e) => handleSettingChange('tagName', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The tag to add or remove from the visitor.
              </p>
            </div>
          </div>
        );
      case 'Webhook':
        return (
            <div className="space-y-4">
                <FrequencyControlSection />
                <div className="space-y-2">
                    <Label htmlFor="webhookUrl" className="text-sm font-medium">Webhook URL</Label>
                    <Input 
                        id="webhookUrl" 
                        placeholder="https://api.example.com/hook" 
                        value={settings.webhookUrl || ''} 
                        onChange={(e) => handleSettingChange('webhookUrl', e.target.value)} 
                    />
                    <p className="text-xs text-muted-foreground">The URL where we'll send the webhook request.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="webhookMethod" className="text-sm font-medium">HTTP Method</Label>
                    <Select 
                        value={settings.webhookMethod || 'POST'} 
                        onValueChange={(value) => handleSettingChange('webhookMethod', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">HTTP method for the webhook request.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="webhookHeaders" className="text-sm font-medium">Custom Headers</Label>
                    <Textarea 
                        id="webhookHeaders" 
                        placeholder='{"Authorization": "Bearer token", "X-Custom-Header": "value"}' 
                        value={settings.webhookHeaders ? JSON.stringify(settings.webhookHeaders, null, 2) : ''} 
                        onChange={(e) => {
                            try {
                                const headers = e.target.value ? JSON.parse(e.target.value) : {};
                                handleSettingChange('webhookHeaders', headers);
                            } catch (error) {
                                // Keep the raw value for editing
                                handleSettingChange('webhookHeaders', e.target.value);
                            }
                        }}
                        className="font-mono text-sm"
                        rows={3}
                    />
                    <p className="text-xs text-muted-foreground">JSON object with custom headers (optional).</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="webhookBody" className="text-sm font-medium">Custom Payload</Label>
                    <Textarea 
                        id="webhookBody" 
                        placeholder='{"customField": "value", "userEmail": "{{user.email}}", "timestamp": "{{timestamp}}"}' 
                        value={settings.webhookBody || ''} 
                        onChange={(e) => handleSettingChange('webhookBody', e.target.value)}
                        className="font-mono text-sm"
                        rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                        Custom JSON payload. Use variables like {'{{user.email}}'}, {'{{visitorId}}'}, {'{{timestamp}}'} for dynamic data.
                    </p>
                </div>

                <Separator className="my-4" />
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Default Data</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                        These fields are automatically included in every webhook:
                    </p>
                    <div className="bg-muted/50 p-3 rounded-md text-xs font-mono">
                        <div>• visitorId: Unique visitor identifier</div>
                        <div>• identifiedUser: User data if identified</div>
                        <div>• localStorageData: Mapped localStorage data</div>
                        <div>• timestamp: ISO timestamp</div>
                    </div>
                </div>

                <Separator className="my-4" />
                <LocalStorageForm settings={settings} onSettingsChange={onSettingsChange} />
            </div>
        );
      case 'Track Event':
        return (
            <div className="space-y-4">
                <FrequencyControlSection />
                <div className="space-y-2">
                    <Label htmlFor="eventName" className="text-sm font-medium">Event Name</Label>
                    <Input
                        id="eventName"
                        placeholder="e.g., newsletter-signup"
                        value={settings.eventName || ''}
                        onChange={(e) => handleSettingChange('eventName', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">This name will appear in your analytics dashboard.</p>
                </div>
            </div>
        );
      case 'Wait':
        return (
          <div className="space-y-4">
            <FrequencyControlSection />
            <div className="space-y-2">
              <Label htmlFor="waitSeconds" className="text-sm font-medium">Wait (seconds)</Label>
              <Input id="waitSeconds" type="number" placeholder="e.g., 5" value={settings.waitSeconds || ''} onChange={(e) => handleSettingChange('waitSeconds', parseInt(e.target.value, 10))} />
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No configuration available for this node.
            </p>
          </div>
        );
    }
  };

  return <div className="space-y-4">{renderFormFields()}</div>;
};

export function SettingsPanel({
  node,
  onClose,
  onSettingsChange,
}: SettingsPanelProps) {
  if (!node) return null;
  const { data, id } = node;

  const handleSettingsUpdate = (newSettings: NodeSettings) => {
    onSettingsChange(id, newSettings);
  };
  
  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20 shadow-sm border overflow-hidden">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          {/* <div 
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: data.color + '20' }}
          >
            <div className="h-4 w-4" style={{ color: data.color }} />
          </div> */}
          <div>
            <CardTitle className="text-lg">{data.title}</CardTitle>
            <CardDescription className="text-sm">Configure this node's settings</CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 flex-grow overflow-y-auto px-4">
        <NodeSettingsForm
          node={node}
          settings={data.settings || {}}
          onSettingsChange={handleSettingsUpdate}
        />
      </CardContent>
    </Card>
  );
}
