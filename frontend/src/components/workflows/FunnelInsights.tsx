'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingDown, 
  Plus, 
  ExternalLink,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useFunnels, useFunnelAnalytics } from '@/lib/analytics-api';
import Link from 'next/link';

interface FunnelInsightsProps {
  websiteId: string;
  onCreateWorkflow?: (context: { funnelStep: string; funnelName: string }) => void;
}

export function FunnelInsights({ websiteId, onCreateWorkflow }: FunnelInsightsProps) {
  const { data: funnels = [], isLoading: funnelsLoading } = useFunnels(websiteId);
  
  // Get analytics for active funnels
  const funnelAnalytics = funnels.filter(f => f.isActive).slice(0, 2).map(funnel => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: analytics } = useFunnelAnalytics(funnel.id, 7);
    return { funnel, analytics };
  });

  const getOptimizationOpportunities = () => {
    const opportunities: Array<{
      funnelName: string;
      step: string;
      dropOffRate: number;
      impact: 'high' | 'medium' | 'low';
      suggestedWorkflow: string;
    }> = [];

    funnelAnalytics.forEach(({ funnel, analytics }) => {
      if (analytics) {
        analytics.steps.forEach(step => {
          if (step.dropOffRate > 40) {
            opportunities.push({
              funnelName: funnel.name,
              step: step.name,
              dropOffRate: step.dropOffRate,
              impact: step.dropOffRate > 60 ? 'high' : step.dropOffRate > 45 ? 'medium' : 'low',
              suggestedWorkflow: getWorkflowSuggestion(step.name, step.dropOffRate)
            });
          }
        });
      }
    });

    return opportunities.sort((a, b) => b.dropOffRate - a.dropOffRate).slice(0, 3);
  };

  const getWorkflowSuggestion = (stepName: string, dropOffRate: number): string => {
    const lowerStep = stepName.toLowerCase();
    
    if (lowerStep.includes('checkout') || lowerStep.includes('payment')) {
      return 'Checkout Abandonment Recovery';
    } else if (lowerStep.includes('cart') || lowerStep.includes('add')) {
      return 'Cart Abandonment Recovery';
    } else if (lowerStep.includes('signup') || lowerStep.includes('form')) {
      return 'Lead Nurturing Sequence';
    } else if (lowerStep.includes('product') || lowerStep.includes('view')) {
      return 'Product Interest Retargeting';
    } else {
      return dropOffRate > 50 ? 'Exit Intent Recovery' : 'Engagement Boost';
    }
  };

  const opportunities = getOptimizationOpportunities();

  if (funnelsLoading) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (funnels.length === 0) {
    return (
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Funnel Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="mb-4">
              <div className="p-3 bg-muted rounded-full w-fit mx-auto">
                <Target className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="font-medium mb-2">No Funnels Created</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create conversion funnels to get workflow optimization insights
            </p>
            <Link href={`/websites/${websiteId}/funnels`}>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Funnel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <CardTitle>Funnel Insights</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {funnels.length} funnel{funnels.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Link href={`/websites/${websiteId}/funnels`}>
            <Button size="sm" variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {opportunities.length > 0 ? (
          <>
            <div className="space-y-3">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        opportunity.impact === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                        opportunity.impact === 'medium' ? 'bg-orange-100 dark:bg-orange-900/20' :
                        'bg-yellow-100 dark:bg-yellow-900/20'
                      }`}>
                        <TrendingDown className={`w-4 h-4 ${
                          opportunity.impact === 'high' ? 'text-red-600' :
                          opportunity.impact === 'medium' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{opportunity.funnelName}</h4>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{opportunity.step}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {opportunity.dropOffRate.toFixed(1)}% drop-off rate detected
                        </p>
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-blue-600 font-medium">
                            Suggested: {opportunity.suggestedWorkflow}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={
                          opportunity.impact === 'high' ? 'destructive' :
                          opportunity.impact === 'medium' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {opportunity.impact} impact
                      </Badge>
                      <Button
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onCreateWorkflow?.({
                          funnelStep: opportunity.step,
                          funnelName: opportunity.funnelName
                        })}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Create
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Found {opportunities.length} optimization opportunities
                </span>
                <Link href={`/websites/${websiteId}/funnels`}>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                    View Details
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit mx-auto mb-3">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-medium text-sm mb-1">Funnels Looking Good!</h4>
            <p className="text-xs text-muted-foreground">
              No major drop-off points detected in your active funnels
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
