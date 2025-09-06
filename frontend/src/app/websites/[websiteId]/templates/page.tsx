
'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Copy, Play, Plus, Search, Filter, Star, Users, TrendingUp, Sparkles, Zap, Target, Shield, ShoppingCart, Mail, MessageSquare, Newspaper, Pointer, ListFilter, SmilePlus, Webhook, Database, Calculator, MousePointer, MousePointerClick, Clock, ArrowDown, FileText, Eye, Timer, Send, Tags, AlarmClock, MessageSquare as MessageSquareIcon, BarChart2, UserPlus, CalendarClock, AlertTriangle, Split, Hourglass, Smartphone, ArrowDownToLine, CheckSquare, Link2, LayoutTemplate, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { WORKFLOW_TEMPLATES, type WorkflowTemplate, type WorkflowTemplateDifficulty } from '@/lib/workflow-templates';
import { WorkflowDiagram } from '@/components/workflow-diagram';
import { useAuth } from '@/stores/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getSubscription, checkPermission } from '@/lib/subscription-api';
import ContextualUpgradeBanner from '@/components/contextual-upgrade-banner';
import { SubscriptionUsageWidget } from '@/components/subscription-usage-widget';

export default function TemplatesPage() {
  const params = useParams();
  const siteId = params?.websiteId as string;
  const { user } = useAuth();
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Fetch subscription data
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await getSubscription();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check workflow permissions
  const canCreateWorkflow = useMemo(() => {
    if (!subscription) return false;
    const currentWorkflowCount = subscription.usage?.workflows || 0;
    return checkPermission('workflows', currentWorkflowCount, subscription).allowed;
  }, [subscription]);

  const handleUseTemplate = (templateId: string) => {
    if (!canCreateWorkflow) {
      // Redirect to billing page if user can't create more workflows
      window.location.href = `/websites/${siteId}/billing`;
      return;
    }
    window.location.href = `/websites/${siteId}/workflows/edit/new?template=${templateId}`;
  };

  const handlePreviewTemplate = (template: WorkflowTemplate) => {
    setPreviewTemplate(template);
  };

  // Get unique categories and difficulties
  const categories = useMemo(() => {
    const cats = [...new Set(WORKFLOW_TEMPLATES.map(t => t.category))];
    return ['all', ...cats];
  }, []);

  const difficulties = useMemo(() => {
    return ['all', 'Beginner', 'Intermediate', 'Advanced'];
  }, []);

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    return WORKFLOW_TEMPLATES.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty: WorkflowTemplateDifficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'Lead Generation': Users,
      'E-commerce': ShoppingCart,
      'Email Marketing': Mail,
      'Support': MessageSquareIcon,
      'Marketing': TrendingUp,
      'Retention': Users,
      'Optimization': Target,
      'Compliance': Shield,
      'Growth': Sparkles,
      'Conversion': Pointer,
      'Attribution': ListFilter,
      'Feedback': SmilePlus,
      'Integrations': Webhook,
      'Sales & Marketing': Target
    };
    return iconMap[category] || Zap;
  };

  const getCategoryAccent = (category: string) => {
    // Soft gradient accents per common categories; defaults are blue
    switch (category) {
      case 'Lead Generation':
        return 'from-emerald-400/20 via-emerald-500/10 to-emerald-600/10 text-emerald-600';
      case 'E-commerce':
        return 'from-rose-400/20 via-rose-500/10 to-rose-600/10 text-rose-600';
      case 'Email Marketing':
        return 'from-amber-400/20 via-amber-500/10 to-amber-600/10 text-amber-600';
      case 'Support':
        return 'from-sky-400/20 via-sky-500/10 to-sky-600/10 text-sky-600';
      case 'Optimization':
        return 'from-violet-400/20 via-violet-500/10 to-violet-600/10 text-violet-600';
      case 'Growth':
        return 'from-fuchsia-400/20 via-fuchsia-500/10 to-fuchsia-600/10 text-fuchsia-600';
      default:
        return 'from-blue-400/20 via-blue-500/10 to-blue-600/10 text-blue-600';
    }
  };

  const getCategoryBorderClass = (category: string) => {
    switch (category) {
      case 'Lead Generation': return 'border-emerald-500';
      case 'E-commerce': return 'border-rose-500';
      case 'Email Marketing': return 'border-amber-500';
      case 'Support': return 'border-sky-500';
      case 'Optimization': return 'border-violet-500';
      case 'Growth': return 'border-fuchsia-500';
      default: return 'border-blue-500';
    }
  };

  const getDifficultyBarProps = (difficulty: WorkflowTemplateDifficulty) => {
    switch (difficulty) {
      case 'Beginner': return { width: '33%', cls: 'bg-emerald-500' };
      case 'Intermediate': return { width: '66%', cls: 'bg-amber-500' };
      case 'Advanced': return { width: '100%', cls: 'bg-rose-500' };
      default: return { width: '33%', cls: 'bg-blue-500' };
    }
  };

  const getNodeIcon = (title: string, type: string) => {
    const t = (title || type || '').toLowerCase();
    if (t.includes('page') || t.includes('view')) return Eye;
    if (t.includes('time') || t.includes('wait')) return Timer;
    if (t.includes('click')) return MousePointerClick;
    if (t.includes('exit')) return ArrowDown;
    if (t.includes('branch') || t.includes('split')) return Split;
    if (t.includes('email')) return Mail;
    if (t.includes('webhook')) return Webhook;
    if (t.includes('tag')) return Tags;
    return Pointer;
  };

  const getFlowStepsPreview = (template: WorkflowTemplate) => {
    try {
      const nodes = Array.isArray((template as any).nodes) ? (template as any).nodes : [];
      const sorted = [...nodes].sort((a: any, b: any) => (a?.position?.x || 0) - (b?.position?.x || 0));
      return sorted.slice(0, 5).map((n: any) => ({
        title: n?.data?.title || n?.data?.type || 'Step',
        type: n?.data?.type || 'Step'
      }));
    } catch {
      return [] as Array<{ title: string; type: string }>;
    }
  };

  const categoryDescriptions: Record<string, string> = {
    'Lead Generation': 'Capture more leads with smart banners, modals, and targeting.',
    'E-commerce': 'Recover carts, promote offers, and optimize conversion paths.',
    'Email Marketing': 'Grow your list and trigger emails from on-site behavior.',
    'Support': 'Deflect tickets and guide users with contextual UX.',
    'Marketing': 'Run campaigns with precise audience targeting and timing.',
    'Retention': 'Engage returning users and increase session depth.',
    'Optimization': 'Test variants and measure impact with built-in funnels.',
    'Compliance': 'Show consent banners and policy notices where needed.',
    'Growth': 'Promote upsells, referrals, and activations at the right time.',
    'Conversion': 'Nudge visitors to complete the key actions that matter.',
    'Attribution': 'Tag and segment traffic for downstream analysis.',
    'Feedback': 'Collect feedback and insights without friction.',
    'Integrations': 'Connect workflows to your tools via webhooks, email, and tags.',
    'Sales & Marketing': 'Qualify, route, and convert leads faster.'
  };

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    WORKFLOW_TEMPLATES.forEach(t => map.set(t.category, (map.get(t.category) || 0) + 1));
    return map;
  }, []);

  const topCategories = useMemo(() => {
    return Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [categoryCounts]);

  const featuredTemplates = useMemo(() => {
    return [...WORKFLOW_TEMPLATES]
      .sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
      .slice(0, 5);
  }, []);

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    WORKFLOW_TEMPLATES.forEach(t => (t.tags || []).forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([tag]) => tag);
  }, []);

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-6 flex flex-col md:flex-row items-start justify-between">
        <div className="space-y-4">
          <h1 className="text-3xl text-start font-bold tracking-tight text-foreground text-gray-900 dark:text-white">
            Workflow Templates
          </h1>
          <p className="text-base text-left text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Pre-built workflows to get you started quickly. Customize and adapt them to your needs with our powerful automation engine.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button asChild size="lg" className="shadow-lg hover:shadow-md transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-base font-semibold rounded-lg">
            <Link href={`/websites/${siteId}/workflows/edit/new`}>
              <Plus className="mr-2 h-5 w-5" />
              Create Custom Workflow
            </Link>
          </Button>
        </div>
      </div>

      {/* Subscription Upgrade Banner */}
      {subscription && !canCreateWorkflow && (
        <ContextualUpgradeBanner
          type="workflows"
          current={subscription.usage?.workflows || 0}
          limit={subscription.limits?.workflows || 0}
          plan={subscription.plan}
          className="max-w-4xl mx-auto"
        />
      )}

      {/* Usage Widget
      <div className="max-w-4xl mx-auto">
        <SubscriptionUsageWidget compact={true} showWarnings={true} />
      </div> */}

      {/* Search and Filters */}
      <div className="space-y-6">
      
   

  
      </div>

      {/* Featured carousel-like row */}
      {featuredTemplates.length > 0 && (
        <div className="mt-4 space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured templates</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {featuredTemplates.map((t) => {
              const Icon = getCategoryIcon(t.category);
              return (
                <button key={t.id} onClick={() => handlePreviewTemplate(t)} className="min-w-[260px] text-left rounded-2xl border-2 border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 p-4 hover:bg-blue-100/60 dark:hover:bg-blue-900/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-white/60 dark:border-gray-700">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{t.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{t.category}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{t.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular tags */}
      {topTags.length > 0 && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular tags</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-3 h-9 rounded-full border text-sm whitespace-nowrap bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2  gap-8">
        {filteredTemplates.map((template) => {
          const CategoryIcon = getCategoryIcon(template.category);
          const accent = getCategoryAccent(template.category);
          const triggerCount = template.nodes.filter((n: any) => n?.data?.type === 'Trigger').length;
          const conditionCount = template.nodes.filter((n: any) => n?.data?.type === 'Condition').length;
          const actionCount = template.nodes.filter((n: any) => n?.data?.type === 'Action').length;
          return (
            <Card key={template.id} className="group relative shadow-lg hover:shadow-[0_20px_45px_rgba(2,6,23,0.2)] bg-white dark:bg-gray-800 transition-all duration-300 overflow-hidden rounded-2xl border-2">
              {/* Accent */}
              <div className={`pointer-events-none absolute -top-16 -right-20 h-48 w-48 rounded-full blur-3xl bg-gradient-to-br ${accent}`} />
              <div className={`pointer-events-none absolute -bottom-16 -left-20 h-40 w-40 rounded-full blur-3xl bg-gradient-to-br ${accent}`} />
              {/* Card Header with Icon and Stats */}
              <CardHeader className="pb-4 relative">
                {/* <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/70 dark:bg-gray-900/40 border border-white/60 dark:border-gray-700 rounded-xl shadow-sm">
                    <CategoryIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{template.useCount}</span>
                    </div>
                  </div>
                </div> */}
                
                <div className="space-y-2">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {template.description}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Difficulty + Category */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Badge className={`px-3 py-1.5 text-xs font-semibold border ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </Badge>
                    <div className="w-20 h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full ${getDifficultyBarProps(template.difficulty).cls}`}
                        style={{ width: getDifficultyBarProps(template.difficulty).width }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{template.category}</span>
                </div>
                
                {/* Workflow Preview */}
                <div className={`rounded-xl p-4 border ${getCategoryBorderClass(template.category)} bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800`}
                >
                  <div className="text-center mb-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Workflow Preview</span>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-sm">
                    <WorkflowDiagram nodes={template.nodes} edges={template.edges} />
                  </div>
                </div>
                
                {/* Flow steps preview */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {getFlowStepsPreview(template).map((s, idx, arr) => {
                    const Ico = getNodeIcon(s.title, s.type);
                    return (
                      <div key={`${s.title}-${idx}`} className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-blue-50/60 dark:bg-blue-900/20">
                          <Ico className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
                          <span className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{s.title}</span>
                        </div>
                        {idx < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                      </div>
                    );
                  })}
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 bg-white/70 dark:bg-gray-900/40">
                    <div className="text-xs text-gray-500">Triggers</div>
                    <div className="text-sm font-semibold">{triggerCount}</div>
                  </div>
                  <div className="text-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 bg-white/70 dark:bg-gray-900/40">
                    <div className="text-xs text-gray-500">Conditions</div>
                    <div className="text-sm font-semibold">{conditionCount}</div>
                  </div>
                  <div className="text-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 bg-white/70 dark:bg-gray-900/40">
                    <div className="text-xs text-gray-500">Actions</div>
                    <div className="text-sm font-semibold">{actionCount}</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs font-medium px-2.5 py-1 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                      +{template.tags.length - 3} more
                    </Badge>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={() => handleUseTemplate(template.id)}
                    disabled={!canCreateWorkflow}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 h-11 font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {canCreateWorkflow ? 'Use Template' : 'Upgrade to Use'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handlePreviewTemplate(template)}
                    className="border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 h-11 px-4 rounded-lg"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category overview */}
      <div className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Explore by category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCategories.map(({ name, count }) => {
            const Icon = getCategoryIcon(name);
            return (
              <div key={name} className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{count} templates</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{categoryDescriptions[name] || 'Templates curated for this category.'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How templates work diagram */}
      <div className="mt-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">How a template becomes a workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white/70 dark:bg-gray-900/40">
            <div className="text-sm font-semibold mb-1">1. Pick a template</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Choose by category, difficulty, or search. Preview the flow before using.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white/70 dark:bg-gray-900/40">
            <div className="text-sm font-semibold mb-1">2. Customize nodes</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Edit triggers, conditions, and actions to match your site and audience.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white/70 dark:bg-gray-900/40">
            <div className="text-sm font-semibold mb-1">3. Launch & measure</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Publish, then track funnels, drop-off, and performance per step.</p>
          </div>
        </div>
      </div>

      {/* Tips & best practices */}
      <div className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Template tips</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
          <li>Start simple: one trigger, one action. Add conditions once it works.</li>
          <li>Use A/B or Branch Split to test variants without redeploying.</li>
          <li>Leverage tags to segment users and enable advanced targeting.</li>
          <li>Use time windows for business hours or campaign timing.</li>
          <li>Keep designs consistent; use custom HTML/CSS in modals/banners.</li>
          <li>Watch funnels weekly and iterate on biggest drop-offs first.</li>
        </ul>
      </div>

      {/* No Results Message */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No templates found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
            }}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Enhanced Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              {previewTemplate && (() => {
                const PI = getCategoryIcon(previewTemplate.category);
                return (
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <PI className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                );
              })()}
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {previewTemplate?.name}
                </DialogTitle>
                <DialogDescription className="text-lg text-muted-foreground leading-relaxed">
                  {previewTemplate?.description}
                </DialogDescription>
              </div>
            </div>
            
            {previewTemplate && (
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Badge className={`px-3 py-1.5 text-sm font-semibold border ${getDifficultyColor(previewTemplate.difficulty)}`}>
                    {previewTemplate.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{previewTemplate.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium text-gray-900 dark:text-white">{previewTemplate.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{previewTemplate.useCount} uses</span>
                </div>
              </div>
            )}
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-6">
              {/* Large Workflow Diagram */}
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Workflow Diagram</span>
                </div>
                <div className="flex justify-center overflow-hidden bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <WorkflowDiagram 
                    nodes={previewTemplate.nodes} 
                    edges={previewTemplate.edges}
                    className="border-0 scale-125"
                  />
                </div>
              </div>
              
              {/* Tags */}
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)} className="border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 px-6 py-2 h-11 rounded-lg">
              Close
            </Button>
            {previewTemplate && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2 h-11 font-semibold rounded-lg">
                <Link href={`/websites/${siteId}/workflows/edit/new?template=${previewTemplate.id}`}>
                  <Play className="mr-2 h-4 w-4" />
                  Use This Template
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
