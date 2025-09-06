'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Database, TrendingUp, Users, Clock, MousePointer, Target, Zap, Globe, BarChart3 } from 'lucide-react';

export const AnalyticsGuide: React.FC = () => {
  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Analytics Calculation Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Our analytics platform uses a hybrid approach combining real-time data for current day and pre-aggregated summaries for historical analysis, similar to Plausible.io.
        </p>
      </div>

      {/* Core Traffic Metrics */}
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <BarChart3 className="h-5 w-5" />
            Core Traffic Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Page Views</span>
                <Badge variant="secondary">Raw Count</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total number of page loads tracked. Each page view is counted when a user visits any page on your site.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="font-medium">Unique Visitors</span>
                <Badge variant="secondary">Deduplicated</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Count of distinct visitors based on anonymous visitor IDs. Each visitor is counted only once per time period.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Sessions</span>
                <Badge variant="secondary">30-min Window</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Group of page views from the same visitor within a 30-minute window. New sessions start after 30 minutes of inactivity. Session duration is capped at 30 minutes for realistic analytics.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-red-500" />
                <span className="font-medium">Bounce Rate</span>
                <Badge variant="secondary">Percentage</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Percentage of sessions with only one page view. Lower bounce rates indicate better engagement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <TrendingUp className="h-5 w-5" />
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Session Duration</span>
                <Badge variant="secondary">Time-based</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average time spent on site per session, calculated from first to last page view within each session.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-green-500" />
                <span className="font-medium">Scroll Depth</span>
                <Badge variant="secondary">Percentage</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average percentage of page content scrolled by visitors. Higher values indicate better content engagement.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Engagement Score</span>
                <Badge variant="secondary">0-100</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Composite score based on session duration, pages per session, scroll depth, and returning visitor rate.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Pages per Session</span>
                <Badge variant="secondary">Average</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average number of pages viewed per session. Higher values indicate better site navigation and content discovery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Architecture */}
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Database className="h-5 w-5" />
            Data Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Real-time Events</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page views, scroll events, and user interactions are captured in real-time and stored in the raw_events table.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Session Tracking</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visitor sessions are automatically grouped and tracked with duration, page count, and engagement metrics.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Daily Aggregation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Historical data is pre-aggregated into daily summaries for fast querying of historical trends.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Hybrid Queries</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current day data comes from real-time events, while historical data comes from pre-aggregated summaries.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Examples */}
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Calculator className="h-5 w-5" />
            Calculation Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">Bounce Rate Calculation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bounce Rate = (Sessions with 1 page view / Total sessions) × 100
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">Session Duration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Duration = Last page view timestamp - First page view timestamp (within same session). Sessions timeout after 30 minutes of inactivity and are capped at 30 minutes for realistic values.
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">Engagement Score</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Score = (Session duration factor + Pages per session factor + Scroll depth factor + Returning visitor factor)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Database className="h-5 w-5" />
            Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">raw_events</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time page views, scroll events, and user interactions with enhanced tracking fields.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">session_tracking</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Session-level metrics including duration, page count, bounce status, and entry/exit pages.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">visitor_profiles</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visitor-level data including visit count, returning status, and favorite pages.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">daily_summaries</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pre-aggregated daily metrics for fast historical data retrieval and trend analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Optimizations */}
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Zap className="h-5 w-5" />
            Performance Optimizations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Batch Processing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Events are processed in batches to optimize database writes and reduce server load.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Hybrid Storage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time data in TimescaleDB for current day, pre-aggregated summaries for historical data.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Indexed Queries</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optimized database indexes on website_id, timestamp, and visitor_id for fast data retrieval.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Data Retention</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Raw events are automatically compressed and archived after 30 days to maintain performance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>This analytics guide helps you understand how your website data is collected, processed, and calculated.</p>
        <p className="mt-1">For technical details, refer to our API documentation and database schema.</p>
      </div>
    </div>
  );
}; 