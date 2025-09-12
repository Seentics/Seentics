'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FunnelStepCard } from './funnel-step-card';
import { Plus } from 'lucide-react';

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

interface FunnelStepsListProps {
  steps: FunnelStep[];
  onUpdateStep: (stepId: string, updates: Partial<FunnelStep>) => void;
  onRemoveStep: (stepId: string) => void;
  onMoveStep: (stepId: string, direction: 'up' | 'down') => void;
  onAddStep: () => void;
  validationErrors: Record<string, string[]>;
}

export function FunnelStepsList({
  steps,
  onUpdateStep,
  onRemoveStep,
  onMoveStep,
  onAddStep,
  validationErrors
}: FunnelStepsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Funnel Steps ({steps.length})
        </h2>
        <Button onClick={onAddStep} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <FunnelStepCard
            key={step.id}
            step={step}
            index={index}
            totalSteps={steps.length}
            onUpdate={(updates) => onUpdateStep(step.id, updates)}
            onRemove={() => onRemoveStep(step.id)}
            onMoveUp={() => onMoveStep(step.id, 'up')}
            onMoveDown={() => onMoveStep(step.id, 'down')}
            validationErrors={validationErrors[step.id] || []}
          />
        ))}
      </div>

      {steps.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No steps yet
          </h3>
          <p className="text-gray-500 mb-4">
            Add your first step to start building your funnel
          </p>
          <Button onClick={onAddStep}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Step
          </Button>
        </div>
      )}
    </div>
  );
}
