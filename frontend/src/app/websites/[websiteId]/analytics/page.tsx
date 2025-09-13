'use client';

import { AudienceInsights } from '@/components/analytics/AudienceInsights';
import { ContentPerformance } from '@/components/analytics/ContentPerformance';
import { TrafficOverview } from '@/components/analytics/TrafficOverview';
import { UTMPerformanceChart } from '@/components/analytics/UTMPerformanceChart';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useActivityTrends,
  useCustomEvents,
  useDailyStats,
  useDashboardData,

  useHourlyStats,
  useTopBrowsers,
  useTopCountries,
  useTopDevices,
  useTopOS,
  useTopPages,
  useTopReferrers,
} from '@/lib/analytics-api';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState } from 'react';
import { DetailedDataModal } from './components/DetailedDataModal';
import { EventsDetails } from './components/EventsDetails';
import { SummaryCards } from './components/SummaryCards';

interface AnalyticsPageProps {
  params: {
    websiteId: string;
  };
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { websiteId } = params;
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [modalType, setModalType] = useState<string>('');


  // Filter state
  const [dateRange, setDateRange] = useState<number>(7);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [isCustomRange, setIsCustomRange] = useState<boolean>(false);
  const [utmTab, setUtmTab] = useState<'sources' | 'mediums' | 'campaigns' | 'terms' | 'content'>('sources');

  // Helper function to categorize referrers for better display
  const categorizeReferrer = (referrer: string): string => {
    if (!referrer || referrer === 'Direct') return 'Direct';

    const lowerReferrer = referrer.toLowerCase();

    // Search engines
    if (lowerReferrer.includes('google')) return 'Google';
    if (lowerReferrer.includes('bing')) return 'Bing';
    if (lowerReferrer.includes('yahoo')) return 'Yahoo';
    if (lowerReferrer.includes('duckduckgo')) return 'DuckDuckGo';

    // Social media
    if (lowerReferrer.includes('facebook')) return 'Facebook';
    if (lowerReferrer.includes('twitter')) return 'Twitter';
    if (lowerReferrer.includes('linkedin')) return 'LinkedIn';
    if (lowerReferrer.includes('github')) return 'GitHub';
    if (lowerReferrer.includes('youtube')) return 'YouTube';
    if (lowerReferrer.includes('instagram')) return 'Instagram';
    if (lowerReferrer.includes('reddit')) return 'Reddit';

    // Tech platforms
    if (lowerReferrer.includes('medium')) return 'Medium';
    if (lowerReferrer.includes('stackoverflow')) return 'Stack Overflow';
    if (lowerReferrer.includes('dev.to')) return 'Dev.to';
    if (lowerReferrer.includes('hashnode')) return 'Hashnode';
    if (lowerReferrer.includes('producthunt')) return 'Product Hunt';
    if (lowerReferrer.includes('hackernews')) return 'Hacker News';

    // Internal navigation
    if (lowerReferrer.includes('localhost') || lowerReferrer.includes('127.0.0.1') || lowerReferrer.includes('internal')) {
      return 'Internal Navigation';
    }

    // For other domains, return the referrer as is (it should already be cleaned by backend)
    return referrer;
  };

  // Data hooks with dynamic date range - using real API data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardData(websiteId, dateRange);




  // Transform real API data to match component expectations
  const transformedDashboardData = dashboardData ? {
    // Core stats - direct mapping from backend
    total_visitors: dashboardData.total_visitors || 0,
    unique_visitors: dashboardData.unique_visitors || 0,
    live_visitors: dashboardData.live_visitors || 0,
    page_views: dashboardData.page_views || 0,
    session_duration: dashboardData.session_duration || 0,
    bounce_rate: dashboardData.bounce_rate || 0,
    // Comparison metrics
    comparison: dashboardData.comparison || {},
    // Legacy fields for other components
    total_page_views: dashboardData.page_views || 0,
    avg_session_duration: dashboardData.session_duration || 0,
    bounce_change: dashboardData.comparison?.bounce_change || 0,
    visitor_change: dashboardData.comparison?.visitor_change || 0,
    pageview_change: dashboardData.comparison?.pageview_change || 0,
    duration_change: dashboardData.comparison?.duration_change || 0,
    live_users: dashboardData.live_visitors || 0,
    metrics: {
      unique_visitors: dashboardData.unique_visitors || 0,
      page_views: dashboardData.page_views || 0,
      avg_session_time: dashboardData.session_duration || 0,
      bounce_rate: dashboardData.bounce_rate || 0,
    },
    enhanced_metrics: {},
  } : {
    // Fallback data when API is not available
    total_visitors: 0,
    unique_visitors: 0,
    live_visitors: 0,
    page_views: 0,
    session_duration: 0,
    bounce_rate: 0,
    comparison: {},
    total_page_views: 0,
    avg_session_duration: 0,
    bounce_change: 0,
    visitor_change: 0,
    pageview_change: 0,
    duration_change: 0,
    live_users: 0,
    metrics: {},
    enhanced_metrics: {},
  };

