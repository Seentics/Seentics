'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target } from 'lucide-react';
import Image from 'next/image';

interface UTMPerformanceData {
  sources: Array<{
    source: string;
    unique_visitors: number;
    visits: number;
  }>;
  mediums: Array<{
    medium: string;
    unique_visitors: number;
    visits: number;
  }>;
  campaigns: Array<{
    campaign: string;
    unique_visitors: number;
    visits: number;
  }>;
  terms: Array<{
    term: string;
    unique_visitors: number;
    visits: number;
  }>;
  content: Array<{
    content: string;
    unique_visitors: number;
    visits: number;
  }>;
  avg_ctr: number;
  total_campaigns: number;
  total_sources: number;
  total_mediums: number;
}

interface UTMPerformanceChartProps {
  data: UTMPerformanceData;
  isLoading?: boolean;
  controlledTab?: 'sources' | 'mediums' | 'campaigns' | 'terms' | 'content';
  onTabChange?: (tab: 'sources' | 'mediums' | 'campaigns' | 'terms' | 'content') => void;
  hideTabs?: boolean;
}

export function UTMPerformanceChart({ data, isLoading = false, controlledTab, onTabChange, hideTabs = false }: UTMPerformanceChartProps) {
  const [internalTab, setInternalTab] = useState<'sources' | 'mediums' | 'campaigns' | 'terms' | 'content'>('sources');
  const utmTab = controlledTab ?? internalTab;
  const setUtmTab = (tab: 'sources' | 'mediums' | 'campaigns' | 'terms' | 'content') => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  if (isLoading) {
    return (
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'sources': return 'UTM Sources';
      case 'mediums': return 'UTM Mediums';
      case 'campaigns': return 'UTM Campaigns';
      case 'terms': return 'UTM Terms';
      case 'content': return 'UTM Content';
      default: return 'UTM Data';
    }
  };

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case 'sources': return 'Traffic sources driving visitors to your site';
      case 'mediums': return 'Marketing channels and mediums used';
      case 'campaigns': return 'Active marketing campaigns and their performance';
      case 'terms': return 'Search terms and keywords driving traffic';
      case 'content': return 'Content variations and their effectiveness';
      default: return 'UTM parameter performance data';
    }
  };

  const getListData = (utmType: string) => {
    const utmData = data[utmType as keyof UTMPerformanceData] as Array<any>;
    if (!utmData || !Array.isArray(utmData)) return [] as Array<{ name: string; visitors: number; events: number; sessions?: number }>;
    
    return utmData
      .map((item: any) => {
        let name = '';
        let visitors = 0;
        let events = 0;
        
        // Handle different UTM types
        if (utmType === 'sources') {
          name = item.source || 'Unknown';
          visitors = Number(item.unique_visitors) || 0;
          events = Number(item.visits || item.pageviews) || 0; // Handle both field names
        } else if (utmType === 'mediums') {
          name = item.medium || 'Unknown';
          visitors = Number(item.unique_visitors) || 0;
          events = Number(item.visits || item.pageviews) || 0; // Handle both field names
        } else if (utmType === 'campaigns') {
          name = item.campaign || 'Unknown';
          visitors = Number(item.unique_visitors) || 0;
          events = Number(item.visits || item.pageviews) || 0; // Handle both field names
        } else if (utmType === 'terms') {
          name = item.term || 'Unknown';
          visitors = Number(item.unique_visitors) || 0;
          events = Number(item.visits || item.pageviews) || 0; // Handle both field names
        } else if (utmType === 'content') {
          name = item.content || 'Unknown';
          visitors = Number(item.unique_visitors) || 0;
          events = Number(item.visits || item.pageviews) || 0; // Handle both field names
        }
        
        return {
          name: name === 'None' ? 'Direct' : name,
          visitors: visitors,
          events: events,
          sessions: undefined, // Not available in new format
        };
      })
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);
  };

  const listData = getListData(utmTab);

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <div className="text-sm font-medium">No UTM data available</div>
          <div className="text-xs">Start adding UTM parameters to your links to track campaign performance</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-lg p-4">
      {!hideTabs && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h4 className="font-semibold text-foreground text-sm">{getTabTitle(utmTab)}</h4>
            <p className="text-xs text-muted-foreground">{getTabDescription(utmTab)}</p>
          </div>
          <Tabs value={utmTab} onValueChange={(v) => setUtmTab(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-5 h-9 sm:h-8">
              <TabsTrigger value="sources" className="text-xs px-2">Sources</TabsTrigger>
              <TabsTrigger value="mediums" className="text-xs px-2">Mediums</TabsTrigger>
              <TabsTrigger value="campaigns" className="text-xs px-2">Campaigns</TabsTrigger>
              <TabsTrigger value="terms" className="text-xs px-2">Terms</TabsTrigger>
              <TabsTrigger value="content" className="text-xs px-2">Content</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {listData.length > 0 ? (
        <div className="space-y-2">
          {listData.map((item, idx) => (
            <div key={`${item.name}-${idx}`} className="flex items-center justify-between p-3 bg-background rounded-lg dark:border border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                  <Image src={getImageForName(item.name, utmTab)} alt={item.name} width={20} height={20} className="object-contain" />
                </div>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>{item.visitors} visitors</div>
                <div>{item.events} events{item.sessions ? ` • ${item.sessions} sessions` : ''}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <div className="text-sm">No {utmTab} data available</div>
          <div className="text-xs">Add UTM parameters to your links to see {utmTab} performance</div>
        </div>
      )}
    </div>
  );
}

const getImageForName = (name: string, tab: string) => {
  const lower = (name || '').toLowerCase();
  if (tab === 'sources' || tab === 'campaigns' || tab === 'mediums') {
    if (lower.includes('google')) return '/images/search.png';
    if (lower.includes('facebook')) return '/images/facebook.png';
    if (lower.includes('twitter')) return '/images/twitter.png';
    if (lower.includes('linkedin')) return '/images/linkedin.png';
    if (lower.includes('instagram')) return '/images/instagram.png';
    if (lower.includes('youtube')) return '/images/search.png';
    if (lower.includes('tiktok')) return '/images/tiktok.png';
    if (lower.includes('pinterest')) return '/images/pinterest.png';
    if (lower.includes('email')) return '/images/search.png';
    if (lower.includes('direct')) return '/images/link.png';
  }
  return '/images/planet-earth.png';
};


