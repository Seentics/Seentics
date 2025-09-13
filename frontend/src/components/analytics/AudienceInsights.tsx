'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { useState } from 'react';
import { TopBrowsersChart } from './TopBrowsersChart';
import TopCountriesChart from './TopCountriesChart';
import TopDevicesChart from './TopDevicesChart';


interface CountryStat {
  country: string;
  visitors: number;
  page_views: number;
  avg_session_duration: number;
}

interface BrowserStat {
  browser: string;
  visitors: number;
  market_share: number;
  version: string;
}

interface DeviceStat {
  device: string;
  visitors: number;
  page_views: number;
  avg_session_duration: number;
}

interface TopCountries {
  top_countries: CountryStat[];
}

interface TopBrowsers {
  top_browsers: BrowserStat[];
}

interface TopDevices {
  top_devices: DeviceStat[];
}

interface OSStat {
  os: string;
  visitors: number;
  page_views: number;
  avg_session_duration: number;
}

interface TopOS {
  top_os: OSStat[];
}

interface AudienceInsightsProps {
  topCountries?: TopCountries | any; // Accept both real and demo data
  topBrowsers?: TopBrowsers | any; // Accept both real and demo data
  topDevices?: TopDevices | any; // Accept both real and demo data
  topOS?: TopOS | any; // Accept both real and demo data
  countriesLoading?: boolean;
  browsersLoading?: boolean;
  devicesLoading?: boolean;
  osLoading?: boolean;
  isDemo?: boolean;
  onViewMore?: (type: string) => void;
  className?: string;
}

export function AudienceInsights({
  topCountries,
  topBrowsers,
  topDevices,
  topOS,
  countriesLoading = false,
  browsersLoading = false,
  devicesLoading = false,
  osLoading = false,
  isDemo = false,
  onViewMore,
  className = ''
}: AudienceInsightsProps) {
  const [audienceTab, setAudienceTab] = useState<string>('countries');

  // Helper function to get appropriate image for browser
  const getBrowserImage = (browser: string) => {
    const lowerBrowser = browser.toLowerCase();

    if (lowerBrowser.includes('chrome')) return '/images/chrome.png';
    if (lowerBrowser.includes('firefox')) return '/images/firefox.png';
    if (lowerBrowser.includes('safari')) return '/images/safari.png';
    if (lowerBrowser.includes('edge') || lowerBrowser.includes('explorer')) return '/images/explorer.png';
    if (lowerBrowser.includes('opera')) return '/images/opera.png';

    return '/images/chrome.png'; // Default fallback
  };

  // Helper function to get appropriate image for device
  const getDeviceImage = (device: string) => {
    const lowerDevice = device.toLowerCase();

    if (lowerDevice.includes('mobile') || lowerDevice.includes('phone')) return '/images/phone.png';
    if (lowerDevice.includes('tablet')) return '/images/tablet.png';
    if (lowerDevice.includes('desktop') || lowerDevice.includes('pc')) return '/images/monitor.png';

    return '/images/monitor.png'; // Default fallback
  };

  // Helper function to get appropriate image for OS
  const getOSImage = (os: string) => {
    const lowerOS = os.toLowerCase();

    if (lowerOS.includes('windows')) return '/images/windows.png';
    if (lowerOS.includes('mac') || lowerOS.includes('macos')) return '/images/apple.png';
    if (lowerOS.includes('android')) return '/images/android.png';
    if (lowerOS.includes('linux')) return '/images/linux.png';
    if (lowerOS.includes('ios')) return '/images/phone.png';

    return '/images/monitor.png'; // Default fallback
  };

  return (
    <Card className={`bg-card border-0 shadow-sm ${className}`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base sm:text-lg font-medium text-foreground">Audience Insights</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Geographic, device, and browser breakdown</p>
        </div>
        <Tabs value={audienceTab} onValueChange={setAudienceTab} className="w-full sm:w-auto flex-shrink-0">
          <TabsList className="grid w-full grid-cols-4 h-9 sm:h-8 gap-1">
            <TabsTrigger value="countries" className="text-xs px-1 sm:px-2 md:px-3 truncate">Countries</TabsTrigger>
            <TabsTrigger value="browsers" className="text-xs px-1 sm:px-2 md:px-3 truncate">Browsers</TabsTrigger>
            <TabsTrigger value="devices" className="text-xs px-1 sm:px-2 md:px-3 truncate">Devices</TabsTrigger>
            <TabsTrigger value="os" className="text-xs px-1 sm:px-2 md:px-3 truncate">OS</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="">
        <div className="mt-0 max-h-[32rem] overflow-y-auto">
          {audienceTab === 'countries' && (
            <TopCountriesChart
              data={topCountries}
              isLoading={countriesLoading}
              onViewMore={() => onViewMore?.('countries')}
            />
          )}
          {audienceTab === 'browsers' && (
            <TopBrowsersChart
              data={topBrowsers}
              isLoading={browsersLoading}
              onViewMore={() => onViewMore?.('browsers')}
            />
          )}
          {audienceTab === 'devices' && (
            <TopDevicesChart
              data={topDevices}
              isLoading={devicesLoading}
              onViewMore={() => onViewMore?.('devices')}
            />
          )}

          {audienceTab === 'os' && (
            <div className="space-y-4">
              {topOS?.top_os && topOS.top_os.length > 0 ? (
                <>
                  {/* Real OS List */}
                  <div className="space-y-2">
                    {topOS.top_os.map((os: any, index: number) => {
                      const colors = ['#0078D4', '#000000', '#007AFF', '#3DDC84', '#FF6B35', '#8B5CF6'];
                      const totalVisitors = topOS.top_os.reduce((sum: number, o: any) => sum + (o.visitors || 0), 0);
                      const percentage = totalVisitors > 0 ? Math.round(((os.visitors || 0) / totalVisitors) * 100) : 0;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border-b">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
                              <Image
                                src={getOSImage(os.os)}
                                alt={os.os}
                                width={20}
                                height={20}
                                className="object-contain"
                                onError={(e) => {
                                  // Fallback to colored dot if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                            </div>
                            <span className="text-sm font-medium">{os.os}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{(os.visitors || 0).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-sm">No operating system data available</div>
                  <div className="text-xs">OS breakdown will appear here once visitors start coming to your site</div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
