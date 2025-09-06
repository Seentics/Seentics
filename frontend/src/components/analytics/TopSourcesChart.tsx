'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search, ExternalLink, Users, TrendingUp, Globe, Mail, Share2, LinkIcon } from 'lucide-react';
import Image from 'next/image';

interface TopSourcesChartProps {
  data?: {
    top_referrers: Array<{
      referrer: string;
      visitors: number;
      page_views: number;
      avg_session_duration: number;
    }>;
  };
  isLoading?: boolean;
  onViewMore?: () => void;
}

export default function TopSourcesChart({ data, isLoading, onViewMore }: TopSourcesChartProps) {
  // Use real data if available, otherwise show empty state
  const sourceData = data?.top_referrers?.map((item, index) => {
    const colors = ['#4285F4', '#34A853', '#EA4335', '#FBBC05', '#8B5CF6', '#06B6D4'];
    
    const totalVisitors = data.top_referrers.reduce((sum, s) => sum + s.visitors, 0);
    const percentage = totalVisitors > 0 ? Math.round((item.visitors / totalVisitors) * 100) : 0;
    
    // Get appropriate image based on referrer type
    const getImageForReferrer = (referrer: string) => {
      const lowerReferrer = referrer.toLowerCase();
      if (lowerReferrer.includes('google') || lowerReferrer.includes('bing') || lowerReferrer.includes('yahoo')) return '/images/search.png';
      if (lowerReferrer.includes('facebook')) return '/images/facebook.png';
      if (lowerReferrer.includes('twitter')) return '/images/twitter.png';
      if (lowerReferrer.includes('linkedin')) return '/images/linkedin.png';
      if (lowerReferrer.includes('instagram')) return '/images/instagram.png';
      if (lowerReferrer.includes('youtube')) return '/images/search.png';
      if (lowerReferrer.includes('tiktok')) return '/images/tiktok.png';
      if (lowerReferrer.includes('pinterest')) return '/images/pinterest.png';
      if (lowerReferrer.includes('whatsapp')) return '/images/whatsapp.png';
      if (lowerReferrer.includes('telegram')) return '/images/telegram.png';
      if (lowerReferrer.includes('github') || lowerReferrer.includes('stackoverflow')) return '/images/search.png';
      if (lowerReferrer.includes('medium') || lowerReferrer.includes('dev.to')) return '/images/planet-earth.png';
      if (lowerReferrer.includes('email') || lowerReferrer.includes('mail')) return '/images/search.png';
      if (lowerReferrer.includes('direct')) return '/images/link.png';
      return '/images/link.png'; // Default image
    };
    
    return {
      source: item.referrer,
      visitors: item.visitors,
      percentage: percentage,
      color: colors[index % colors.length],
      image: getImageForReferrer(item.referrer),
      type: item.referrer // Use actual referrer name instead of hardcoded types
    };
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </div>
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.top_referrers || data.top_referrers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-sm">No source data available</div>
        <div className="text-xs">Source data will appear here once visitors start coming to your site</div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Top Sources List */}
        <div className="space-y-3">
          {sourceData.slice(0, 5).map((item, index) => {
            return (
              <div key={item.source} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg overflow-hidden" style={{ backgroundColor: `${item.color}20` }}>
                      <Image
                        src={item.image}
                        alt={item.source}
                        width={16}
                        height={16}
                        className="object-contain"
                        onError={(e) => {
                          // Fallback to colored icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden">
                        {item.source.toLowerCase().includes('google') || item.source.toLowerCase().includes('bing') || item.source.toLowerCase().includes('yahoo') ? (
                          <Search className="h-4 w-4" style={{ color: item.color }} />
                        ) : item.source.toLowerCase().includes('facebook') || item.source.toLowerCase().includes('twitter') || item.source.toLowerCase().includes('linkedin') ? (
                          <Share2 className="h-4 w-4" style={{ color: item.color }} />
                        ) : item.source.toLowerCase().includes('github') || item.source.toLowerCase().includes('stackoverflow') ? (
                          <Users className="h-4 w-4" style={{ color: item.color }} />
                        ) : item.source.toLowerCase().includes('medium') || item.source.toLowerCase().includes('dev.to') ? (
                          <Globe className="h-4 w-4" style={{ color: item.color }} />
                        ) : item.source.toLowerCase().includes('email') || item.source.toLowerCase().includes('mail') ? (
                          <Mail className="h-4 w-4" style={{ color: item.color }} />
                        ) : item.source.toLowerCase().includes('direct') ? (
                          <ExternalLink className="h-4 w-4" style={{ color: item.color }} />
                        ) : (
                          <LinkIcon className="h-4 w-4" style={{ color: item.color }} />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.source}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{(item.visitors || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${item.percentage}%`, 
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart
        <div className="mt-6 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="source" 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <p className="font-semibold">{data.source}</p>
                        <p className="text-blue-600">
                          {(data.visitors || 0).toLocaleString()} visitors ({data.percentage}%)
                        </p>
                        <p className="text-sm text-muted-foreground">{data.type}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="visitors" radius={[4, 4, 0, 0]}>
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div> */}

        {/* Source Type Summary */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {sourceData.filter(s => s.type === 'Organic').reduce((sum, s) => sum + s.percentage, 0).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Organic Traffic</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {sourceData.filter(s => s.type !== 'Organic').reduce((sum, s) => sum + s.percentage, 0).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Paid/Referral</div>
          </div>
        </div>
      </div>
    </div>
  );
} 