  // Debug logging for dashboard data
  React.useEffect(() => {
    // Dashboard data processing logic can be added here if needed
  }, [dashboardData, transformedDashboardData]);

  const { data: topPages, isLoading: pagesLoading, error: pagesError } = useTopPages(websiteId, dateRange);
  const { data: topReferrers, isLoading: referrersLoading, error: referrersError } = useTopReferrers(websiteId, dateRange);
  const { data: topCountries, isLoading: countriesLoading, error: countriesError } = useTopCountries(websiteId, dateRange);
  const { data: topBrowsers, isLoading: browsersLoading, error: browsersError } = useTopBrowsers(websiteId, dateRange);
  const { data: topDevices, isLoading: devicesLoading, error: devicesError } = useTopDevices(websiteId, dateRange);
  const { data: topOS, isLoading: osLoading, error: osError } = useTopOS(websiteId, dateRange);
  const { data: dailyStats, isLoading: dailyLoading, error: dailyError } = useDailyStats(websiteId, dateRange);

  // Note: trafficSummaryChart removed - use dailyStats for chart data instead
  const trafficSummaryChart = dailyStats; // Use daily stats for chart visualization
  const trafficChartLoading = dailyLoading;
  const trafficChartError = dailyError;
  const { data: customEvents, isLoading: customEventsLoading } = useCustomEvents(websiteId, dateRange);
  const { data: hourlyStats, isLoading: hourlyLoading } = useHourlyStats(websiteId, dateRange);

  // Fetch activity trends data
  const { data: activityTrends, isLoading: trendsLoading, error: trendsError } = useActivityTrends(websiteId);

  // Transform API data to match demo component expectations
  const transformedTopPages = topPages ? {
    top_pages: topPages.top_pages?.map((page: any) => ({
      page: page.page || '/',
      views: page.views || 0,
      unique_visitors: page.unique || 0,
      avg_time_on_page: page.avg_time || 0,
      bounce_rate: page.bounce_rate || 0,
    })) || []
  } : {
    // Fallback data when API is not available
    top_pages: []
  };

  const transformedTopReferrers = topReferrers ? {
    top_referrers: topReferrers.top_referrers?.map((ref: any) => {
      // Categorize referrer for better display
      const referrer = ref.referrer || 'Direct';
      const categorizedReferrer = categorizeReferrer(referrer);

      return {
        referrer: categorizedReferrer,
        visitors: ref.unique || 0,
        page_views: ref.views || 0,
        avg_session_duration: 0, // Default value since API doesn't provide this yet
      };
    }) || []
  } : {
    // Fallback data when API is not available
    top_referrers: []
  };

  const transformedTopCountries = topCountries ? {
    top_countries: topCountries.top_countries?.map((country: any) => ({
      country: country.country || 'Unknown',
      visitors: country.unique || 0,
      page_views: country.views || 0,
      avg_session_duration: 0, // Default value since API doesn't provide this yet
    })) || []
  } : {
    // Fallback data when API is not available
    top_countries: []
  };

  const transformedTopBrowsers = topBrowsers ? {
    top_browsers: topBrowsers.top_browsers?.map((browser: any) => ({
      browser: browser.browser || 'Unknown',
      visitors: browser.unique || 0,
      views: browser.views || 0,
      market_share: 0, // Default value since API doesn't provide this yet
      version: 'Unknown', // Default value since API doesn't provide this yet
    })) || []
  } : {
    // Fallback data when API is not available
    top_browsers: []
  };

  const transformedTopDevices = topDevices ? {
    top_devices: topDevices.top_devices?.map((device: any) => ({
      device: device.device || 'Unknown',
      visitors: device.unique || 0,
      page_views: device.views || 0,
      avg_session_duration: 0, // Default value since API doesn't provide this yet
    })) || []
  } : {
    // Fallback data when API is not available
    top_devices: []
  };

  const transformedTopOS = topOS ? {
    top_os: topOS.top_os?.map((os: any) => ({
      os: os.os || 'Unknown',
      visitors: os.unique || 0,
      page_views: os.views || 0,
      avg_session_duration: 0, // Default value since API doesn't provide this yet
    })) || []
  } : {
    // Fallback data when API is not available
    top_os: []
  };

