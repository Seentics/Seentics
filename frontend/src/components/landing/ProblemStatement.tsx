'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, CheckCircle, Target, Zap } from 'lucide-react';

export default function ProblemStatement() {
  const features = [
    {
      icon: BarChart3,
      title: "Analytics",
      subtitle: "See What Really Happens",
      description: "Get clear insights into who visits your website, what they do, and why they leave. No confusing charts - just the data that helps you grow your business.",
      benefits: [
        "Track every visitor in real-time",
        "See which pages work best",
        "Understand where visitors come from",
        "Monitor conversions and sales automatically",
        "Get instant alerts when something changes",
        "Compare different time periods easily"
      ],
      technical: ["Real-time tracking", "Easy reports", "Smart alerts", "Growth insights"]
    },
    {
      icon: Zap,
      title: "Workflows",
      subtitle: "Automate Like Magic",
      description: "Set up smart automations that work 24/7. Show the right message to the right person at the perfect moment - without lifting a finger.",
      benefits: [
        "Drag-and-drop automation builder (no coding needed)", 
        "Welcome new visitors automatically",
        "Send emails based on visitor behavior",
        "Show popups when people are about to leave",
        "Create custom triggers for any action",
        "Ready-made templates to get started fast",
        "See which automations make you money"
      ],
      technical: ["Visual builder", "Smart triggers", "Auto-emails", "Pre-built templates"]
    },
    {
      icon: Target,
      title: "Funnels", 
      subtitle: "Turn Visitors Into Customers",
      description: "Create step-by-step journeys that guide visitors to buy, subscribe, or take action. Test different approaches to see what works best.",
      benefits: [
        "Build conversion paths that actually work",
        "Test different versions to find winners",
        "Guide visitors through your sales process",
        "Track every step from visit to purchase", 
        "Get suggestions on how to improve",
        "Connect with your email and payment tools",
        "Watch your conversion rates grow"
      ],
      technical: ["A/B testing", "Conversion tracking", "Smart recommendations", "Easy integrations"]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
              Everything You Need
              <span className="block text-slate-600 dark:text-slate-400 mt-2">
                In One Simple Platform
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
              Understand your visitors, automate your marketing, and grow your business - all without the technical headaches
            </p>
          </div>

          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border-0 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  
                  {/* Icon */}
                  <div className=" flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-500 rounded-xl mb-6">
                    <feature.icon className="h-8 w-8 text-slate-900 dark:text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  
                  {/* Subtitle */}
                  <p className="text-slate-600 dark:text-slate-400 font-semibold mb-4">
                    {feature.subtitle}
                  </p>
                  
                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Benefits */}
                  <ul className="space-y-2 mb-6">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Technical Stack */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      What You Get
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {feature.technical.map((tech, techIndex) => (
                        <span key={techIndex} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          {/* <div className="text-center bg-slate-900 dark:bg-slate-800 rounded-2xl p-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Boost Your Conversions?
            </h3>
            
            <p className="text-xl text-slate-100 mb-8 max-w-2xl mx-auto">
              Join 500+ businesses using Seentics to increase conversions by <span className="font-bold text-white">23% on average</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-3 px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 font-semibold">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="lg" className="gap-3 px-8 py-4 text-white hover:bg-white/10 border border-white/20">
                View Demo
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>14-day free trial</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}