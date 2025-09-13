'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { useState } from 'react';
import { TopPagesChart } from './TopPagesChart';
import TopSourcesChart from './TopSourcesChart';

interface PageStat {
  page_url: string;
  views: number;
  unique_visitors: number;
  avg_time_on_page: number;
  bounce_rate: number;
}

interface ReferrerStat {
  referrer: string;
  visitors: number;
  page_views: number;
  avg_session_duration: number;
}

interface TopPages {
  top_pages: PageStat[];
}

interface TopReferrers {
  top_referrers: ReferrerStat[];
}

interface ContentPerformanceProps {
  topPages?: TopPages | any; // Accept both real and demo data
  topReferrers?: TopReferrers | any; // Accept both real and demo data
  pagesLoading?: boolean;
  referrersLoading?: boolean;
  isDemo?: boolean;
  onViewMore?: (type: string) => void;
  className?: string;
}

export function ContentPerformance({
  topPages,
  topReferrers,
  pagesLoading = false,
  referrersLoading = false,
  isDemo = false,
  onViewMore,
  className = ''
}: ContentPerformanceProps) {
  const [contentTab, setContentTab] = useState<string>('pages');

  // Helper function to get appropriate image for referrer
  const getReferrerImage = (referrer: string) => {
    const lowerReferrer = referrer.toLowerCase();

    if (lowerReferrer.includes('google')) return '/images/search.png';
    if (lowerReferrer.includes('facebook')) return '/images/facebook.png';
    if (lowerReferrer.includes('twitter')) return '/images/twitter.png';
    if (lowerReferrer.includes('instagram')) return '/images/instagram.png';
    if (lowerReferrer.includes('linkedin')) return '/images/linkedin.png';
    if (lowerReferrer.includes('youtube')) return '/images/search.png';
    if (lowerReferrer.includes('tiktok')) return '/images/tiktok.png';
    if (lowerReferrer.includes('pinterest')) return '/images/pinterest.png';
    if (lowerReferrer.includes('whatsapp')) return '/images/whatsapp.png';
    if (lowerReferrer.includes('telegram')) return '/images/telegram.png';

    return '/images/link.png';
  };

  return (
    <Card className={`bg-card border-0 shadow-sm ${className}`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base sm:text-lg font-medium text-foreground">Content Performance</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Top performing pages and traffic sources</p>
        </div>
        <Tabs value={contentTab} onValueChange={setContentTab} className="w-full sm:w-auto flex-shrink-0">
          <TabsList className="grid w-full grid-cols-3 h-9 sm:h-8 gap-1">
            <TabsTrigger value="pages" className="text-xs px-1 sm:px-2 md:px-3 truncate">Top Pages</TabsTrigger>
            <TabsTrigger value="sources" className="text-xs px-1 sm:px-2 md:px-3 truncate">Top Sources</TabsTrigger>
            <TabsTrigger value="referrers" className="text-xs px-1 sm:px-2 md:px-3 truncate">Referrers</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="">
        <div className="mt-0 max-h-[32rem] overflow-y-auto">
          {contentTab === 'pages' && (
            <TopPagesChart
              data={topPages}
              isLoading={pagesLoading}
              onViewMore={() => onViewMore?.('pages')}
            />
          )}
          {contentTab === 'sources' && (
            <TopSourcesChart
              data={topReferrers}
              isLoading={referrersLoading}
              onViewMore={() => onViewMore?.('sources')}
            />
          )}
          {contentTab === 'referrers' && (
            <div className="space-y-3">
              {topReferrers?.top_referrers && topReferrers.top_referrers.length > 0 ? (
                topReferrers.top_referrers.map((ref: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 overflow-hidden">
                        <Image
                          src={getReferrerImage(ref.referrer)}
                          alt={ref.referrer}
                          width={24}
                          height={24}
                          className="object-contain"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-lg text-blue-700">🔗</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{ref.referrer}</div>
                        <div className="text-xs text-muted-foreground">{(ref.visitors || 0).toLocaleString()} visitors</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {(ref.page_views || 0).toLocaleString()} page views
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-sm">No referrer data available</div>
                  <div className="text-xs">Referrer data will appear here once visitors start coming to your site</div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
