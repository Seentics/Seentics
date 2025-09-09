'use client';
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import Hero from '@/components/landing/Hero';
import ProblemStatement from '@/components/landing/ProblemStatement';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import { LandingPageChatbot } from '@/components/landing-page-chatbot';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
    <LandingHeader />
    <main>
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      <Pricing />
      <FAQ />
    </main>
    <Footer />
    <LandingPageChatbot />
  </div>
  );
}
