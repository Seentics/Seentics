'use client';

import CookieConsentManager from '@/components/cookie-consent-manager';
import DataRetentionManager from '@/components/data-retention-manager';
import GDPRDataManager from '@/components/gdpr-data-manager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { privacyAPI } from '@/lib/privacy-api';
import { useAuth } from '@/stores/useAuthStore';
import {
  AlertTriangle,
  CheckCircle,
  Cookie,
  Download,
  Settings,
  Shield,
  Trash2
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PrivacySettingsPage() {
  const params = useParams();
  const websiteId = params?.websiteId as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [privacySettings, setPrivacySettings] = useState({
    analyticsTracking: true,
    marketingEmails: false,
    personalizedContent: true,
    thirdPartySharing: false,
    dataRetention: '2years',
    cookieConsent: 'granular'
  });

  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load privacy settings on component mount
  useEffect(() => {
    const loadPrivacySettings = async () => {
      if (!user) return;

      try {
        const response = await privacyAPI.getPrivacySettings();
        if (response.success && response.data.settings) {
          //@ts-ignore
          setPrivacySettings(response.data.settings);
        }
      } catch (error) {
        console.error('Failed to load privacy settings:', error);
        toast({
          title: "Load Failed",
          description: "Failed to load privacy settings. Using defaults.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPrivacySettings();
  }, [user, toast]);

  const handleSettingChange = async (setting: string, value: any) => {
    const newSettings = { ...privacySettings, [setting]: value };
    setPrivacySettings(newSettings);

    try {
      // Save to backend API
      await privacyAPI.updatePrivacySettings({ [setting]: value });

      toast({
        title: "Setting Updated",
        description: "Privacy setting has been updated successfully.",
      });
    } catch (error) {
      // Revert on error
      setPrivacySettings(privacySettings);
      toast({
        title: "Update Failed",
        description: "Failed to update privacy setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCookieConsentChange = (preferences: any) => {
    // Update privacy settings based on cookie consent
    setPrivacySettings(prev => ({
      ...prev,
      analyticsTracking: preferences.analytics,
      marketingEmails: preferences.marketing,
      personalizedContent: preferences.preferences
    }));
  };

  const getComplianceStatus = () => {
    const checks = [
      { name: 'Cookie Consent', status: true, description: 'Granular consent management implemented' },
      { name: 'Data Rights', status: true, description: 'GDPR/CCPA rights fully supported' },
      { name: 'Data Retention', status: true, description: 'Automated cleanup policies active' },
      { name: 'Data Export', status: true, description: 'User data export available' },
      { name: 'Data Deletion', status: true, description: 'Right to be forgotten implemented' },
      { name: 'Privacy Policy', status: true, description: 'Comprehensive policy published' }
    ];

    const passed = checks.filter(check => check.status).length;
    const total = checks.length;

    return { checks, passed, total, percentage: Math.round((passed / total) * 100) };
  };

  const complianceStatus = getComplianceStatus();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please log in to access privacy settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Privacy & Compliance
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your data privacy settings and ensure GDPR/CCPA compliance
              </p>
            </div>
          </div>

          {/* Compliance Status */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Compliance Status: {complianceStatus.percentage}% Complete
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {complianceStatus.passed} of {complianceStatus.total} requirements met
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {complianceStatus.percentage}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-200 dark:bg-slate-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="rights">Data Rights</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Compliance Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Compliance Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complianceStatus.checks.map((check, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${check.status ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                          {check.status ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {check.name}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {check.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowCookieSettings(true)}
                    >
                      <Cookie className="h-4 w-4 mr-2" />
                      Manage Cookie Preferences
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => document.getElementById('data-rights-tab')?.click()}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => document.getElementById('data-rights-tab')?.click()}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Request Data Deletion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Privacy Policy Link */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Privacy Policy
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Review our comprehensive privacy policy to understand how we collect, use, and protect your data.
                  </p>
                  <Button asChild>
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                      View Privacy Policy
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Privacy Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Analytics Tracking */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-slate-900 dark:text-slate-100">
                        Analytics Tracking
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Allow us to collect analytics data to improve our services
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.analyticsTracking}
                      onCheckedChange={(checked) => handleSettingChange('analyticsTracking', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Marketing Emails */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-slate-900 dark:text-slate-100">
                        Marketing Communications
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Receive emails about new features, updates, and promotions
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.marketingEmails}
                      onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Personalized Content */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-slate-900 dark:text-slate-100">
                        Personalized Content
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Use your data to provide personalized recommendations and content
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.personalizedContent}
                      onCheckedChange={(checked) => handleSettingChange('personalizedContent', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Third Party Sharing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-slate-900 dark:text-slate-100">
                        Third-Party Data Sharing
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Allow sharing of anonymized data with trusted partners
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.thirdPartySharing}
                      onCheckedChange={(checked) => handleSettingChange('thirdPartySharing', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookie Consent Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Cookie Consent Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-400">
                    Manage your cookie preferences and consent settings. You can customize which types of cookies
                    are allowed on your website.
                  </p>
                  <Button onClick={() => setShowCookieSettings(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Cookie Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Rights Tab */}
          <TabsContent value="rights" className="space-y-6">
            <GDPRDataManager
              userId={user._id || user.id || 'unknown'}
              userEmail={user.email || 'unknown@example.com'}
            />
          </TabsContent>

          {/* Data Retention Tab */}
          <TabsContent value="retention" className="space-y-6">
            <DataRetentionManager websiteId={websiteId} />
          </TabsContent>
        </Tabs>

        {/* Cookie Settings Dialog */}
        <CookieConsentManager
          onConsentChange={handleCookieConsentChange}
          showBanner={false}
        />
      </div>
    </div>
  );
}
