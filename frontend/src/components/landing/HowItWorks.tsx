'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart3, CheckCircle, Clock, Code, Play, Rocket, TrendingUp, Users } from 'lucide-react';
import { Button } from '../ui/button';

const steps = [
  {
    step: "01",
    icon: Code,
    title: "Add One Line of Code",
    description: "Copy and paste one simple line into your website. That's it - no technical skills needed.",
    details: [
      "Works on any website",
      "Takes less than 2 minutes",
      "No impact on site speed",
      "Start tracking immediately"
    ],
    benefits: "Setup in 2 minutes"
  },
  {
    step: "02",
    icon: BarChart3,
    title: "Watch Your Data Grow",
    description: "See who visits your site, what they do, and where they come from. All in real-time.",
    details: [
      "See visitors as they browse",
      "Track which pages work best",
      "Know where traffic comes from",
      "Monitor sales and signups"
    ],
    benefits: "Instant insights"
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Use what you learn to make your website better. Create automations that turn visitors into customers.",
    details: [
      "Build welcome messages",
      "Send targeted emails",
      "Test different approaches",
      "Increase your sales"
    ],
    benefits: "More customers"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
            How It Works
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Get up and running in minutes. No complicated setup, no technical headaches.
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              
              {/* Connection Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-4 z-10">
                  <ArrowRight className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                </div>
              )}
              
              {/* Card */}
              <Card className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 h-full">
                <CardHeader className="text-center pb-6">
                  
                  {/* Step Number */}
                  <div className="w-12 h-12 bg-blue-600 dark:bg-blue-600 rounded-full flex items-center justify-center text-white  font-bold text-lg mx-auto mb-6">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <step.icon className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                  </div>
                  
                  {/* Title */}
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {step.title}
                  </CardTitle>
                  
                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Benefits Badge */}
                  <div className="!mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/30 rounded-full">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">{step.benefits}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Feature List */}
                  <ul className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 text-sm">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center">
          <Button className="mb-4">
            <Rocket className="w-5 h-5" />
            <span>Get Started Now</span>
            <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>No coding required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Free to start</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}