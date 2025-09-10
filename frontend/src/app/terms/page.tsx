'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, FileText, Calendar, User, Globe } from 'lucide-react';

export default function TermsOfServicePage() {
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
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Terms of Service</h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Please read these terms carefully before using Seentics. By using our service, you agree to be bound by these terms.
            </p>
          </div>

          {/* Last Updated */}
          <Card className="mb-8 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-blue-900 dark:text-blue-100 font-medium">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Terms Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                By accessing and using Seentics ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                Seentics provides website analytics, workflow automation, and AI-powered insights to help businesses optimize their online presence 
                and improve conversion rates. Our service includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Real-time website analytics and visitor tracking</li>
                <li>Workflow automation and funnel creation tools</li>
                <li>AI-powered insights and recommendations</li>
                <li>Performance monitoring and reporting</li>
                <li>Integration with third-party services</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">3. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete 
                information during registration and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding your account credentials and for all activities that occur under your account. 
                You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">4. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">5. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
                which is incorporated into these Terms by reference.
              </p>
              <p>
                By using the Service, you consent to the collection and use of information as detailed in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">6. Subscription and Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                Some features of the Service may require a paid subscription. Subscription fees are billed in advance on a recurring basis. 
                You may cancel your subscription at any time through your account settings.
              </p>
              <p>
                All fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days notice.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">7. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                The Service and its original content, features, and functionality are owned by Seentics and are protected by international 
                copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                You retain ownership of any content you submit to the Service, but grant us a license to use, modify, and display such content 
                in connection with providing the Service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                In no event shall Seentics, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any 
                indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, 
                use, goodwill, or other intangible losses.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, 
                you may simply discontinue using the Service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">10. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
                we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p>
                What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service 
                after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="font-medium">Email: legal@seentics.com</p>
                <p className="font-medium">Support: support@seentics.com</p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12">
            <Link href="/privacy">
              <Button variant="outline" className="mr-4">
                View Privacy Policy
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
