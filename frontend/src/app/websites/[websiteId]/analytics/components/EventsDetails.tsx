'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

type EventItem = {
  event_type: string;
  count: number;
  description?: string;
  common_properties?: string[];
  sample_properties?: Record<string, any>;
  sample_event?: Record<string, any>;
};

interface EventsDetailsProps {
  items: EventItem[];
}

export const EventsDetails: React.FC<EventsDetailsProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">No events to display</div>
    );
  }

  const pretty = (obj?: Record<string, any>) => {
    try {
      return JSON.stringify(obj || {}, null, 2);
    } catch (e) {
      return '{}';
    }
  };

  // Exclude generic context fields; prefer event-specific properties
  const excludedKeys = new Set([
    'browser', 'city', 'country', 'device', 'language', 'os', 'referrer',
    'screen_height', 'screen_width', 'time_on_page', 'timezone', 'user_agent',
    'utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term',
    'page', 'session_id', 'visitor_id', 'ip', 'timestamp'
  ]);

  const allowedPrefixes = [
    'element_', 'form_', 'search_', 'file_', 'video_', 'position', 'href'
  ];

  const isAllowedKey = (key: string) => {
    if (excludedKeys.has(key)) return false;
    return allowedPrefixes.some(prefix => key === prefix || key.startsWith(prefix));
  };

  const filterEventProps = (obj?: Record<string, any>) => {
    if (!obj || typeof obj !== 'object') return {} as Record<string, any>;
    const filtered: Record<string, any> = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (isAllowedKey(key)) {
        filtered[key] = value;
      }
    });
    return filtered;
  };

  return (
    <div className="space-y-3">
      {items.map((event, index) => (
        <div key={`${event.event_type}-${index}`} className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">{index + 1}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground capitalize truncate">{event.event_type.replace(/_/g, ' ')}</div>
                {event.description && (
                  <div className="text-xs text-muted-foreground truncate">{event.description}</div>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-base font-semibold text-foreground">{event.count.toLocaleString()}</div>
            </div>
          </div>

          {event.common_properties && event.common_properties.length > 0 && (
            <div className="mb-2">
              <div className="text-[11px] font-medium text-muted-foreground mb-1">Common Properties</div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {event.common_properties.map((prop, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] px-2 py-1">{prop}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Properties as JSON blocks */}
          <div className="space-y-2">
            {/* Custom Properties */}
            <div>
              <div className="text-[11px] font-medium text-muted-foreground mb-1">Sample Properties</div>
              {(() => {
                const filtered = filterEventProps(event.sample_properties);
                return filtered && Object.keys(filtered).length > 0 ? (
                  <pre className="text-xs bg-muted/50 p-2 sm:p-3 rounded border border-border overflow-x-auto"><code>{pretty(filtered)}</code></pre>
                ) : (
                  <div className="text-[11px] text-muted-foreground">No custom properties captured</div>
                );
              })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsDetails;


