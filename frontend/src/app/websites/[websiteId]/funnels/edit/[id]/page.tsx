"use client";

import Link from "next/link";
import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Save,
  Eye,
  Loader2,
  HelpCircle,
  Target,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  Bot,
  Lightbulb,
  PlayCircle,
  MousePointer,
  Globe,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

import {
  useFunnels,
  useCreateFunnel,
  useUpdateFunnel,
  type FunnelStep,
  type Funnel,
} from "@/lib/analytics-api";

// Step Builder Component - Powerful and Engaging
const StepBuilder = memo(({ step, index, totalSteps, onUpdate, onRemove, onMoveUp, onMoveDown }: {
  step: FunnelStep;
  index: number;
  totalSteps: number;
  onUpdate: (updates: Partial<FunnelStep>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded for better UX
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate step configuration
  const validateStep = useCallback(() => {
    const errors: string[] = [];
    if (!step.name.trim()) errors.push("Step name is required");
    if (step.type === 'page' && !step.condition.page) errors.push("Page URL is required");
    if (step.type === 'event' && !step.condition.event) errors.push("Event selector is required");
    if (step.type === 'custom' && !step.condition.custom) errors.push("Custom event name is required");
    setValidationErrors(errors);
    return errors.length === 0;
  }, [step]);

  useEffect(() => {
    validateStep();
  }, [validateStep]);

  const getStepIcon = () => {
    switch (step.type) {
      case 'page': return <Globe className="w-5 h-5" />;
      case 'event': return <MousePointer className="w-5 h-5" />;
      case 'custom': return <Zap className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getStepColor = () => {
    if (validationErrors.length > 0) return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20";
    return step.type === 'page' ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20" :
           step.type === 'event' ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20" :
           "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20";
  };

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
    <div className="relative">
      {/* Compact Step Card */}
      <div className={`border rounded-lg p-4 transition-all duration-200 ${getStepColor()}`}>
        {/* Compact Step Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {step.order}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
              Step {step.order}: {step.name || 'Untitled Step'}
            </h3>
            {validationErrors.length > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">⚠️ Please complete this step</p>
            )}
          </div>
          
          {/* Compact Actions */}
          <div className="flex items-center gap-0.5">
            {index > 0 && (
              <Button variant="ghost" size="sm" onClick={onMoveUp} className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                ↑
              </Button>
            )}
            {index < totalSteps - 1 && (
              <Button variant="ghost" size="sm" onClick={onMoveDown} className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                ↓
              </Button>
            )}
            {totalSteps > 2 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRemove}
                className="h-6 w-6 p-0 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-xs">
            <span className="font-medium text-red-800 dark:text-red-300">Fix: </span>
            <span className="text-red-700 dark:text-red-400">{validationErrors.join(', ')}</span>
          </div>
        )}

        {/* Compact Step Configuration */}
        <div className="space-y-3">
          {/* Step Name */}
          <div>
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              📝 What happens at this step?
            </Label>
            <Input
              value={step.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="e.g., Visitor lands on homepage..."
              className="text-sm h-8"
            />
          </div>

          {/* Compact Step Type Selection */}
          <div>
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              🎯 How should we track this?
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'page', label: 'Page', icon: '🌐' },
                { value: 'event', label: 'Click', icon: '👆' },
                { value: 'custom', label: 'Event', icon: '⚡' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdate({ type: option.value as any, condition: {} })}
                  className={`p-2 border rounded text-center transition-all duration-200 ${
                    step.type === option.value 
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="text-lg">{option.icon}</div>
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Compact Condition Input */}
          <div>
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              {step.type === 'page' && '🔗 Page URL'}
              {step.type === 'event' && '🎯 CSS Selector'}
              {step.type === 'custom' && '⚡ Event Name'}
            </Label>
            <Input
              value={
                step.type === 'page' ? step.condition.page || '' :
                step.type === 'event' ? step.condition.event || '' :
                step.condition.custom || ''
              }
              onChange={(e) => {
                const value = e.target.value;
                const condition = step.type === 'page' ? { page: value } :
                  step.type === 'event' ? { event: value } :
                  { custom: value };
                onUpdate({ condition });
              }}
              placeholder={
                step.type === 'page' ? '/checkout, /thank-you...' :
                step.type === 'event' ? '#buy-button, .cta-button...' :
                'purchase_complete...'
              }
              className="text-sm h-8"
            />
            
            {/* Compact Examples */}
            {getSuggestions().length > 0 && (
              <div className="mt-1">
                <div className="flex flex-wrap gap-1">
                  {getSuggestions().slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        const condition = step.type === 'page' ? { page: suggestion } :
                          step.type === 'event' ? { event: suggestion } :
                          { custom: suggestion };
                        onUpdate({ condition });
                      }}
                      className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Flow Connector */}
      {index < totalSteps - 1 && (
        <div className="flex justify-center my-3">
          <div className="w-px h-4 bg-blue-300 dark:bg-blue-600"></div>
        </div>
      )}
    </div>
  );
});

// Empty State Component - Simple and Encouraging
const EmptyFunnelState = ({ onAddStep }: { onAddStep: () => void }) => (
  <div className="text-center py-12">
    <div className="max-w-lg mx-auto">
      <div className="text-6xl mb-6">🎯</div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        Let's Build Your First Funnel!
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
        A funnel tracks how visitors move through your website to become customers. 
        We'll help you set it up step by step - it's easier than you think! 😊
      </p>
      
      <Button 
        onClick={onAddStep} 
        size="lg"
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        <Plus className="w-6 h-6 mr-3" />
        Start Building My Funnel
      </Button>
      
      {/* Simple Guide */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-4">
          <div className="text-3xl mb-3">1️⃣</div>
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Start Point</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Where do visitors first land? (Homepage, ads, etc.)</p>
        </div>
        <div className="p-4">
          <div className="text-3xl mb-3">2️⃣</div>
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Journey Steps</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">What pages do they visit? What buttons do they click?</p>
        </div>
        <div className="p-4">
          <div className="text-3xl mb-3">3️⃣</div>
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">End Goal</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">What's your conversion? (Purchase, signup, download, etc.)</p>
        </div>
      </div>
    </div>
  </div>
);

// Funnel Health Score Component
const FunnelHealthScore = ({ steps }: { steps: FunnelStep[] }) => {
  const calculateHealthScore = () => {
    if (steps.length === 0) return 0;
    
    let score = 0;
    const maxScore = 100;
    
    // Step count (20 points)
    if (steps.length >= 2) score += 20;
    if (steps.length >= 3 && steps.length <= 5) score += 10; // Optimal range
    
    // Configuration completeness (40 points)
    const configuredSteps = steps.filter(step => {
      const hasName = step.name.trim().length > 0;
      const hasCondition = 
        (step.type === 'page' && step.condition.page) ||
        (step.type === 'event' && step.condition.event) ||
        (step.type === 'custom' && step.condition.custom);
      return hasName && hasCondition;
    });
    score += (configuredSteps.length / steps.length) * 40;
    
    // Diversity bonus (20 points)
    const types = new Set(steps.map(s => s.type));
    if (types.size > 1) score += 20;
    
    // Naming quality (20 points)
    const wellNamedSteps = steps.filter(s => s.name.length > 5).length;
    score += (wellNamedSteps / steps.length) * 20;
    
    return Math.round(score);
  };

  const score = calculateHealthScore();
  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendations = () => {
    const recommendations = [];
    if (steps.length < 2) recommendations.push("Add at least 2 steps");
    if (steps.length > 6) recommendations.push("Consider simplifying to 3-5 steps");
    
    const unconfiguredSteps = steps.filter(step => {
      const hasCondition = 
        (step.type === 'page' && step.condition.page) ||
        (step.type === 'event' && step.condition.event) ||
        (step.type === 'custom' && step.condition.custom);
      return !step.name.trim() || !hasCondition;
    });
    
    if (unconfiguredSteps.length > 0) {
      recommendations.push(`Configure ${unconfiguredSteps.length} incomplete step(s)`);
    }
    
    return recommendations;
  };

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <div className="text-center">
        <div className={`text-3xl font-bold ${getScoreColor()}`}>
          {score}%
        </div>
        <p className="text-sm text-gray-600">Health Score</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
        {getRecommendations().length > 0 ? (
          <ul className="text-xs text-gray-600 space-y-1">
            {getRecommendations().map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-green-600">✅ Your funnel looks great!</p>
        )}
      </div>
    </div>
  );
};

// Funnel Templates Component
const FunnelTemplates = ({ onSelectTemplate }: { 
  onSelectTemplate: (template: { name: string; description: string; steps: FunnelStep[] }) => void 
}) => {
  const templates = [
    {
      name: "E-commerce Funnel",
      description: "Track product to purchase journey",
      steps: [
        { id: "t1-1", name: "Product Page", type: "page" as const, condition: { page: "/products" }, order: 1 },
        { id: "t1-2", name: "Add to Cart", type: "event" as const, condition: { event: "#add-to-cart" }, order: 2 },
        { id: "t1-3", name: "Checkout", type: "page" as const, condition: { page: "/checkout" }, order: 3 },
        { id: "t1-4", name: "Purchase Complete", type: "page" as const, condition: { page: "/thank-you" }, order: 4 }
      ]
    },
    {
      name: "Lead Generation",
      description: "Track visitor to lead conversion",
      steps: [
        { id: "t2-1", name: "Landing Page", type: "page" as const, condition: { page: "/" }, order: 1 },
        { id: "t2-2", name: "Contact Form", type: "page" as const, condition: { page: "/contact" }, order: 2 },
        { id: "t2-3", name: "Form Submit", type: "event" as const, condition: { event: "#contact-form" }, order: 3 }
      ]
    },
    {
      name: "SaaS Signup",
      description: "Track trial to paid conversion",
      steps: [
        { id: "t3-1", name: "Pricing Page", type: "page" as const, condition: { page: "/pricing" }, order: 1 },
        { id: "t3-2", name: "Sign Up", type: "page" as const, condition: { page: "/signup" }, order: 2 },
        { id: "t3-3", name: "Email Verification", type: "custom" as const, condition: { custom: "email_verified" }, order: 3 },
        { id: "t3-4", name: "Upgrade to Paid", type: "custom" as const, condition: { custom: "subscription_created" }, order: 4 }
      ]
    }
  ];

  return (
    <div className="space-y-3">
      {templates.map((template, index) => (
        <button
          key={index}
          onClick={() => onSelectTemplate(template)}
          className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
        >
          <h4 className="font-medium text-sm">{template.name}</h4>
          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
          <p className="text-xs text-blue-600 mt-2">{template.steps.length} steps</p>
        </button>
      ))}
    </div>
  );
};

// Analytics Preview Component
const AnalyticsPreview = ({ steps }: { steps: FunnelStep[] }) => {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-600">Analytics will appear here once your funnel is active and collecting data.</p>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 Activate your funnel and wait for real visitor data to see conversion rates and analytics.
        </p>
      </div>
    </div>
  );
};



function FunnelGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            Welcome to the Funnel Builder!
          </DialogTitle>
          <DialogDescription className="text-base">
            Learn how to create conversion funnels to track your customer journey. This guide will help you understand how users move through your website.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8 py-6 flex-1 overflow-y-auto pr-2">
          {/* Step 1 */}
          <div className="flex gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-lg flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                Define Your Steps
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                Add steps that represent important actions in your customer journey. Start with where users enter (like "Landing Page") and end with your goal (like "Purchase Complete").
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Tip:</strong> Common funnel steps include "Home Page", "Product Page", "Add to Cart", "Checkout", and "Thank You Page".
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-lg flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MousePointer className="h-5 w-5 text-green-600" />
                Set Up Tracking
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                Configure how each step is tracked. You can track page visits, button clicks, or custom events. Each step needs a condition that defines when a user has completed it.
              </p>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>🎯 Pro Tip:</strong> Use CSS selectors for button clicks (like "#buy-now-button") or page URLs for page visits ("/checkout").
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-lg flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Order Your Steps
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                Arrange your steps in the order users should complete them. Use the drag handles to reorder steps. The funnel will track progression from the first step to the last.
              </p>
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>⚙️ Order Matters:</strong> Users must complete steps in sequence. If they skip a step, it will show as a drop-off in your analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-lg flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-600" />
                Save & Activate
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                Save your funnel and activate it to start tracking. You'll be able to see conversion rates, drop-off points, and user flow analytics in your dashboard.
              </p>
              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>📊 Analytics:</strong> Once active, your funnel will start collecting data. Check back in a few hours to see your first insights.
                </p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Funnel Best Practices
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Step Design</h5>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• Keep funnels focused on one goal</li>
                  <li>• Use 3-7 steps for best results</li>
                  <li>• Name steps clearly and descriptively</li>
                  <li>• Test your tracking before going live</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Tracking Tips</h5>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• Page URLs should start with "/"</li>
                  <li>• Use specific CSS selectors for buttons</li>
                  <li>• Custom events need exact event names</li>
                  <li>• Test on different devices and browsers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button onClick={onClose} size="lg" className="px-8">
            Got It! Let's Build
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FunnelBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const siteId = params?.websiteId as string;
  const funnelId = params.id as string;

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isNewFunnel = funnelId === "new";
  
  const { data: funnels = [] } = useFunnels(siteId);
  const createFunnelMutation = useCreateFunnel();
  const updateFunnelMutation = useUpdateFunnel();

  // UI State
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [funnelName, setFunnelName] = useState("My Conversion Funnel");
  const [funnelDescription, setFunnelDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNewFunnel);
  const [error, setError] = useState<string | null>(null);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);



  // Load existing funnel if editing
  useEffect(() => {
    if (isNewFunnel) {
      setIsLoading(false);
      // Initialize with a simple 2-step funnel
      const initialSteps = [
        {
          id: `step-${Date.now()}-1`,
          name: "Landing Page",
          type: "page" as const,
          condition: { page: "/" },
          order: 1,
        },
        {
          id: `step-${Date.now()}-2`,
          name: "Conversion Goal",
          type: "page" as const,
          condition: { page: "/thank-you" },
          order: 2,
        },
      ];
      setSteps(initialSteps);
      return;
    }

    if (!user) return;

    const existingFunnel = funnels.find(f => f.id === funnelId);
    if (existingFunnel) {
      setFunnelName(existingFunnel.name);
      setFunnelDescription(existingFunnel.description || "");
      setIsActive(existingFunnel.is_active);
      setSteps(existingFunnel.steps || []);
      setIsLoading(false);
    } else if (funnels.length > 0) {
      // Funnel not found
      setError("Funnel not found");
      setIsLoading(false);
    }
  }, [isNewFunnel, funnelId, funnels, user]); // Removed stepsToNodesAndEdges from dependencies







  const addStep = useCallback(() => {
    setSteps(prevSteps => {
      const newStep: FunnelStep = {
        id: `step-${Date.now()}`,
        name: `Step ${prevSteps.length + 1}`,
        type: "page",
        condition: { page: "/" },
        order: prevSteps.length + 1,
      };
      return [...prevSteps, newStep];
    });
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setSteps(prevSteps => {
      const newSteps = prevSteps.filter(s => s.id !== stepId);
      // Reorder remaining steps
      return newSteps.map((step, index) => ({
        ...step,
        order: index + 1,
      }));
    });
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<FunnelStep>) => {
    setSteps(prevSteps => prevSteps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  }, []);

  const moveStep = useCallback((stepId: string, direction: 'up' | 'down') => {
    setSteps(prevSteps => {
      const stepIndex = prevSteps.findIndex(s => s.id === stepId);
      if (
        (direction === 'up' && stepIndex === 0) ||
        (direction === 'down' && stepIndex === prevSteps.length - 1)
      ) {
        return prevSteps;
      }

      const newSteps = [...prevSteps];
      const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
      
      // Swap the steps
      [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
      
      // Update order values
      return newSteps.map((step, index) => ({
        ...step,
        order: index + 1,
      }));
    });
  }, []);

  const handleSave = async (navigateToView: boolean = true) => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to save.",
        variant: "destructive",
      });
      return { success: false };
    }

    if (!funnelName.trim()) {
      toast({ title: "Funnel name required", variant: "destructive" });
      return { success: false };
    }

    // Use steps
    const currentSteps = steps;
    
    if (currentSteps.length < 2) {
      toast({ 
        title: "Incomplete Funnel", 
        description: "Please add at least 2 steps.", 
        variant: "destructive" 
      });
      return { success: false };
    }

    // Validate steps
    const issues: string[] = [];
    currentSteps.forEach((step, index) => {
      if (!step.name.trim()) {
        issues.push(`Step ${index + 1}: Name is required.`);
      }
      if (step.type === 'page' && !step.condition.page) {
        issues.push(`Step ${index + 1}: Page URL is required.`);
      }
      if (step.type === 'event' && !step.condition.event) {
        issues.push(`Step ${index + 1}: Event name is required.`);
      }
      if (step.type === 'custom' && !step.condition.custom) {
        issues.push(`Step ${index + 1}: Custom condition is required.`);
      }
    });

    if (issues.length > 0) {
      toast({ 
        title: 'Fix before saving', 
        description: issues.join('\n'), 
        variant: 'destructive' 
      });
      return { success: false };
    }

    setIsSaving(true);
    let success = false;
    let savedFunnelId = isNewFunnel ? undefined : funnelId;

    try {
      // Validate required fields
      if (!user?._id) {
        toast({
          title: "Authentication Error",
          description: "User ID is required. Please log in again.",
          variant: "destructive",
        });
        return { success: false };
      }

      // Debug logging for user object
      console.log('User object:', user);
      console.log('User ID:', user._id);
      console.log('Site ID:', siteId);

      const funnelData = {
        name: funnelName,
        description: funnelDescription,
        website_id: siteId,
        user_id: user._id,
        steps: currentSteps,
        is_active: isActive,
      };

      // Debug logging
      console.log('Creating funnel with data:', funnelData);

      if (!isNewFunnel) {
        await updateFunnelMutation.mutateAsync({
          funnelId,
          funnelData,
        });
        toast({
          title: "Funnel Updated",
          description: `"${funnelName}" has been saved.`,
        });
        success = true;
      } else {
        const newFunnel = await createFunnelMutation.mutateAsync({
          websiteId: siteId,
          funnelData,
        });
        savedFunnelId = newFunnel.id;
        toast({ title: "Funnel Created", description: `"${funnelName}" has been created.` });
        await queryClient.invalidateQueries({
          queryKey: ["funnels", siteId],
        });
        success = true;
      }

      setSaveDialogOpen(false);
      if (navigateToView && savedFunnelId) {
        router.push(`/websites/${siteId}/funnels/${savedFunnelId}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save funnel.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
    return { success, funnelId: savedFunnelId };
  };

  if (isLoading || (!user && !isNewFunnel)) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0 rounded-md bg-primary/10 p-1.5">
            <span className="font-bold text-primary"><Bot className="h-4 w-4" /></span>
          </Link>
          <div>
            <h1 className="text-xl font-semibold leading-tight">
              {isNewFunnel ? "Create Your Funnel" : funnelName}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isNewFunnel ? "Track your customer journey step by step" : "Edit your funnel"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={isSaving} onClick={() => setSaveDialogOpen(true)}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" disabled={isSaving} onClick={() => setSaveDialogOpen(true)}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
              Save & View
            </Button>
          </div>
        </div>
      </header>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isNewFunnel ? "Save New Funnel" : "Save Changes"}
            </DialogTitle>
            <DialogDescription>
              Configure your funnel settings before saving.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={funnelName}
                onChange={(e) => setFunnelName(e.target.value)}
                className="col-span-3"
                placeholder="My Conversion Funnel"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={funnelDescription}
                onChange={(e) => setFunnelDescription(e.target.value)}
                className="col-span-3"
                placeholder="Describe what this funnel tracks..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={async () => {
                const { success } = await handleSave(false);
                if (success) {
                  router.push(`/websites/${siteId}/funnels`);
                }
              }}
            >
              {isSaving && <Loader2 className="mr-2 animate-spin" />}
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90"
              disabled={isSaving}
              onClick={() => handleSave(true)}
            >
              {isSaving && <Loader2 className="mr-2 animate-spin" />}
              {isSaving ? "Saving..." : "Save & View"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100">Error Loading Funnel</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/websites/${siteId}/funnels`)}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Simple Steps Interface */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 px-4 sm:px-6 lg:px-8 py-6 min-h-0">
          <main className="min-w-0 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                        Build Your Funnel
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600 max-w-md mx-auto">
                        Create a step-by-step journey that tracks how visitors become customers
                      </CardDescription>
                    </div>
                    
                    {/* Progress Indicator */}
                    {steps.length > 0 && (
                      <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{steps.length}</div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">Steps</div>
                        </div>
                        <div className="w-px h-8 bg-blue-200 dark:bg-blue-700"></div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {steps.filter(s => s.name.trim() && (
                              (s.type === 'page' && s.condition.page) ||
                              (s.type === 'event' && s.condition.event) ||
                              (s.type === 'custom' && s.condition.custom)
                            )).length}
                          </div>
                          <div className="text-xs text-green-700 dark:text-green-300">Configured</div>
                        </div>
                        <div className="w-px h-8 bg-blue-200 dark:bg-blue-700"></div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                            {steps.length >= 2 ? '✓' : '○'}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Ready</div>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Funnel Steps */}
                    {steps.map((step, index) => (
                      <StepBuilder
                        key={step.id}
                        step={step}
                        index={index}
                        totalSteps={steps.length}
                        onUpdate={(updates: Partial<FunnelStep>) => updateStep(step.id, updates)}
                        onRemove={() => removeStep(step.id)}
                        onMoveUp={() => moveStep(step.id, 'up')}
                        onMoveDown={() => moveStep(step.id, 'down')}
                      />
                    ))}
                    
                    {/* Empty State */}
                    {steps.length === 0 && (
                      <EmptyFunnelState onAddStep={addStep} />
                    )}

                    {/* Add Step Button */}
                    {steps.length > 0 && (
                      <div className="text-center py-4">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                          <div className="text-2xl mb-2">➕</div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1 text-sm">Add Another Step</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            What's the next action in your customer journey?
                          </p>
                          <Button 
                            onClick={addStep} 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-all duration-200"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Step {steps.length + 1}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>

            {/* Enhanced Sidebar */}
            <aside className="space-y-6 overflow-y-auto max-h-full">
              {/* Funnel Health Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Funnel Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FunnelHealthScore steps={steps} />
                </CardContent>
              </Card>

              {/* Quick Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    Quick Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FunnelTemplates onSelectTemplate={(template) => {
                    setSteps(template.steps);
                    setFunnelName(template.name);
                    setFunnelDescription(template.description || "");
                  }} />
                </CardContent>
              </Card>

              {/* Analytics Preview */}
              {steps.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-green-600" />
                      Analytics Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnalyticsPreview steps={steps} />
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => setShowGuideModal(true)}
                  >
                    <HelpCircle className="w-4 h-4" />
                    View Guide
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      const testData = { funnelSteps: steps };
                      navigator.clipboard.writeText(JSON.stringify(testData, null, 2));
                      toast({ title: "Copied!", description: "Funnel data copied to clipboard" });
                    }}
                  >
                    📋 Copy Test Data
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>


      </div>
      
      {/* Funnel Guide Modal */}
      <FunnelGuideModal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)} 
      />
    </div>
  );
}

export default FunnelBuilder;
