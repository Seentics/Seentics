'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/analytics-api';
import { BarChart3, Calendar, CreditCard, DollarSign, FileText, Globe, HelpCircle, Home, Info, LogIn, Mail, Package, Palette, Phone, Settings, Shield, ShoppingCart, User, Users, Workflow, Zap } from 'lucide-react';
import React from 'react';

interface TopPagesChartProps {
  data: any;
  isLoading: boolean;
  onViewMore?: () => void;
  showHeader?: boolean;
}

const getPageIcon = (page: string) => {
  // Handle undefined/null cases
  if (!page) {
    return <Globe className="w-4 h-4 text-gray-500" />;
  }

  const path = getPathFromUrl(page);
  const lowerPath = path.toLowerCase();

  // Homepage
  if (path === '/') {
    return <Home className="w-4 h-4 text-blue-500" />;
  }

  // Blog/Post pages
  if (lowerPath.includes('/blog') || lowerPath.includes('/post') || lowerPath.includes('/article')) {
    return <FileText className="w-4 h-4 text-green-500" />;
  }

  // About page
  if (lowerPath === '/about' || lowerPath.includes('/about')) {
    return <Info className="w-4 h-4 text-purple-500" />;
  }

  // Contact page
  if (lowerPath === '/contact' || lowerPath.includes('/contact')) {
    return <Phone className="w-4 h-4 text-orange-500" />;
  }

  // Pricing page
  if (lowerPath === '/pricing' || lowerPath.includes('/pricing')) {
    return <DollarSign className="w-4 h-4 text-yellow-500" />;
  }

  // Products page
  if (lowerPath === '/products' || lowerPath.includes('/products') || lowerPath.includes('/product/')) {
    return <Package className="w-4 h-4 text-indigo-500" />;
  }

  // Analytics page
  if (lowerPath.includes('/analytics')) {
    return <BarChart3 className="w-4 h-4 text-blue-500" />;
  }

  // Workflows page
  if (lowerPath.includes('/workflows')) {
    return <Workflow className="w-4 h-4 text-green-500" />;
  }

  // Billing page
  if (lowerPath.includes('/billing')) {
    return <CreditCard className="w-4 h-4 text-red-500" />;
  }

  // Support page
  if (lowerPath.includes('/support')) {
    return <HelpCircle className="w-4 h-4 text-teal-500" />;
  }

  // Templates page
  if (lowerPath.includes('/templates')) {
    return <Palette className="w-4 h-4 text-amber-500" />;
  }

  // Auth/Login pages
  if (lowerPath.includes('/auth') || lowerPath.includes('/login') || lowerPath.includes('/signup')) {
    return <LogIn className="w-4 h-4 text-gray-500" />;
  }

  // Settings page
  if (lowerPath.includes('/settings') || lowerPath.includes('/preferences')) {
    return <Settings className="w-4 h-4 text-gray-600" />;
  }

  // Shopping cart
  if (lowerPath.includes('/cart') || lowerPath.includes('/checkout')) {
    return <ShoppingCart className="w-4 h-4 text-blue-600" />;
  }

  // User profile
  if (lowerPath.includes('/profile') || lowerPath.includes('/account') || lowerPath.includes('/user')) {
    return <User className="w-4 h-4 text-green-600" />;
  }

  // Mail/Newsletter
  if (lowerPath.includes('/mail') || lowerPath.includes('/newsletter') || lowerPath.includes('/subscribe')) {
    return <Mail className="w-4 h-4 text-blue-600" />;
  }

  // Calendar/Events
  if (lowerPath.includes('/calendar') || lowerPath.includes('/events') || lowerPath.includes('/schedule')) {
    return <Calendar className="w-4 h-4 text-purple-600" />;
  }

  // Team/Users
  if (lowerPath.includes('/team') || lowerPath.includes('/users') || lowerPath.includes('/members')) {
    return <Users className="w-4 h-4 text-indigo-600" />;
  }

  // Security/Privacy
  if (lowerPath.includes('/security') || lowerPath.includes('/privacy') || lowerPath.includes('/terms')) {
    return <Shield className="w-4 h-4 text-red-600" />;
  }

  // Features/Highlights
  if (lowerPath.includes('/features') || lowerPath.includes('/highlights') || lowerPath.includes('/benefits')) {
    return <Zap className="w-4 h-4 text-yellow-600" />;
  }

  // Default for other pages
  return <Globe className="w-4 h-4 text-purple-500" />;
};

