'use client';
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import Hero from '@/components/landing/Hero';
import ProblemStatement from '@/components/landing/ProblemStatement';
import HowItWorks from '@/components/landing/HowItWorks';
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
      <FAQ />
    </main>
    <Footer />
    <LandingPageChatbot />
  </div>
  );
}
