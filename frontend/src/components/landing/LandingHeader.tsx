'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/stores/useAuthStore';
import { Bot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingHeader() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="relative">
            <Image src={'/logo.png'} width={60} height={60} alt='logo'/>
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
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup" className='hidden md:block'>
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


