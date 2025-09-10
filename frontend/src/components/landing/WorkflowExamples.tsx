import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, UserPlus, TrendingUp, Eye, Layers, Webhook } from 'lucide-react';

export default function WorkflowExamples() {
  const workflows = [
    {
      title: "E‑commerce: Abandoned Cart Recovery",
      description: "Recover hesitant buyers at exit",
      icon: ShoppingCart,
      color: "blue",
      link: "/websites/demo/workflows/edit/new?template=abandoned-cart",
    },
    {
      title: "SaaS: Pricing Page Lead Capture",
      description: "Convert high‑intent visitors",
      icon: UserPlus,
      color: "green",
      link: "/websites/demo/workflows/edit/new?template=lead-capture",
    },
    {
      title: "Content: Blog → Product Upsell",
      description: "Promote product to engaged readers",
      icon: TrendingUp,
      color: "purple",
      link: "/websites/demo/workflows/edit/new?template=content-upsell",
    },
    {
      title: "Re‑engagement: Inactive Users",
      description: "Bring users back with fresh content",
      icon: Eye,
      color: "orange",
      link: "/websites/demo/workflows/edit/new?template=re-engagement",
    },
    {
      title: "Onboarding Nudge",
      description: "Help new users finish setup",
      icon: Layers,
      color: "indigo",
      link: "/websites/demo/workflows/edit/new?template=onboarding-nudge",
    },
    {
      title: "Reliability: Webhook with Retries + Email Fallback",
      description: "Recover failed payments automatically",
      icon: Webhook,
      color: "red",
      link: "/websites/demo/workflows/edit/new?template=payment-recovery",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 text-slate-900 dark:text-white">
            Real-World Workflow Examples
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto px-2 sm:px-0">
            See how businesses use Seentics to automate customer engagement and boost conversions with powerful, reliable workflows.
          </p>
        </div>

        {/* Legend */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <span className="inline-flex items-center gap-2 px-2 sm:px-3 md:px-4 py-1 md:py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full text-xs sm:text-sm font-medium">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-slate-500" /> Trigger
            </span>
            <span className="inline-flex items-center gap-2 px-2 sm:px-3 md:px-4 py-1 md:py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs sm:text-sm font-medium">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500" /> Condition
            </span>
            <span className="inline-flex items-center gap-2 px-2 sm:px-3 md:px-4 py-1 md:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs sm:text-sm font-medium">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-purple-500" /> Action
            </span>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 md:mb-10">
            Built-in support for A/B testing, delays, retries, and complex branching logic
          </p>
        </div>

        {/* Workflow Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 max-w-7xl mx-auto">
          {workflows.map((workflow, index) => (
            <Card key={index} className="group shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-${workflow.color}-600 to-${workflow.color}-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <workflow.icon className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl text-slate-900 dark:text-white mb-1 sm:mb-2">
                      {workflow.title}
                    </CardTitle>
                    <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
                      {workflow.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Workflow Diagram */}
                <div className={`rounded-xl bg-gradient-to-r from-slate-50 to-${workflow.color}-50 dark:from-slate-900/40 dark:to-${workflow.color}-900/20 p-3 sm:p-4 overflow-x-auto border border-slate-200/50 dark:border-slate-700/50 mb-4 sm:mb-6`}>
                  <svg className="w-full h-12 sm:h-14 md:h-16" viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <marker id={`arrow${index + 1}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                        <path d="M0,0 L8,4 L0,8 Z" fill="#3B82F6" />
                      </marker>
                    </defs>
                    <g fontSize="11" fontFamily="ui-sans-serif,system-ui" fill="#0f172a" fontWeight="500">
                      {/* Trigger */}
                      <rect x="10" y="15" width="80" height="30" rx="6" ry="6" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" />
                      <text x="50" y="28" textAnchor="middle" fill="white" fontSize="10">Trigger</text>
                      
                      {/* Arrow 1 */}
                      <line x1="100" y1="30" x2="130" y2="30" stroke="#3B82F6" strokeWidth="3" markerEnd={`url(#arrow${index + 1})`} />
                      
                      {/* Condition */}
                      <rect x="140" y="15" width="80" height="30" rx="6" ry="6" fill="#10B981" stroke="#059669" strokeWidth="2" />
                      <text x="180" y="28" textAnchor="middle" fill="white" fontSize="10">Condition</text>
                      
                      {/* Arrow 2 */}
                      <line x1="230" y1="30" x2="260" y2="30" stroke="#3B82F6" strokeWidth="3" markerEnd={`url(#arrow${index + 1})`} />
                      
                      {/* Action */}
                      <rect x="270" y="15" width="80" height="30" rx="6" ry="6" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="2" />
                      <text x="310" y="28" textAnchor="middle" fill="white" fontSize="10">Action</text>
                    </g>
                  </svg>
                </div>
                
                {/* Button */}
                <div className="pt-3 sm:pt-4">
                  <Button 
                    size="default" 
                    variant="outline" 
                    className={`w-full sm:w-auto bg-white hover:bg-${workflow.color}-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-${workflow.color}-200 hover:border-${workflow.color}-300 text-${workflow.color}-700 dark:text-${workflow.color}-300 hover:text-${workflow.color}-800 dark:hover:text-${workflow.color}-200 transition-all duration-300`}
                  >
                    View Workflow →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}


