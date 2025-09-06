'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface Props {
  data: {
    timeseries: Array<{ date: string; count: number }>;
    top_events: Array<{ event_type: string; count: number }>;
  } | undefined;
  isLoading: boolean;
}

export const CustomEventsChart: React.FC<Props> = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton className="h-48 w-full" />;

  const top = data?.top_events || [];
  const list = top.map(t => ({ name: t.event_type, count: t.count }));

  if (list.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-muted-foreground">
        <div className="text-center text-sm">No custom events recorded in the selected range</div>
      </div>
    );
  }

  const iconForEvent = (eventType: string) => {
    const et = eventType.toLowerCase();
    if (et.includes('conversion')) return '/images/cta.png';
    if (et.includes('form')) return '/images/search.png';
    if (et.includes('download')) return '/images/download.png';
    if (et.includes('video')) return '/images/monitor.png';
    if (et.includes('search')) return '/images/search.png';
    return '/images/mouse.png';
  };

  return (
    <div className="space-y-2">
      {list.slice(0, 10).map((item, idx) => (
        <div key={`${item.name}-${idx}`} className="flex items-center justify-between p-2 sm:p-3 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-muted overflow-hidden flex-shrink-0">
              <Image src={iconForEvent(item.name)} alt={item.name} width={16} height={16} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
            </div>
            <span className="text-sm font-medium capitalize truncate">{item.name.replace(/_/g, ' ')}</span>
          </div>
          <div className="text-right text-xs text-muted-foreground flex-shrink-0">
            <div>{item.count} events</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CustomEventsChart;


