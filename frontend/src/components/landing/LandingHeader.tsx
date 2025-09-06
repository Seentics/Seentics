'use client';

import Link from 'next/link';
import { Bot, Play, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/stores/useAuthStore';

export default function LandingHeader() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">Seentics</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Documentation</Link>
          <Link href="/contact" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <Link href="/websites">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">Sign In</Button>
              </Link>
              <Link href="/login" className='hidden md:block'>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


