
import type { Metadata } from 'next';
import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';

import { LemonSqueezyProvider } from '@/components/lemonsqueezy-provider';
import { Toaster } from '@/components/ui/toaster';
import TrackerScript from '@/components/tracker-script';
import AuthInitializer from '@/components/auth-initializer';
import CookieConsentManager from '@/components/cookie-consent-manager';
// import { Toaster } from "@/components/ui/sonner"

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Seentics',
  description: 'Build smart website workflows that automatically respond to user behavior - no coding required.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('antialiased font-body', fontBody.variable, fontHeadline.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >

          <QueryProvider>
              {children}
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
        <LemonSqueezyProvider />
        
        {/* Initialize authentication state */}
        <AuthInitializer />
        
        {/* Load the Seentics tracker script */}
        <TrackerScript />
        
        {/* Cookie Consent Manager */}
        <CookieConsentManager />
      </body>
    </html>
  );
}
