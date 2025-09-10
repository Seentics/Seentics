'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Eye, Database, Globe, Mail, Phone } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/signin">
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-white/80 dark:hover:bg-slate-800/80">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Button>
        </Link>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100/30 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Privacy Policy</h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.
            </p>
          </div>

          {/* Last Updated */}
          <Card className="mb-8 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="text-blue-900 dark:text-blue-100 font-medium">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We collect several types of information to provide and improve our services:</p>
              
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-4">Personal Information:</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name and email address when you create an account</li>
                <li>Profile information and preferences</li>
                <li>Communication history with our support team</li>
                <li>Payment and billing information</li>
              </ul>

              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-4">Website Analytics Data:</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Visitor behavior and interactions</li>
                <li>Page views and session duration</li>
                <li>Traffic sources and referral information</li>
                <li>Device and browser information</li>
                <li>Geographic location data (country/city level)</li>
              </ul>

              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-4">Technical Information:</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP addresses and device identifiers</li>
                <li>Browser type and version</li>
                <li>Operating system information</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage subscriptions</li>
                <li>Send important service updates and notifications</li>
                <li>Respond to customer support requests</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our business</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> When you explicitly authorize us to share specific information</li>
              </ul>
              <p className="mt-4">
                All third-party service providers are contractually obligated to protect your information and use it only for specified purposes.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We implement appropriate technical and organizational measures to protect your information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p className="mt-4">
                While we strive to protect your information, no method of transmission over the internet is 100% secure. 
                We cannot guarantee absolute security but are committed to maintaining the highest standards of data protection.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">5. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We use cookies and similar technologies to enhance your experience:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our service</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
              </ul>
              <p className="mt-4">
                You can control cookie settings through our Cookie Consent Manager or your browser preferences. 
                Note that disabling certain cookies may affect service functionality.
              </p>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Cookie Consent Management</h5>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  We provide granular control over cookie preferences. You can manage your consent settings at any time 
                  through our privacy dashboard, including the ability to withdraw consent for specific cookie categories.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">6. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdraw Consent:</strong> Revoke consent for marketing communications</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">7. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We retain your information for as long as necessary to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records</li>
              </ul>
              <p className="mt-4">
                When you delete your account, we will delete or anonymize your personal information within 30 days, 
                except where retention is required by law or for legitimate business purposes.
              </p>
              
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">Automated Data Cleanup</h5>
                <p className="text-sm text-green-800 dark:text-green-200">
                  We implement automated data retention policies that automatically clean up old data according to 
                  GDPR and CCPA requirements. Analytics data is retained for 2 years, session data for 1 year, 
                  and workflow execution logs for 6 months.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">8. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure that such transfers comply with applicable data protection laws and implement 
                appropriate safeguards to protect your information.
              </p>
              <p className="mt-4">
                For users in the European Economic Area (EEA), we ensure adequate protection through 
                standard contractual clauses and other approved mechanisms.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you become aware that a child has provided 
                us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">10. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
              <p className="mt-4">
                We encourage you to review this policy periodically to stay informed about how we protect your information.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Email: privacy@seentics.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Phone: +1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Website: www.seentics.com</span>
                </div>
              </div>
              <p className="mt-4">
                For data protection inquiries, you can also contact our Data Protection Officer at: dpo@seentics.com
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12">
            <Link href="/terms">
              <Button variant="outline" className="mr-4">
                View Terms of Service
              </Button>
            </Link>
            <Link href="/signin">
              <Button>
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
