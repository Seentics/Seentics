'use client';
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import Hero from '@/components/landing/Hero';
import ProblemStatement from '@/components/landing/ProblemStatement';
import HowItWorks from '@/components/landing/HowItWorks';
import VisualFunnels from '@/components/landing/VisualFunnels';
import Features from '@/components/landing/Features';
import WorkflowExamples from '@/components/landing/WorkflowExamples';
import Developers from '@/components/landing/Developers';
import ResultsShowcase from '@/components/landing/ResultsShowcase';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import { LandingPageChatbot } from '@/components/landing-page-chatbot';
import VideoDemoSection from '@/components/landing/VideoDemoSection';
import WhySeentics from '@/components/landing/WhySeentics';
import ComplianceSection from '@/components/landing/ComplianceSection';
import TrustSection from '@/components/landing/TrustSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
    <LandingHeader />
    <main>
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      {/* <VisualFunnels />
      <WhySeentics />
      <ComplianceSection />
      <TrustSection /> */}
      <Pricing />
      <FAQ />
    </main>
    <Footer />
    <LandingPageChatbot />
  </div>
  );
}