const getPageName = (page: string) => {
  // Handle undefined/null cases
  if (!page) return 'Unknown Page';

  // Extract path from URL if it's a full URL
  const path = getPathFromUrl(page);

  // Handle common static routes
  if (path === '/') return 'Homepage';
  if (path === '/about') return 'About';
  if (path === '/contact') return 'Contact';
  if (path === '/pricing') return 'Pricing';
  if (path === '/products') return 'Products';
  if (path === '/blog') return 'Blog';
  if (path.startsWith('/blog/')) return 'Blog Post';
  if (path.startsWith('/product/')) return 'Product Page';
  if (path.startsWith('/auth/')) return 'Auth Page';
  if (path.includes('callback')) return 'OAuth Callback';

  // Handle dynamic routes with IDs
  if (path.match(/^\/websites\/[^\/]+\/analytics$/)) return 'Analytics';
  if (path.match(/^\/websites\/[^\/]+\/workflows$/)) return 'Workflows';
  if (path.match(/^\/websites\/[^\/]+\/workflows\/edit\/new/)) return 'New Workflow';
  if (path.match(/^\/websites\/[^\/]+\/workflows\/edit\/[^\/]+$/)) return 'Edit Workflow';
  if (path.match(/^\/websites\/[^\/]+\/workflows\/[^\/]+$/)) return 'Workflow Details';
  if (path.match(/^\/websites\/[^\/]+\/billing$/)) return 'Billing';
  if (path.match(/^\/websites\/[^\/]+\/support$/)) return 'Support';
  if (path.match(/^\/websites\/[^\/]+\/templates$/)) return 'Templates';

  // Handle generic ID-based routes
  if (path.match(/\/[a-f0-9]{24}$/)) return 'Details'; // MongoDB ObjectId
  if (path.match(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)) return 'Details'; // UUID

  // Handle query parameters
  if (path.includes('?')) {
    const basePath = path.split('?')[0];
    if (basePath.match(/\/edit\/new$/)) return 'New Item';
    if (basePath.match(/\/edit\/[^\/]+$/)) return 'Edit Item';
  }

  // Extract meaningful part from complex paths
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    // Convert kebab-case to Title Case
    if (lastSegment.includes('-')) {
      return lastSegment.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    // Convert camelCase to Title Case
    if (lastSegment.match(/[a-z][A-Z]/)) {
      return lastSegment.replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    // Capitalize single words
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  }

  return path;
};

const getPathFromUrl = (url: string) => {
  // Handle undefined/null cases
  if (!url) return '/';

  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // If not a valid URL, try to extract path from string
    if (url.startsWith('http')) {
      const pathMatch = url.match(/https?:\/\/[^\/]+(\/.*)/);
      return pathMatch ? pathMatch[1] : url;
    }
    return url;
  }
};

const truncatePath = (path: string, maxLength: number = 40) => {
  if (path.length <= maxLength) return path;

  // For long paths, try to show the most meaningful part
  if (path.includes('/websites/')) {
    // For website routes, show the last meaningful segment
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 3) {
      const websiteId = segments[1];
      const lastSegment = segments[segments.length - 1];

      // If it's a long ID, truncate it
      if (websiteId.length > 8) {
        const shortId = websiteId.substring(0, 8) + '...';
        const meaningfulPath = `/websites/${shortId}/${segments.slice(2).join('/')}`;
        if (meaningfulPath.length <= maxLength) {
          return meaningfulPath;
        }
      }

      // Show last meaningful segment
      if (lastSegment.length > 20) {
        return `.../${lastSegment.substring(0, 17)}...`;
      }
      return `.../${lastSegment}`;
    }
  }

  // For other paths, show beginning and end
  const start = Math.floor((maxLength - 3) / 2);
  const end = maxLength - 3 - start;
  return path.substring(0, start) + '...' + path.substring(path.length - end);
};

export const TopPagesChart: React.FC<TopPagesChartProps> = ({ data, isLoading, onViewMore, showHeader = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-2 h-full">
        <Skeleton className="w-32" />
        <div className="space-y-3">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="flex items-center justify-between  bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="w-32 h-4" />
              </div>
              <Skeleton className="w-16 h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const chartData = data?.top_pages || [];
  const filteredData = chartData.filter((item: any) => (item.views || 0) > 0);
  const sortedData = [...filteredData].sort((a: any, b: any) => b.views - a.views).slice(0, 8);
  const totalViews = sortedData.reduce((sum: number, item: any) => sum + item.views, 0);

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground py-6">
        <div className="text-center">
          <div className="w-16  mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center p-2">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium">No page data available</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Pages will appear here once visitors start browsing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between">
        {showHeader && (
          <div>
            <h3 className="text-lg font-semibold text-foreground">Top Pages</h3>
            <p className="text-sm text-muted-foreground">Most visited pages on your site</p>
          </div>
        )}
      </div>

      <div className="space-y-2  overflow-y-auto pr-1">
        {sortedData.map((item: any, index: number) => {
          const pageName = getPageName(item.page);
          const percentage = ((item.views / totalViews) * 100).toFixed(1);
          const isHomepage = (item.page || '/') === '/';

          return (
            <div
              key={index}
              className={`flex items-center justify-between p-2  border-b transition-all`}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getPageIcon(item.page)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium text-sm truncate ${isHomepage
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-gray-900 dark:text-gray-100'
                    }`} title={pageName}>
                    {pageName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate" title={getPathFromUrl(item.page)}>
                    {truncatePath(getPathFromUrl(item.page))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-right">
                <div className="text-right">
                  <div className={`font-bold text-lg ${isHomepage
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-gray-100'
                    }`}>
                    {formatNumber(item.views)}
                  </div>
                  <div className="text-xs text-muted-foreground">{percentage}%</div>
                </div>

                {/* Progress bar */}
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isHomepage
                      ? 'bg-blue-500'
                      : 'bg-gray-400 dark:bg-gray-500'
                      }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button
      {filteredData.length > 5 && onViewMore && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={onViewMore}
          >
            View All Pages ({filteredData.length})
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )} */}
    </div>
  );
}; 