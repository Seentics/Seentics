'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

interface TrackerScriptProps {
  siteId?: string;
  autoLoad?: boolean;
}

export default function TrackerScript({ siteId, autoLoad = true }: TrackerScriptProps) {
  const pathname = usePathname();
  
  // Load tracker on all pages, but extract site ID from website pages
  const isWebsitePage = pathname.startsWith('/websites/');
  // Do not load the global tracker on preview pages; preview has its own isolated loader
  if (pathname.startsWith('/preview')) {
    return null;
  }
  
  // Extract site ID from URL if not provided
  const getSiteId = () => {
    if (siteId) return siteId;
    
    if (isWebsitePage) {
      const match = pathname.match(/\/websites\/([^\/]+)/);
      return match ? match[1] : null;
    }
    
    // For non-website pages, use a default site ID or get from localStorage
    // Check if we're on the client side before accessing localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('seentics_default_site_id') || process.env.NEXT_PUBLIC_DEFAULT_SITE_ID || '';
    }
    
    // Fallback for server-side rendering
    return process.env.NEXT_PUBLIC_DEFAULT_SITE_ID || '';
  };

  const currentSiteId = getSiteId();

  // Don't load if no site ID
  if (!autoLoad || !currentSiteId) {
    return null;
  }

  return (
    <Script
      src="/trackers/tracker.js"
      data-site-id={currentSiteId}
      strategy="afterInteractive"
      onLoad={() => {
        console.log(`Seentics Tracker loaded for site: ${currentSiteId}`);
      }}
      onError={(e) => {
        console.error('Failed to load Seentics Tracker:', e);
      }}
    />
  );
} 