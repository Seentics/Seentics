'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

interface FunnelStep {
  id: string;
  name: string;
  type: 'page' | 'event' | 'custom';
  order: number;
  condition: {
    page?: string;
    event?: string;
    custom?: string;
  };
  description?: string;
}

interface FunnelStepCardProps {
  step: FunnelStep;
  index: number;
  totalSteps: number;
  onUpdate: (updates: Partial<FunnelStep>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  validationErrors: string[];
}

export function FunnelStepCard({
  step,
  index,
  totalSteps,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  validationErrors
}: FunnelStepCardProps) {
  const hasErrors = validationErrors.length > 0;

  const getTypeDescription = () => {
    switch (step.type) {
      case 'page': return "Tracks when visitors reach a specific page";
      case 'event': return "Tracks clicks on buttons or elements";
      case 'custom': return "Tracks custom JavaScript events";
      default: return "";
    }
  };

  const getSuggestions = () => {
    switch (step.type) {
      case 'page': return ["/", "/products", "/checkout", "/thank-you", "/contact"];
      case 'event': return ["#buy-now", ".cta-button", "[data-action='purchase']", "#signup-form"];
      case 'custom': return ["page_view", "signup_complete", "purchase_complete", "download_start"];
      default: return [];
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {step.order}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Step {step.order}
            </h3>
            {hasErrors && (
              <p className="text-sm text-red-600 dark:text-red-400">Please complete this step</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {index > 0 && (
            <Button variant="ghost" size="sm" onClick={onMoveUp}>
              ↑
            </Button>
          )}
          {index < totalSteps - 1 && (
            <Button variant="ghost" size="sm" onClick={onMoveDown}>
              ↓
            </Button>
          )}
          {totalSteps > 2 && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {hasErrors && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">
            {validationErrors.join(', ')}
          </p>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Step Name */}
        <div>
          <Label htmlFor={`step-name-${step.id}`} className="text-sm font-medium">
            Step Name
          </Label>
          <Input
            id={`step-name-${step.id}`}
            value={step.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g., Visitor lands on homepage"
            className="mt-1"
          />
        </div>

        {/* Step Type */}
        <div>
          <Label className="text-sm font-medium">Tracking Type</Label>
          <Select value={step.type} onValueChange={(value: 'page' | 'event' | 'custom') => onUpdate({ type: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="page">Page Visit</SelectItem>
              <SelectItem value="event">Element Click</SelectItem>
              <SelectItem value="custom">Custom Event</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">{getTypeDescription()}</p>
        </div>

        {/* Condition Input */}
        <div>
          <Label htmlFor={`step-condition-${step.id}`} className="text-sm font-medium">
            {step.type === 'page' ? 'Page Path' : step.type === 'event' ? 'CSS Selector' : 'Event Name'}
          </Label>
          <Input
            id={`step-condition-${step.id}`}
            value={step.condition?.[step.type] || ''}
            onChange={(e) => onUpdate({ 
              condition: { 
                ...step.condition, 
                [step.type]: e.target.value 
              } 
            })}
            placeholder={getSuggestions()[0] || ''}
            className="mt-1"
          />
          <div className="flex flex-wrap gap-1 mt-2">
            {getSuggestions().slice(0, 3).map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => onUpdate({ 
                  condition: { 
                    ...step.condition, 
                    [step.type]: suggestion 
                  } 
                })}
                className="text-xs h-6"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor={`step-description-${step.id}`} className="text-sm font-medium">
            Description (Optional)
          </Label>
          <Textarea
            id={`step-description-${step.id}`}
            value={step.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Additional details about this step..."
            className="mt-1"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
