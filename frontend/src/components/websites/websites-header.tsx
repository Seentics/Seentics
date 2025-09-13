'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '../theme-toggle';

interface WebsitesHeaderProps {
  onCreateWebsite: () => void;
}

export function WebsitesHeader({ onCreateWebsite }: WebsitesHeaderProps) {
  return (
    <div className='border-b '>
      <header className="flex items-center justify-between p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Logo size="lg" showText={true} textClassName="font-headline text-2xl font-bold" />
        </Link>

        {/* <nav className="flex items-center gap-4">
          <Link
            href="/websites"
            className="text-sm font-medium text-foreground px-3 py-2 rounded-md bg-muted/50"
          >
            Websites
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
          >
            Docs
          </Link>
          <Link
            href="/demo-upgrade-banners"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
          >
            Demo
          </Link>
        </nav> */}

        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <Button onClick={onCreateWebsite} className="shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add website
          </Button>
        </div>
      </header>
    </div>
  );
}
