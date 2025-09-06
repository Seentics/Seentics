'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addWebsite, getWebsites, deleteWebsite, Website } from '@/lib/websites-api';
import { getTrafficSummary, type TrafficSummary } from '@/lib/analytics-api';
import { useAuth } from '@/stores/useAuthStore';
import { checkPermission, getSubscription, type Subscription } from '@/lib/subscription-api';
import { useToast } from '@/hooks/use-toast';
import ContextualUpgradeBanner from '@/components/contextual-upgrade-banner';

// Import our new modular components
import { WebsitesHeader } from '@/components/websites/websites-header';
import { WebsiteModal } from '@/components/websites/website-modal';
import { TrackingCodeModal } from '@/components/websites/tracking-code-modal';
import { WebsiteCard } from '@/components/websites/website-card';
import { EmptyState } from '@/components/websites/empty-state';

export default function WebsitesPage() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [siteStats, setSiteStats] = useState<Record<string, { pageviews: number; unique: number }>>({});
  
  // Modal states
  const [isWebsiteModalOpen, setWebsiteModalOpen] = useState(false);
  const [isTrackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedSiteIdForModal, setSelectedSiteIdForModal] = useState<string | null>(null);
  const [newlyCreatedSiteId, setNewlyCreatedSiteId] = useState<string | null>(null);
  
  const { toast: showToast } = useToast();

  // Fetch websites
  const fetchWebsites = async () => {
    if (!user) return;
    
    setIsLoadingWebsites(true);
    try {
      const websitesData = await getWebsites();
      setWebsites(websitesData);
    } catch (error) {
      console.error('Error fetching websites:', error);
      showToast({
        title: 'Error',
        description: 'Failed to fetch websites.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingWebsites(false);
    }
  };

  // Fetch subscription with usage data
  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      const resp = await fetch('/api/user/subscriptions/usage');
      if (resp.ok) {
        const data = await resp.json();
        const subscriptionData = data?.data;
        if (subscriptionData) {
          setSubscription(subscriptionData);
        }
      } else {
        // Fallback to basic subscription if usage endpoint fails
        const subscriptionData = await getSubscription();
        setSubscription(subscriptionData!);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Fallback to basic subscription
      try {
        const subscriptionData = await getSubscription();
        setSubscription(subscriptionData!);
      } catch (fallbackError) {
        console.error('Fallback subscription fetch failed:', fallbackError);
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchWebsites();
      fetchSubscription();
    }
  }, [user]);

  // Fetch analytics stats per website once websites are loaded
  useEffect(() => {
    let isCancelled = false;
    const loadStats = async () => {
      if (!websites || websites.length === 0) {
        setSiteStats({});
        return;
      }
      try {
        const results = await Promise.all(
          websites.map(async (site) => {
            try {
              const summary: TrafficSummary = await getTrafficSummary(site.id, 7);
              const pageviews = Number(summary?.total_page_views) || 0;
              const unique = Number(summary?.unique_visitors) || 0;
              return [site.id, { pageviews, unique }] as const;
            } catch (_) {
              // Fallback to stored stats if analytics is unavailable
              const pageviews = Number(site?.stats?.totalPageviews) || 0;
              const unique = Number(site?.stats?.uniqueVisitors) || 0;
              return [site.id, { pageviews, unique }] as const;
            }
          })
        );
        if (!isCancelled) {
          const map: Record<string, { pageviews: number; unique: number }> = {};
          for (const [id, value] of results) map[id] = value;
          setSiteStats(map);
        }
      } catch (_) {}
    };
    loadStats();
    return () => {
      isCancelled = true;
    };
  }, [websites]);

  const { allowed: canAddWebsite, planName } = checkPermission('websites', websites?.length || 0, subscription);

  const handleCreateWebsite = async (website: { name: string; url: string }) => {
    if (!canAddWebsite) {
      showToast({
        title: 'Website Limit Reached',
        description: `You have reached the website limit for the ${planName} plan. Please upgrade to add more.`,
        variant: 'destructive',
      });
      return false;
    }

    try {
      const newWebsite = await addWebsite(website, user!.id);
      await fetchWebsites(); // Refresh websites list
      
      // Show tracking modal for the newly created website
      if (newWebsite && newWebsite.id) {
        setNewlyCreatedSiteId(newWebsite.id);
        setSelectedSiteIdForModal(newWebsite.id);
        setTrackingModalOpen(true);
      }
      
      return newWebsite;
    } catch (error: any) {
      showToast({ 
        title: 'Error', 
        description: error.message || 'Failed to create the website.', 
        variant: 'destructive' 
      });
      return false;
    }
  };

  const handleDeleteWebsite = async (siteId: string, siteName: string) => {
    try {
      await deleteWebsite(siteId, user!.id);
      showToast({ 
        title: 'Website Deleted', 
        description: `"${siteName}" and all its workflows have been deleted.` 
      });
      await fetchWebsites(); // Refresh websites list
    } catch (error: any) {
      showToast({ 
        title: 'Error Deleting Website', 
        description: error.message || 'An unexpected error occurred.', 
        variant: 'destructive' 
      });
    }
  };

  const handleShowTrackingCode = (siteId: string) => {
    setSelectedSiteIdForModal(siteId);
    setNewlyCreatedSiteId(null); // Not newly created
    setTrackingModalOpen(true);
  };

  const handleTrackingModalClose = (open: boolean) => {
    setTrackingModalOpen(open);
    if (!open) {
      setSelectedSiteIdForModal(null);
      setNewlyCreatedSiteId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background ">
      <WebsitesHeader onCreateWebsite={() => setWebsiteModalOpen(true)} />
      
      <main className="p-4 sm:p-6  max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Usage Summary Banner */}
          {subscription && subscription.limits && (
            <div className="mb-6 space-y-4">
              <ContextualUpgradeBanner
                type="websites"
                current={websites?.length || 0}
                limit={subscription.limits.websites || 1}
                plan={subscription.plan || 'free'}
                className="mb-4"
              />
              
              {/* Show monthly events usage if available */}
              {subscription.usage && (
                <ContextualUpgradeBanner
                  type="monthlyEvents"
                  current={subscription.usage.monthlyEvents || 0}
                  limit={subscription.limits.monthlyEvents || 10000}
                  plan={subscription.plan || 'free'}
                  className="mb-4"
                />
              )}
            </div>
          )}
          
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Your Websites</h1>
            <p className="text-muted-foreground mt-2">
              Select a site to manage its workflows and analytics, or add a new one to get started.
            </p>
          </div>

          {isLoadingWebsites ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your websites...</p>
              </div>
            </div>
          ) : !websites || websites?.length === 0 ? (
            <EmptyState onCreateWebsite={() => setWebsiteModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((site) => (
                <WebsiteCard
                  key={site.id}
                  website={site}
                  stats={siteStats[site.id] || { pageviews: 0, unique: 0 }}
                  onDelete={handleDeleteWebsite}
                  onShowTrackingCode={handleShowTrackingCode}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Website Creation Modal */}
      <WebsiteModal
        isOpen={isWebsiteModalOpen}
        onOpenChange={setWebsiteModalOpen}
        onSubmit={handleCreateWebsite}
        title="Add a new website"
        description="Enter your site's name and domain to get started with tracking and workflows."
        submitText="Add website"
        loadingText="Adding..."
      />

      {/* Tracking Code Modal */}
      {selectedSiteIdForModal && (
        <TrackingCodeModal
          siteId={selectedSiteIdForModal}
          isOpen={isTrackingModalOpen}
          onOpenChange={handleTrackingModalClose}
          isNewlyCreated={newlyCreatedSiteId === selectedSiteIdForModal}
        />
      )}
    </div>
  );
}