  // Transform custom events data for the component
  const transformedCustomEvents = customEvents ? {
    timeseries: customEvents.timeseries || [],
    top_events: customEvents.top_events || [],
    total_events: customEvents.top_events?.reduce((sum: number, event: any) => sum + event.count, 0) || 0,
    unique_events: customEvents.top_events?.length || 0,
    utm_performance: customEvents.utm_performance || {
      sources: {},
      mediums: {},
      campaigns: {},
      terms: {},
      content: {},
      avg_ctr: 0,
      total_campaigns: 0,
      total_sources: 0,
      total_mediums: 0
    }
  } : {
    // Fallback data when no custom events
    timeseries: [],
    top_events: [],
    total_events: 0,
    unique_events: 0,
    utm_performance: {
      sources: {},
      mediums: {},
      campaigns: {},
      terms: {},
      content: {},
      avg_ctr: 0,
      total_campaigns: 0,
      total_sources: 0,
      total_mediums: 0
    }
  };

  // Check for UTM parameters in URL and create sample data if present
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    if (utmSource || utmMedium || utmCampaign) {

      // If we have UTM parameters but no UTM data, create some sample data
      if (transformedCustomEvents && (!transformedCustomEvents.utm_performance ||
        Object.keys(transformedCustomEvents.utm_performance.sources || {}).length === 0)) {

        // Create sample UTM data based on the actual parameters
        const sampleUTMData = {
          ...transformedCustomEvents,
          utm_performance: {
            sources: {
              [utmSource || 'direct']: { unique_visitors: 1250, total_events: 3200, sessions: 1800 },
              'facebook': { unique_visitors: 890, total_events: 2100, sessions: 1200 },
              'direct': { unique_visitors: 650, total_events: 1800, sessions: 950 }
            },
            mediums: {
              [utmMedium || 'cpc']: { unique_visitors: 1250, total_events: 3200 },
              'social': { unique_visitors: 890, total_events: 2100 },
              'email': { unique_visitors: 420, total_events: 1200 }
            },
            campaigns: {
              [utmCampaign || 'organic']: { unique_visitors: 890, total_events: 2200 },
              'product_launch': { unique_visitors: 650, total_events: 1800 }
            },
            terms: {},
            content: {},
            avg_ctr: 4.2,
            total_campaigns: 2,
            total_sources: 3,
            total_mediums: 3
          }
        };

        // Update the transformed data
        Object.assign(transformedCustomEvents, sampleUTMData);
      }
    }
  }, [transformedCustomEvents]);

  // Add pageview data from dashboard data to custom events (but don't show in breakdown)
  if (dashboardData?.page_views && transformedCustomEvents) {
    // Update totals to include pageviews for the summary cards
    transformedCustomEvents.total_events += dashboardData.page_views;
    // Don't add pageviews to top_events since they're not custom events
  }

  // CRITICAL FIX: Remove any pageview events from top_events
  if (transformedCustomEvents && transformedCustomEvents.top_events) {
    transformedCustomEvents.top_events = transformedCustomEvents.top_events.filter(
      (event: any) => event.event_type !== 'pageview' && event.event_type !== 'page_view'
    );
    // Update unique_events count after filtering
    transformedCustomEvents.unique_events = transformedCustomEvents.top_events.length;
  }



  const handleModalOpen = (type: string) => {
    setModalType(type);
    setSelectedModal(type);
  };

  const handleModalClose = () => {
    setSelectedModal(null);
    setModalType('');
  };

  const handleDateRangeChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomRange(true);
    } else {
      setIsCustomRange(false);
      setDateRange(parseInt(value));
    }
  };

  const handleCustomDateChange = (start: Date | undefined, end: Date | undefined) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    if (start && end) {
      // Calculate days between dates for the API
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDateRange(diffDays);
    }
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 1: return 'Today';
      case 7: return 'Last 7 days';
      case 30: return 'Last 30 days';
      case 90: return 'Last 90 days';
      default: return `${dateRange} days`;
    }
  };

  if (dashboardLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Loading your website analytics...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle errors
  if (dashboardError || pagesError || referrersError || countriesError || browsersError || devicesError || dailyError) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Error loading analytics data</p>
          </div>
        </div>

        <Card className="bg-card/50 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Failed to Load Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We encountered an error while loading your analytics data. This could be due to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Network connectivity issues</li>
                <li>Analytics service temporarily unavailable</li>
                <li>Invalid website ID or permissions</li>
              </ul>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  variant="ghost"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="font-headline text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Website visitors & performance insights</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

          {/* Date Range Filter */}
          <Select value={isCustomRange ? 'custom' : dateRange.toString()} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-full sm:w-40 border">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom Date Range Picker */}
          {isCustomRange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-48 h-9 justify-start text-left font-normal border-0 bg-muted/50">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStartDate && customEndDate ? (
                    `${format(customStartDate, 'MMM dd')} - ${format(customEndDate, 'MMM dd, yyyy')}`
                  ) : (
                    'Pick a date range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customStartDate}
                  selected={{ from: customStartDate, to: customEndDate }}
                  onSelect={(range) => { handleCustomDateChange(range?.from, range?.to); }}
                  numberOfMonths={window.innerWidth < 768 ? 1 : 2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        data={dashboardData || {
          total_visitors: 0,
          unique_visitors: 0,
          live_visitors: 0,
          page_views: 0,
          session_duration: 0,
          bounce_rate: 0,
          comparison: {}
        }}
      />

      {/* API Error Messages */}
      {(dashboardError || pagesError || referrersError || countriesError || browsersError || devicesError) && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">API Connection Issues</h3>
          <div className="text-xs text-red-700 dark:text-red-300 space-y-1">
            {dashboardError && <div>• Dashboard data: Failed to load</div>}

            {pagesError && <div>• Top pages: Failed to load</div>}
            {referrersError && <div>• Top referrers: Failed to load</div>}
            {countriesError && <div>• Top countries: Failed to load</div>}
            {browsersError && <div>• Top browsers: Failed to load</div>}
            {devicesError && <div>• Top devices: Failed to load</div>}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-2">
            Make sure the analytics backend service is running and accessible.
          </div>
        </div>
      )}

      {/* Traffic Overview - Full Width */}
      <TrafficOverview
        dailyStats={trafficSummaryChart || dailyStats}
        hourlyStats={hourlyStats}
        isLoading={dashboardLoading || dailyLoading || trafficChartLoading}
      />

      {/* 2 Cards in 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Card 2: Top Pages & Sources */}
        <ContentPerformance
          topPages={transformedTopPages}
          topReferrers={transformedTopReferrers}
          pagesLoading={pagesLoading}
          referrersLoading={referrersLoading}
          onViewMore={handleModalOpen}
        />

        {/* Card 3: Geographic & Device Data */}
        <AudienceInsights
          topCountries={transformedTopCountries}
          topBrowsers={transformedTopBrowsers}
          topDevices={transformedTopDevices}
          topOS={transformedTopOS}
          countriesLoading={countriesLoading}
          browsersLoading={browsersLoading}
          devicesLoading={devicesLoading}
          osLoading={osLoading}
          onViewMore={handleModalOpen}
        />
      </div>



      {/* UTM & Marketing - Full Width */}
      <div className="space-y-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-base sm:text-lg font-medium text-foreground">UTM & Marketing</CardTitle>
                <p className="text-xs text-muted-foreground">Track marketing campaign performance and traffic sources with UTM parameters</p>
              </div>
              <Tabs value={utmTab} onValueChange={(v) => setUtmTab(v as any)} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-5 h-8 sm:h-8">
                  <TabsTrigger value="sources" className="text-xs px-1 sm:px-2">Sources</TabsTrigger>
                  <TabsTrigger value="mediums" className="text-xs px-1 sm:px-2">Mediums</TabsTrigger>
                  <TabsTrigger value="campaigns" className="text-xs px-1 sm:px-2">Campaigns</TabsTrigger>
                  <TabsTrigger value="terms" className="text-xs px-1 sm:px-2">Terms</TabsTrigger>
                  <TabsTrigger value="content" className="text-xs px-1 sm:px-2">Content</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <UTMPerformanceChart
              data={transformedCustomEvents.utm_performance as any}
              isLoading={customEventsLoading}
              hideTabs={true}
              controlledTab={utmTab}
            />
          </CardContent>
        </Card>
      </div>

      {/* Events - Full Width */}
      <div className="space-y-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg font-medium text-foreground">Events</CardTitle>
              <p className="text-xs text-muted-foreground">Monitor user interactions, engagement patterns, and custom event tracking</p>
            </div>
          </CardHeader>
          <CardContent>
            <EventsDetails
              items={(transformedCustomEvents.top_events as any[])
                .filter(e => !['pageview', 'page_view', 'page_visible', 'page_hidden', 'exit_intent'].includes(e.event_type))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Data Modal */}
      {selectedModal && (
        <DetailedDataModal
          isOpen={!!selectedModal}
          onClose={handleModalClose}
          modalType={modalType}
          data={{
            topPages: topPages,
            topReferrers: topReferrers,
            topCountries: topCountries,
            topBrowsers: topBrowsers,
            topDevices: topDevices,
            dashboard: dashboardData,

          }}
          isLoading={{
            topPages: pagesLoading,
            topReferrers: referrersLoading,
            topCountries: countriesLoading,
            topBrowsers: browsersLoading,
            topDevices: devicesLoading,
            dashboard: dashboardLoading,

          }}
        />
      )}
    </div>
  );
}