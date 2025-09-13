"use client";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { FunnelHeader } from "@/components/funnels/funnel-header";
import { FunnelPreview } from "@/components/funnels/funnel-preview";
import { FunnelStepsList } from "@/components/funnels/funnel-steps-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

import {
  useCreateFunnel,
  useFunnels,
  useUpdateFunnel,
  type FunnelStep
} from "@/lib/analytics-api";

export default function FunnelEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const websiteId = params.websiteId as string;
  const funnelId = params.id as string;
  const isNewFunnel = funnelId === 'new';

  // State
  const [funnelName, setFunnelName] = useState('');
  const [funnelDescription, setFunnelDescription] = useState('');
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // API hooks
  const { data: funnels } = useFunnels(websiteId);
  const createFunnelMutation = useCreateFunnel();
  const updateFunnelMutation = useUpdateFunnel();

  // Load existing funnel data
  useEffect(() => {
    if (!isNewFunnel && funnels) {
      const funnel = funnels.find(f => f.id === funnelId);
      if (funnel) {
        setFunnelName(funnel.name);
        setFunnelDescription(funnel.description || '');
        setSteps(funnel.steps || []);
      }
    }
  }, [funnels, funnelId, isNewFunnel]);

  // Add new step
  const addStep = useCallback(() => {
    const newStep: FunnelStep = {
      id: `step-${Date.now()}`,
      name: '',
      type: 'page',
      condition: { page: '' },
      order: steps.length,
    };
    setSteps(prev => [...prev, newStep]);
  }, [steps.length]);

  // Update step
  const updateStep = useCallback((stepId: string, updates: Partial<FunnelStep>) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    ));
  }, []);

  // Remove step
  const removeStep = useCallback((stepId: string) => {
    setSteps(prev => {
      const filtered = prev.filter(step => step.id !== stepId);
      return filtered.map((step, index) => ({ ...step, order: index }));
    });
  }, []);

  // Move step
  const moveStep = useCallback((stepId: string, direction: 'up' | 'down') => {
    setSteps(prev => {
      const stepIndex = prev.findIndex(step => step.id === stepId);
      if (
        (direction === 'up' && stepIndex <= 0) ||
        (direction === 'down' && stepIndex >= prev.length - 1)
      ) {
        return prev;
      }

      const newSteps = [...prev];
      const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
      [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
      return newSteps.map((step, index) => ({ ...step, order: index }));
    });
  }, []);

  // Save funnel
  const saveFunnel = useCallback(async () => {
    if (!funnelName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a funnel name.",
        variant: "destructive",
      });
      return;
    }

    if (steps.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one step to your funnel.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const funnelData = {
        name: funnelName,
        description: funnelDescription,
        steps: steps,
        is_active: true,
      };

      if (isNewFunnel) {
        await createFunnelMutation.mutateAsync({
          websiteId,
          funnelData
        });
        toast({
          title: "Success",
          description: "Funnel created successfully!",
        });
      } else {
        await updateFunnelMutation.mutateAsync({
          funnelId,
          funnelData
        });
        toast({
          title: "Success",
          description: "Funnel updated successfully!",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['funnels', websiteId] });
      router.push(`/websites/${websiteId}/funnels`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save funnel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [funnelName, funnelDescription, steps, websiteId, isNewFunnel, funnelId, createFunnelMutation, updateFunnelMutation, queryClient, router, toast]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <FunnelHeader
        websiteId={websiteId}
        funnelName={funnelName}
        onNameChange={setFunnelName}
        onSave={saveFunnel}
        onPreview={() => { }} // TODO: Implement preview functionality
        isSaving={isSaving}
        isPreviewMode={false}
      />

      {/* Main Content */}
      <div className="py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Funnel Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Funnel Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Funnel Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="funnel-name">Funnel Name</Label>
                  <Input
                    id="funnel-name"
                    value={funnelName}
                    onChange={(e) => setFunnelName(e.target.value)}
                    placeholder="e.g., Checkout Funnel"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="funnel-description">Description (Optional)</Label>
                  <Textarea
                    id="funnel-description"
                    value={funnelDescription}
                    onChange={(e) => setFunnelDescription(e.target.value)}
                    placeholder="Describe what this funnel tracks..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Funnel Steps */}
            <FunnelStepsList
              steps={steps}
              onAddStep={addStep}
              onUpdateStep={updateStep}
              onRemoveStep={removeStep}
              onMoveStep={moveStep}
              validationErrors={{}}
            />
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <FunnelPreview
              funnelName={funnelName}
              steps={steps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
