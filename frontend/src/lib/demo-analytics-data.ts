import { 
  DashboardData, 
  RealtimeData, 
  PageStat, 
  ReferrerStat, 
  CountryStat, 
  BrowserStat, 
  DeviceStat, 
  CustomEventsStatsResponse, 
  HourlyStat, 
  DailyStat 
} from './analytics-api';

// =============================================================================
// DEMO DATA GENERATORS
// =============================================================================

// Generate realistic demo data for customer demonstration
export class DemoAnalyticsData {
  private static generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static generateRandomPercentage(): number {
    return Math.random() * 100;
  }

  private static generateDateRange(days: number): string[] {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  // =============================================================================
  // DASHBOARD DATA
  // =============================================================================

  static getDashboardData(websiteId: string, days: number = 7): DashboardData {
    const basePageViews = this.generateRandomNumber(5000, 15000);
    const baseVisitors = Math.floor(basePageViews * 0.6);
    const baseSessions = Math.floor(baseVisitors * 1.2);
    
    return {
      website_id: websiteId,
      date_range: `${days} days`,
      metrics: {
        page_views: basePageViews,
        unique_visitors: baseVisitors,
        sessions: baseSessions,
        bounce_rate: this.generateRandomNumber(35, 65),
        avg_session_time: this.generateRandomNumber(120, 480),
        pages_per_session: this.generateRandomNumber(2, 6),
      },
      enhanced_metrics: {
        new_visitors: Math.floor(baseVisitors * 0.7),
        returning_visitors: Math.floor(baseVisitors * 0.3),
        pages_per_session: this.generateRandomNumber(2, 6),
        avg_time_on_page: this.generateRandomNumber(45, 180),
        engagement_score: this.generateRandomNumber(65, 95),
      },
      utm_performance: {
        sources: [
          { source: 'google', visits: Math.floor(baseVisitors * 0.4), unique_visitors: Math.floor(baseVisitors * 0.4) },
          { source: 'facebook', visits: Math.floor(baseVisitors * 0.25), unique_visitors: Math.floor(baseVisitors * 0.25) },
          { source: 'twitter', visits: Math.floor(baseVisitors * 0.15), unique_visitors: Math.floor(baseVisitors * 0.15) },
          { source: 'linkedin', visits: Math.floor(baseVisitors * 0.1), unique_visitors: Math.floor(baseVisitors * 0.1) },
          { source: 'direct', visits: Math.floor(baseVisitors * 0.1), unique_visitors: Math.floor(baseVisitors * 0.1) },
        ],
      },
      engagement_metrics: {
        avg_scroll_depth: this.generateRandomNumber(40, 85),
        engaged_users: Math.floor(baseVisitors * 0.8),
        exit_intents: Math.floor(baseVisitors * 0.3),
        total_events: basePageViews * 3,
        engagement_rate: this.generateRandomNumber(70, 95),
      },
      performance_metrics: {
        avg_page_load_time: this.generateRandomNumber(800, 2500),
        avg_dom_content_loaded: this.generateRandomNumber(400, 1200),
        slow_pages: this.generateRandomNumber(2, 8),
        device_performance: [
          { device: 'desktop', visits: Math.floor(baseVisitors * 0.6), avg_load_time: this.generateRandomNumber(600, 1800) },
          { device: 'mobile', visits: Math.floor(baseVisitors * 0.35), avg_load_time: this.generateRandomNumber(1200, 3000) },
          { device: 'tablet', visits: Math.floor(baseVisitors * 0.05), avg_load_time: this.generateRandomNumber(800, 2000) },
        ],
      },
    };
  }



  // =============================================================================
  // TOP PAGES DATA
  // =============================================================================

  static getTopPages(websiteId: string, days: number = 7): { website_id: string; date_range: string; top_pages: PageStat[] } {
    const pages = [
      { page: '/', baseViews: 12000, baseUnique: 8000 },
      { page: '/products', baseViews: 8500, baseUnique: 6000 },
      { page: '/about', baseViews: 6500, baseUnique: 4500 },
      { page: '/contact', baseViews: 4500, baseUnique: 3200 },
      { page: '/blog', baseViews: 7800, baseUnique: 5500 },
      { page: '/pricing', baseViews: 3800, baseUnique: 2800 },
      { page: '/features', baseViews: 5200, baseUnique: 3800 },
      { page: '/support', baseViews: 3200, baseUnique: 2400 },
      { page: '/login', baseViews: 2800, baseUnique: 2100 },
      { page: '/signup', baseViews: 2200, baseUnique: 1800 },
    ];

    return {
      website_id: websiteId,
      date_range: `${days} days`,
      top_pages: pages.map((p, index) => ({
        page: p.page,
        views: Math.floor(p.baseViews * (days / 7) * (0.8 + Math.random() * 0.4)),
        unique: Math.floor(p.baseUnique * (days / 7) * (0.8 + Math.random() * 0.4)),
        bounce_rate: this.generateRandomNumber(25, 75),
        avg_time: this.generateRandomNumber(30, 300),
        exit_rate: this.generateRandomNumber(15, 60),
        engagement_rate: this.generateRandomNumber(60, 95),
        scroll_depth: this.generateRandomNumber(30, 90),
        load_time: this.generateRandomNumber(500, 2500),
      })),
    };
  }

  // =============================================================================
  // TOP REFERRERS DATA
  // =============================================================================

  static getTopReferrers(websiteId: string, days: number = 7): { website_id: string; date_range: string; top_referrers: ReferrerStat[] } {
    const referrers = [
      { referrer: 'google.com', baseViews: 8000, baseUnique: 6000 },
      { referrer: 'facebook.com', baseViews: 4500, baseUnique: 3500 },
      { referrer: 'twitter.com', baseViews: 2800, baseUnique: 2200 },
      { referrer: 'linkedin.com', baseViews: 2200, baseUnique: 1800 },
      { referrer: 'reddit.com', baseViews: 1800, baseUnique: 1400 },
      { referrer: 'youtube.com', baseViews: 1500, baseUnique: 1200 },
      { referrer: 'medium.com', baseViews: 1200, baseUnique: 1000 },
      { referrer: 'github.com', baseViews: 1000, baseUnique: 800 },
      { referrer: 'stackoverflow.com', baseViews: 800, baseUnique: 600 },
      { referrer: 'producthunt.com', baseViews: 600, baseUnique: 500 },
    ];

    return {
      website_id: websiteId,
      date_range: `${days} days`,
      top_referrers: referrers.map((r) => ({
        referrer: r.referrer,
        views: Math.floor(r.baseViews * (days / 7) * (0.8 + Math.random() * 0.4)),
        unique: Math.floor(r.baseUnique * (days / 7) * (0.8 + Math.random() * 0.4)),
        bounce_rate: this.generateRandomNumber(30, 80),
      })),
    };
  }

  // =============================================================================
  // TOP COUNTRIES DATA
  // =============================================================================

  static getTopCountries(websiteId: string, days: number = 7): { website_id: string; date_range: string; top_countries: CountryStat[] } {
    const countries = [
      { country: 'Bangladesh', baseViews: 15000, baseUnique: 10000 },
      { country: 'United States', baseViews: 8000, baseUnique: 5500 },
      { country: 'India', baseViews: 7000, baseUnique: 4800 },
      { country: 'United Kingdom', baseViews: 5500, baseUnique: 3800 },
      { country: 'Germany', baseViews: 4800, baseUnique: 3200 },
      { country: 'Australia', baseViews: 4200, baseUnique: 2800 },
      { country: 'France', baseViews: 3800, baseUnique: 2500 },
      { country: 'Netherlands', baseViews: 3200, baseUnique: 2200 },
      { country: 'Japan', baseViews: 2800, baseUnique: 1900 },
      { country: 'Brazil', baseViews: 2500, baseUnique: 1700 },
    ];

    return {
      website_id: websiteId,
      date_range: `${days} days`,
      top_countries: countries.map((c) => ({
        country: c.country,
        views: Math.floor(c.baseViews * (days / 7) * (0.8 + Math.random() * 0.4)),
        unique: Math.floor(c.baseUnique * (days / 7) * (0.8 + Math.random() * 0.4)),
        bounce_rate: this.generateRandomNumber(25, 75),
      })),
    };
  }

  // =============================================================================
  // TOP BROWSERS DATA
  // =============================================================================

  static getTopBrowsers(websiteId: string, days: number = 7): { website_id: string; date_range: string; top_browsers: BrowserStat[] } {
    const browsers = [
      { browser: 'Chrome', baseViews: 18000, baseUnique: 12000 },
      { browser: 'Safari', baseViews: 12000, baseUnique: 8000 },
      { browser: 'Firefox', baseViews: 8000, baseUnique: 5500 },
      { browser: 'Edge', baseViews: 6000, baseUnique: 4000 },
      { browser: 'Opera', baseViews: 2000, baseUnique: 1500 },
      { browser: 'Brave', baseViews: 1500, baseUnique: 1000 },
      { browser: 'Internet Explorer', baseViews: 500, baseUnique: 300 },
    ];

    return {
      website_id: websiteId,
      date_range: `${days} days`,
      top_browsers: browsers.map((b) => ({
        browser: b.browser,
        views: Math.floor(b.baseViews * (days / 7) * (0.8 + Math.random() * 0.4)),
        unique: Math.floor(b.baseUnique * (days / 7) * (0.8 + Math.random() * 0.4)),
        bounce_rate: this.generateRandomNumber(25, 75),
      })),
    };
  }

  // =============================================================================
  // TOP DEVICES DATA
  // =============================================================================

  static getTopDevices(websiteId: string, days: number = 7): { website_id: string; date_range: string; top_devices: DeviceStat[] } {
    const devices = [
      { device: 'desktop', baseViews: 25000, baseUnique: 16000 },
      { device: 'mobile', baseViews: 15000, baseUnique: 10000 },
      { device: 'tablet', baseViews: 3000, baseUnique: 2000 },
    ];

    return {
      website_id: websiteId,
      date_range: `${days} days`,
      top_devices: devices.map((d) => ({
        device: d.device,
        views: Math.floor(d.baseViews * (days / 7) * (0.8 + Math.random() * 0.4)),
        unique: Math.floor(d.baseUnique * (days / 7) * (0.8 + Math.random() * 0.4)),
        bounce_rate: this.generateRandomNumber(25, 75),
      })),
    };
  }

  // =============================================================================
  // DAILY STATS DATA
  // =============================================================================

  static getDailyStats(websiteId: string, days: number = 30): { website_id: string; date_range: string; daily_stats: DailyStat[] } {
    const dates = this.generateDateRange(days);
    const baseViews = this.generateRandomNumber(800, 1200);
    const baseUnique = Math.floor(baseViews * 0.7);

    return {
      website_id: websiteId,
      date_range: `${days} days`,
      daily_stats: dates.map((date, index) => {
        // Add some realistic variation and trends
        const dayVariation = 0.7 + Math.random() * 0.6; // 70% to 130% of base
        const weekendFactor = [6, 0].includes(new Date(date).getDay()) ? 0.8 : 1.1; // Weekends have less traffic
        
        return {
          date,
          views: Math.floor(baseViews * dayVariation * weekendFactor),
          unique: Math.floor(baseUnique * dayVariation * weekendFactor),
        };
      }),
    };
  }

  // =============================================================================
  // HOURLY STATS DATA
  // =============================================================================

  static getHourlyStats(websiteId: string, days: number = 1): { website_id: string; date_range: string; hourly_stats: HourlyStat[] } {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const baseViews = this.generateRandomNumber(50, 150);
    const baseUnique = Math.floor(baseViews * 0.7);

    return {
      website_id: websiteId,
      date_range: `${days} days`,
      hourly_stats: hours.map((hour) => {
        // Business hours have more traffic
        const businessHourFactor = (hour >= 9 && hour <= 17) ? 1.5 : 0.6;
        const hourVariation = 0.8 + Math.random() * 0.4;
        
        return {
          hour,
          views: Math.floor(baseViews * businessHourFactor * hourVariation),
          unique: Math.floor(baseUnique * businessHourFactor * hourVariation),
        };
      }),
    };
  }

  // =============================================================================
  // CUSTOM EVENTS DATA
  // =============================================================================

  static getCustomEvents(websiteId: string, days: number = 30): CustomEventsStatsResponse {
    const dates = this.generateDateRange(days);
    const baseEvents = this.generateRandomNumber(200, 500);

    return {
      website_id: websiteId,
      date_range: `${days} days`,
      timeseries: dates.map((date) => ({
        date,
        count: Math.floor(baseEvents * (0.6 + Math.random() * 0.8)),
      })),
      top_events: [
        { 
          event_type: 'conversion_click', 
          count: this.generateRandomNumber(800, 1500),
          description: 'High-value user interactions and conversions',
          common_properties: ['element_type', 'element_text', 'element_id', 'page', 'position'],
          sample_properties: {
            element_text: "Seentics\nDashboard\nAnalytics\nWorkflows",
            element_type: "button",
            element_id: "cta-button",
            element_class: "btn-primary",
            href: "/dashboard",
            position: "header",
            page: "/home"
          }
        },
        { 
          event_type: 'form_submit', 
          count: this.generateRandomNumber(400, 800),
          description: 'Form submissions and user input',
          common_properties: ['form_action', 'form_method', 'form_id', 'field_count', 'page'],
          sample_properties: {
            form_action: "http://localhost:3000/websites/68b5a69b97e5640cc838e908/support",
            form_method: "post",
            form_id: "contact-form",
            form_class: "contact-form",
            field_count: 5,
            page: "/contact"
          }
        },
        { 
          event_type: 'page_visible', 
          count: this.generateRandomNumber(300, 600),
          description: 'Page visibility tracking for engagement',
          common_properties: ['page', 'time_on_page', 'scroll_depth', 'device'],
          sample_properties: {
            page: "/dashboard",
            time_on_page: 45,
            scroll_depth: 75,
            device: "desktop",
            viewport_width: 1920,
            viewport_height: 1080
          }
        },
        { 
          event_type: 'exit_intent', 
          count: this.generateRandomNumber(200, 400),
          description: 'User exit intent detection',
          common_properties: ['mouse_position', 'trigger', 'page', 'time_on_page'],
          sample_properties: {
            mouse_position: "top",
            trigger: "mouse_leave",
            page: "/pricing",
            time_on_page: 120,
            scroll_depth: 60
          }
        },
        { 
          event_type: 'scroll_depth', 
          count: this.generateRandomNumber(1500, 2500),
          description: 'User scroll behavior tracking',
          common_properties: ['scroll_percentage', 'page', 'time_on_page', 'device'],
          sample_properties: {
            scroll_percentage: 85,
            page: "/features",
            time_on_page: 180,
            device: "mobile",
            scroll_direction: "down"
          }
        },
        { 
          event_type: 'video_play', 
          count: this.generateRandomNumber(300, 600),
          description: 'Video engagement tracking',
          common_properties: ['video_id', 'video_title', 'playback_time', 'page'],
          sample_properties: {
            video_id: "intro-video",
            video_title: "Product Introduction",
            playback_time: 30,
            page: "/demo",
            video_duration: 120
          }
        },
        { 
          event_type: 'download', 
          count: this.generateRandomNumber(200, 400),
          description: 'File download tracking',
          common_properties: ['file_name', 'file_type', 'file_size', 'page'],
          sample_properties: {
            file_name: "seentics-guide.pdf",
            file_type: "pdf",
            file_size: "2.5MB",
            page: "/resources",
            download_source: "button"
          }
        },
        { 
          event_type: 'social_share', 
          count: this.generateRandomNumber(80, 200),
          description: 'Social media sharing tracking',
          common_properties: ['platform', 'content_type', 'page', 'share_method'],
          sample_properties: {
            platform: "twitter",
            content_type: "article",
            page: "/blog/analytics-guide",
            share_method: "button",
            content_title: "Analytics Guide"
          }
        },
        { 
          event_type: 'newsletter_signup', 
          count: this.generateRandomNumber(120, 250),
          description: 'Newsletter subscription tracking',
          common_properties: ['email_domain', 'signup_source', 'page', 'campaign'],
          sample_properties: {
            email_domain: "gmail.com",
            signup_source: "footer",
            page: "/home",
            campaign: "winter-2024",
            referrer: "google"
          }
        },
      ],
    };
  }
}

// =============================================================================
// DEMO HOOKS (REPLACEMENT FOR REAL API HOOKS)
// =============================================================================

export const useDemoDashboardData = (websiteId: string, days: number = 7) => {
  return {
    data: DemoAnalyticsData.getDashboardData(websiteId, days),
    isLoading: false,
    error: null,
  };
};



export const useDemoTopPages = (websiteId: string, days: number = 7) => {
  return {
    data: DemoAnalyticsData.getTopPages(websiteId, days),
    isLoading: false,
    error: null,
  };
};

export const useDemoTopReferrers = (websiteId: string, days: number = 7) => {
  return {
    data: DemoAnalyticsData.getTopReferrers(websiteId, days),
    isLoading: false,
    error: null,
  };
};

export const useDemoTopCountries = (websiteId: string, days: number = 7) => {
  return {
    data: DemoAnalyticsData.getTopCountries(websiteId, days),
    isLoading: false,
    error: null,
  };
};

export const useDemoTopBrowsers = (websiteId: string, days: number = 7) => {
  return {
    data: DemoAnalyticsData.getTopBrowsers(websiteId, days),
    isLoading: false,
    error: null,
  };
};

export const useDemoTopDevices = (websiteId: string, days: number = 7) => {
  return {
    data: DemoAnalyticsData.getTopDevices(websiteId, days),
    isLoading: false,
    error: null,
  };
};

export const useDemoDailyStats = (websiteId: string, days: number = 30) => {
  return {
    data: DemoAnalyticsData.getDailyStats(websiteId, days),
    isLoading: false,
    error: null,
  };
};

export const useDemoCustomEvents = (websiteId: string, days: number = 30) => {
  return {
    data: DemoAnalyticsData.getCustomEvents(websiteId, days),
    isLoading: false,
    error: null,
  };
};

export const useDemoHourlyStats = (websiteId: string, days: number = 1) => {
  return {
    data: DemoAnalyticsData.getHourlyStats(websiteId, days),
    isLoading: false,
    error: null,
  };
};
