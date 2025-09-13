'use client';

import Link from 'next/link';
import { Workflow, Zap, Target, ArrowRight, CheckCircle, Users, BarChart3, Clock, Star } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/landing/Footer';
import { LandingPageChatbot } from '@/components/landing-page-chatbot';

export default function WorkflowsLanding() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingHeader />
      <main>
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 mb-12 md:mb-16">
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
            <div className="relative max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-3">Workflows</Badge>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                Automate on-site experiences with visual workflows
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg">
                Create behavior‑driven flows that react to page views, clicks, scroll depth, time on page, and more. Show banners, modals, run A/B splits, send webhooks, or emails — all without writing backend code.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/signup"><Button className="bg-blue-600 hover:bg-blue-700">Build a workflow</Button></Link>
                <Link href="/docs"><Button variant="outline">Read the docs</Button></Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-4 text-xs md:text-sm text-slate-500 dark:text-slate-400">
                <span>Lightweight tracker</span>
                <span>•</span>
                <span>Server actions with retries</span>
                <span>•</span>
                <span>Built-in funnels & analytics</span>
              </div>
            </div>
          </section>

          {/* What / Why / Analytics */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Logo size="sm" /> What are Workflows?</CardTitle>
                <CardDescription>Event-driven automations for your website</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
                Workflows are visual flows of triggers ➝ conditions ➝ actions. They run in the browser via a lightweight tracker and can call server-side actions when needed.
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-violet-600" /> How it works</CardTitle>
                <CardDescription>Listen, decide, act</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-300 text-sm md:text-base space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Triggers detect behavior (page view, click, scroll, exit intent, time spent)</li>
                  <li>Conditions refine targeting (URL, device, referrer, tag, time window, A/B or branch split)</li>
                  <li>Actions change UX or call services (banner, modal, insert section, webhook, email, tags)</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-emerald-600" /> Analytics built-in</CardTitle>
                <CardDescription>See funnels and performance per step</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
                Track triggers, completions, timings, and drop-off. Optimize with A/B or multi-branch flows and measure results in real-time.
              </CardContent>
            </Card>
          </section>

          {/* Triggers, Conditions, Actions */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Triggers</CardTitle>
                <CardDescription>When should the flow start?</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-300 text-sm md:text-base space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="inline-flex items-center gap-2 text-sm"><Eye className="h-4 w-4" /> Page View</span>
                  <span className="inline-flex items-center gap-2 text-sm"><Timer className="h-4 w-4" /> Time Spent</span>
                  <span className="inline-flex items-center gap-2 text-sm"><MousePointer className="h-4 w-4" /> Inactivity</span>
                  <span className="inline-flex items-center gap-2 text-sm"><MousePointerClick className="h-4 w-4" /> Element Click</span>
                  <span className="inline-flex items-center gap-2 text-sm"><GitBranch className="h-4 w-4" /> Scroll Depth</span>
                  <span className="inline-flex items-center gap-2 text-sm"><ChevronRight className="h-4 w-4" /> Exit Intent</span>
                  <span className="inline-flex items-center gap-2 text-sm"><Code2 className="h-4 w-4" /> Custom Event</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Conditions</CardTitle>
                <CardDescription>Who and where to target</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-300 text-sm md:text-base space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-sm">URL Path</span>
                  <span className="text-sm">Referrer</span>
                  <span className="text-sm">Device Type</span>
                  <span className="text-sm">Browser</span>
                  <span className="text-sm">New vs Returning</span>
                  <span className="text-sm">Query Param match</span>
                  <span className="text-sm">Time Window</span>
                  <span className="text-sm">Tag existence</span>
                  <span className="text-sm">A/B Split</span>
                  <span className="text-sm">Branch Split</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>What should happen?</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-300 text-sm md:text-base space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="inline-flex items-center gap-2 text-sm"><ChevronRight className="h-4 w-4" /> Show Banner</span>
                  <span className="inline-flex items-center gap-2 text-sm"><ChevronRight className="h-4 w-4" /> Show Modal</span>
                  <span className="inline-flex items-center gap-2 text-sm"><ChevronRight className="h-4 w-4" /> Insert Section</span>
                  <span className="inline-flex items-center gap-2 text-sm"><ChevronRight className="h-4 w-4" /> Redirect URL</span>
                  <span className="inline-flex items-center gap-2 text-sm"><ChevronRight className="h-4 w-4" /> Track Event</span>
                  <span className="inline-flex items-center gap-2 text-sm"><Mail className="h-4 w-4" /> Send Email</span>
                  <span className="inline-flex items-center gap-2 text-sm"><Webhook className="h-4 w-4" /> Webhook</span>
                  <span className="inline-flex items-center gap-2 text-sm"><ChevronRight className="h-4 w-4" /> Add/Remove Tag</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Popular templates */}
          <section className="space-y-6 md:space-y-8 mb-12 md:mb-16">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Popular templates</h2>
              <Link href="/signup"><Button variant="outline">Start from a template</Button></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <Card className="bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Welcome Banner</CardTitle>
                  <CardDescription>Show a banner on landing pages</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-300">
                  Trigger: Page View (path starts with "/") → Action: Show Banner (CTA to signup)
                </CardContent>
              </Card>
              <Card className="bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Exit Intent Modal</CardTitle>
                  <CardDescription>Prevent abandonment with a discount</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-300">
                  Trigger: Exit Intent → Condition: New vs Returning → Action: Show Modal (coupon)
                </CardContent>
              </Card>
              <Card className="bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>A/B Banner Test</CardTitle>
                  <CardDescription>Compare two banner variants</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-300">
                  Trigger: Page View → Condition: A/B Split → Actions: Show Banner (A or B)
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 1-2-3 How it works */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">1. Add the tracker</CardTitle>
                <CardDescription>One script tag, instant behavior tracking</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 dark:text-slate-300">
                Drop the snippet on your site. The tracker loads asynchronously and respects performance.
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">2. Build your flow</CardTitle>
                <CardDescription>Drag-and-drop in the visual editor</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 dark:text-slate-300">
                Combine triggers, conditions, and actions. Preview and test on any page.
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">3. Launch & measure</CardTitle>
                <CardDescription>See funnels and optimize quickly</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 dark:text-slate-300">
                View step metrics, drop-off, and variants. Iterate with A/B and branch splits.
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <section className="text-center py-10 md:py-12 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Ready to build your first workflow?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">Use templates or start from scratch. Track results in real-time.</p>
            <Link href="/signup"><Button className="bg-blue-600 hover:bg-blue-700">Get started</Button></Link>
          </section>
        </div>
      </main>
      <Footer />
      <LandingPageChatbot />
    </div>
  );
}


