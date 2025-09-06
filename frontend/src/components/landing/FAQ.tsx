import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const faqs = [
  {
    question: "How does Seentics differ from traditional analytics tools?",
    answer:
      "While traditional analytics tools focus on reporting what happened, Seentics goes beyond by automatically taking action based on user behavior. We not only track what users do, but we also engage them with personalized experiences to increase conversions in real-time. Our platform combines analytics, automation, and AI to create a complete conversion optimization solution.",
  },
  {
    question: "Will the tracking script affect my website's performance?",
    answer:
      "No, our tracking script is lightweight and optimized for performance. It loads asynchronously and won't impact your website's speed or user experience. We prioritize performance to ensure your site remains fast. The script is only 15KB gzipped and loads in under 100ms on average.",
  },
  {
    question: "Can I track custom events from my application?",
    answer:
      "Absolutely. Seentics supports comprehensive custom event tracking. You can track any user interaction, form submissions, button clicks, or any other custom events that are important to your business goals. Our API makes it easy to integrate with any framework or technology stack.",
  },
  {
    question: "How does the AI optimization work?",
    answer:
      "Our AI analyzes your website's performance data and automatically suggests optimizations for your workflows, helping you improve conversion rates without manual intervention. It learns from your data to provide increasingly accurate recommendations over time, identifying patterns and opportunities you might miss.",
  },
  {
    question: "Do I own my data?",
    answer:
      "Yes, you own 100% of your data. We provide data export capabilities and ensure your data is secure and private. You can export your data at any time, and we never share your data with third parties. Your data is stored securely with enterprise-grade encryption.",
  },
  {
    question: "How many websites can I track with one account?",
    answer:
      "Our free tier allows you to track up to 3 websites, while premium plans support unlimited websites. Each website gets its own analytics dashboard, workflow automation, and AI insights. You can manage all your websites from a single, unified dashboard.",
  },
  {
    question: "What kind of ROI can I expect from Seentics?",
    answer:
      "Most of our customers see a 20-40% increase in conversion rates within the first 3 months. The ROI comes from automated engagement, personalized experiences, and AI-driven optimizations that convert more visitors into customers. Many businesses see payback within the first month of use.",
  },
  {
    question: "Is Seentics GDPR and CCPA compliant?",
    answer:
      "Yes, Seentics is fully compliant with GDPR (European Union), CCPA (California), and other privacy regulations. We provide built-in cookie consent management, data export/deletion capabilities, and automated data retention policies. Users have full control over their data and can exercise their privacy rights at any time through our comprehensive privacy dashboard.",
  },
  {
    question: "How long does it take to set up and see results?",
    answer:
      "Setup takes just 5 minutes - simply add our tracking code to your website. You'll start seeing real-time analytics immediately. For workflow automation and AI insights, we recommend 2-4 weeks of data collection to provide the most accurate recommendations and optimizations.",
  },
  {
    question: "Can I integrate Seentics with other tools I'm already using?",
    answer:
      "Absolutely! Seentics integrates with popular platforms like Shopify, WordPress, Zapier, and many others. We also provide webhooks and APIs for custom integrations. You can connect your existing tools to create powerful automated workflows that work across your entire tech stack.",
  },
  {
    question: "How do you handle user consent and privacy preferences?",
    answer:
      "We provide granular cookie consent management that allows users to choose which types of tracking they accept (essential, analytics, marketing, preferences). Users can modify their preferences at any time, and we respect their choices across all sessions. Our system automatically adapts tracking based on user consent.",
  },
  {
    question: "What happens to user data over time?",
    answer:
      "We implement automated data retention policies that comply with privacy regulations. Analytics data is retained for 2 years, session data for 1 year, and workflow logs for 6 months. Before deletion, personal identifiers are anonymized to maintain data integrity while ensuring privacy compliance.",
  },
];

export default function FAQ() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 md:mb-20">
          <Badge className="mb-6 px-4 py-2 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            FAQ
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-4">
            Everything you need to know about Seentics and how it can transform your website analytics
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-slate-900 dark:text-white px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed px-6 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}