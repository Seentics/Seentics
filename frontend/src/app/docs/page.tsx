'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Code, Workflow, BarChart, Settings, LifeBuoy, Zap, User, Filter, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Logo } from '@/components/ui/logo';

const docsSections = [
  {
    id: 'introduction',
    title: 'Introduction',
  },
  {
    id: 'installation',
    title: 'Installation',
  },
  {
    id: 'funnels',
    title: 'Funnels',
    subsections: [
      { id: 'funnel-creation', title: 'Creating Funnels' },
      { id: 'funnel-tracking', title: 'Funnel Tracking' },
      { id: 'funnel-analytics', title: 'Analytics & Insights' },
    ]
  },
  {
    id: 'workflow-concepts',
    title: 'Workflows',
    subsections: [
        { id: 'triggers', title: 'Triggers' },
        { id: 'conditions', title: 'Conditions' },
        { id: 'actions', title: 'Actions' },
        { id: 'funnel-triggers', title: 'Funnel Triggers' },
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subsections: [
      { id: 'visitor-tracking', title: 'Visitor Tracking' },
      { id: 'custom-events', title: 'Custom Events' },
      { id: 'real-time-data', title: 'Real-time Data' },
    ]
  },
  {
    id: 'customization',
    title: 'API & Customization',
    subsections: [
      { id: 'identifying-users', title: 'Identifying Users' },
      { id: 'tracking-events', title: 'Tracking Events' },
        { id: 'custom-ui', title: 'Custom UI (Modals & Banners)' },
        { id: 'localstorage', title: 'Using localStorage' },
      { id: 'webhooks', title: 'Webhooks' },
      { id: 'api-reference', title: 'API Reference' },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Compliance',
    subsections: [
      { id: 'gdpr', title: 'GDPR Compliance' },
      { id: 'data-retention', title: 'Data Retention' },
      { id: 'cookie-consent', title: 'Cookie Consent' },
    ]
  },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <Logo size="lg" showText={true} textClassName="font-headline text-2xl font-bold" />
            </Link>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </header>
      

      <div className="container mx-auto flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:gap-10">
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block md:w-[240px]">
          <div className="relative h-full overflow-y-auto py-6 pr-6 lg:py-8">
            <nav>
              <ul className="space-y-3">
                {docsSections.map(section => (
                  <li key={section.id}>
                      <a href={`#${section.id}`} className="font-semibold text-lg hover:text-primary transition-colors">
                          {section.title}
                      </a>
                      {section.subsections && (
                          <ul className="mt-2 space-y-2 border-l-2 border-muted pl-4">
                              {section.subsections.map(sub => (
                                  <li key={sub.id}>
                                      <a href={`#${sub.id}`} className="text-muted-foreground hover:text-primary transition-colors">
                                          {sub.title}
                                      </a>
                                  </li>
                              ))}
                          </ul>
                      )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <main className="relative py-6 lg:py-8">
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
            <section id="introduction">
                <h1 className="font-headline scroll-m-20 text-4xl font-bold tracking-tight">Seentics Documentation</h1>
                <p className="leading-7">
                    Welcome to Seentics - a comprehensive analytics and workflow automation platform. Track visitor behavior, create conversion funnels, and automate responses with intelligent workflows. This guide covers everything from basic setup to advanced integrations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Analytics</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Real-time visitor tracking, custom events, and performance insights</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold">Funnels</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Sequential conversion tracking with dropoff analysis</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Workflow className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold">Workflows</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Automated responses to user behavior and funnel events</p>
                  </Card>
                </div>
            </section>

             <section id="installation">
                <h2 className="font-headline scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Installation</h2>
                <p>
                    Getting Seentics onto your website is incredibly simple. All it takes is a single line of code.
                </p>
                <ol>
                    <li>Navigate to the <Link href="/websites">Websites</Link> page in your Seentics dashboard.</li>
                    <li>For your desired website, click the "Tracking Code" button.</li>
                    <li>Copy the provided script tag. It will look something like this:</li>
                </ol>
                <Card>
                    <CardContent className="p-4">
                        <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm overflow-auto"><code className="text-slate-800 dark:text-slate-200">{`<!-- Add this before closing </head> tag -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/trackers/funnel-tracker.js';
    script.async = true;
    script.onload = function() {
      window.seentics.init({
        websiteId: 'YOUR_WEBSITE_ID',
        apiUrl: '${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api'
      });
    };
    document.head.appendChild(script);
  })();
</script>`}</code></pre>
                    </CardContent>
                </Card>
                 <p className="mt-4">
                    Paste this snippet into the <code>{`<head>`}</code> section of your website's HTML. Once the script is added, Seentics will immediately begin tracking visitors and become ready to execute any active workflows you've created for that site.
                </p>
            </section>

            <section id="funnels">
                <h2 className="font-headline scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Funnels</h2>
                <p>Funnels help you track user journeys through specific conversion paths on your website. Monitor where users drop off and optimize your conversion rates.</p>
                
                <div id="funnel-creation" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Creating Funnels</h3>
                    <p>Create multi-step funnels to track user progression through your conversion process:</p>
                    <ol className="list-decimal pl-6">
                        <li>Go to your website's Funnels page</li>
                        <li>Click "Create Funnel" and give it a descriptive name</li>
                        <li>Add steps by defining page URLs or custom events</li>
                        <li>Set up step conditions (exact match, contains, starts with)</li>
                        <li>Activate the funnel to start tracking</li>
                    </ol>
                </div>

                <div id="funnel-tracking" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Funnel Tracking</h3>
                    <p>Seentics automatically tracks funnel progression with sequential validation:</p>
                    <ul className="list-disc pl-6">
                        <li><strong>Sequential progression</strong>: Users must complete steps in order</li>
                        <li><strong>Dropoff detection</strong>: Tracks when users leave the funnel</li>
                        <li><strong>Conversion tracking</strong>: Measures completion rates for each step</li>
                        <li><strong>Real-time monitoring</strong>: See funnel performance as it happens</li>
                    </ul>
                </div>

                <div id="funnel-analytics" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Analytics & Insights</h3>
                    <p>Get detailed insights into funnel performance:</p>
                    <ul className="list-disc pl-6">
                        <li><strong>Step-by-step breakdown</strong>: See completion rates for each step</li>
                        <li><strong>Daily performance</strong>: Track conversion trends over time</li>
                        <li><strong>Dropoff analysis</strong>: Identify where users are getting stuck</li>
                        <li><strong>Conversion optimization</strong>: Use data to improve your funnels</li>
                    </ul>
                </div>
            </section>

             <section id="workflow-concepts">
                <h2 className="font-headline scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Workflows</h2>
                <p>Workflows automate responses to user behavior. They consist of Triggers, Conditions, and Actions that work together to create intelligent automations.</p>
                
                <div id="triggers" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Triggers: The "When"</h3>
                    <p>Triggers are the events that initiate a workflow. They are the "when" something should happen.</p>
                    <ul className="list-disc pl-6">
                        <li><strong>Page View</strong>: Fires when a user lands on a page</li>
                        <li><strong>Element Click</strong>: Fires when a user clicks a specific element</li>
                        <li><strong>Time Spent</strong>: Fires after a user has been on a page for specified seconds</li>
                        <li><strong>Exit Intent</strong>: Fires when mouse moves toward browser top (leaving)</li>
                        <li><strong>Funnel</strong>: Fires on funnel events (dropoff or conversion)</li>
                    </ul>
                </div>

                <div id="conditions" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Conditions: The "If"</h3>
                    <p>Conditions are rules that must be met for a workflow to proceed. They are the "if" statement in your automation. If a condition fails, the workflow stops at that point for that specific user session.</p>
                    <ul className="list-disc pl-6">
                        <li><strong>URL Path</strong>: Checks if the user is on a specific page or section of your site (e.g., URL contains `/checkout`).</li>
                        <li><strong>Device Type</strong>: Checks if the user is on a desktop or mobile device.</li>
                        <li><strong>New vs. Returning Visitor</strong>: Checks if it's the user's first time visiting your site.</li>
                         <li><strong>Tag</strong>: Checks if the visitor has a specific tag that was applied in another workflow.</li>
                    </ul>
                </div>

                 <div id="actions" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Actions: The "What"</h3>
                    <p>Actions define what happens when triggers fire and conditions are met.</p>
                     <ul className="list-disc pl-6">
                        <li><strong>Show Modal</strong>: Display popup modal with custom content</li>
                        <li><strong>Show Banner</strong>: Display banner at top or bottom of page</li>
                        <li><strong>Track Event</strong>: Send custom event to analytics</li>
                        <li><strong>Webhook</strong>: Send data to external URL for integrations</li>
                        <li><strong>Redirect URL</strong>: Navigate user to different page</li>
                    </ul>
                </div>

                <div id="funnel-triggers" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Funnel Triggers</h3>
                    <p>Funnel triggers allow workflows to respond to specific funnel events:</p>
                    <ul className="list-disc pl-6">
                        <li><strong>Dropoff</strong>: Triggers when a user leaves a funnel without completing it</li>
                        <li><strong>Conversion</strong>: Triggers when a user successfully completes a funnel</li>
                    </ul>
                    <p>Use funnel triggers to create targeted responses like exit-intent offers for dropoffs or thank-you messages for conversions.</p>
                </div>
            </section>

            <section id="analytics">
                <h2 className="font-headline scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Analytics</h2>
                
                <div id="visitor-tracking" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Visitor Tracking</h3>
                    <p>Seentics automatically tracks visitor behavior once the tracking script is installed:</p>
                    <ul className="list-disc pl-6">
                        <li><strong>Page views</strong>: Every page visit with URL and timestamp</li>
                        <li><strong>Session tracking</strong>: Groups page views into user sessions</li>
                        <li><strong>Device detection</strong>: Mobile, tablet, or desktop classification</li>
                        <li><strong>Traffic sources</strong>: Referrer and UTM parameter tracking</li>
                        <li><strong>Geographic data</strong>: Country and region information</li>
                    </ul>
                </div>

                <div id="custom-events" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Custom Events</h3>
                    <p>Track specific user actions beyond page views:</p>
                    <Card>
                        <CardContent className="p-4">
                            <pre><code className="text-sm">window.seentics.track('button_click');</code></pre>
                        </CardContent>
                    </Card>
                    <p>Common event examples:</p>
                    <ul className="list-disc pl-6">
                        <li><code>form_submit</code> - Form submissions</li>
                        <li><code>video_play</code> - Video interactions</li>
                        <li><code>download_start</code> - File downloads</li>
                        <li><code>signup_complete</code> - User registrations</li>
                    </ul>
                </div>

                <div id="real-time-data" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Real-time Data</h3>
                    <p>View analytics data as it happens:</p>
                    <ul className="list-disc pl-6">
                        <li><strong>Live visitor count</strong>: See current active users</li>
                        <li><strong>Real-time events</strong>: Track events as they occur</li>
                        <li><strong>Funnel progression</strong>: Monitor conversions in real-time</li>
                        <li><strong>Workflow triggers</strong>: See automations as they execute</li>
                    </ul>
                </div>
            </section>

            <section id="customization">
                <h2 className="font-headline scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">API & Customization</h2>
                
                <div id="identifying-users" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Identifying Users</h3>
                    <p>Associate visitor data with known users for personalized experiences:</p>
                    <Card>
                        <CardContent className="p-4">
                            <pre><code className="text-sm">window.seentics.identify('user_123', {'{'}
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium'
{'}'});</code></pre>
                        </CardContent>
                    </Card>
                    <p>This data is used in workflows and webhook payloads for personalization.</p>
                </div>

                <div id="tracking-events" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Tracking Events</h3>
                    <p>Send custom events with additional data:</p>
                    <Card>
                        <CardContent className="p-4">
                            <pre><code className="text-sm">window.seentics.track('purchase', {'{'}
  value: 99.99,
  currency: 'USD',
  product_id: 'prod_123'
{'}'});</code></pre>
                        </CardContent>
                    </Card>
                </div>

                 <div id="custom-ui" className="scroll-m-20 mt-8">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Custom UI (Modals & Banners)</h3>
                    <p>
                      For fully custom experiences, use the "Show Modal" or "Show Banner" actions with <strong>Display Mode = Custom</strong>. We render your HTML/CSS/JS inside an isolated iframe so your animations and scripts work reliably without affecting the host page.
                    </p>
                    <h4 className="mt-4">What you can provide</h4>
                    <ul className="list-disc pl-6">
                      <li><strong>Custom HTML</strong>: Provide a complete snippet or a full HTML. We automatically extract the body.</li>
                      <li><strong>Custom CSS</strong>: Paste styles, including keyframes and media queries.</li>
                      <li><strong>Custom JS</strong>: Vanilla JS; runs when the iframe loads.</li>
                    </ul>
                    <h4 className="mt-4">Notes</h4>
                    <ul className="list-disc pl-6">
                      <li>Iframe sandbox allows scripts and same-origin for functionality while isolating styles from the host.</li>
                      <li>We auto-resize the iframe to match content height for banners.</li>
                      <li>Close button is overlayed outside the iframe for consistent UX.</li>
                    </ul>
                    <h4 className="mt-4">Example: Custom Banner</h4>
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <div className="text-sm font-semibold">Custom HTML</div>
                          <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm overflow-auto"><code className="text-slate-800 dark:text-slate-200">{`<div class="banner">
  <div class="banner-content">
    <h1>Create Something <span class="highlight">Amazing</span></h1>
    <p class="subtitle">Transform your ideas into reality</p>
    <button id="primaryBtn">Get Started</button>
  </div>
</div>`}</code></pre>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Custom CSS</div>
                          <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm overflow-auto"><code className="text-slate-800 dark:text-slate-200">{`html, body { margin: 0; padding: 0; }
.banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
  font-family: 'Arial', sans-serif;
}
.banner-content h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: bold;
}
.highlight {
  color: #ffd700;
}
.subtitle {
  font-size: 1.2rem;
  margin: 0 0 30px 0;
  opacity: 0.9;
}
#primaryBtn {
  background: #ffd700;
  color: #333;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}
#primaryBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}`}</code></pre>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Custom JS</div>
                          <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm overflow-auto"><code className="text-slate-800 dark:text-slate-200">{`document.getElementById('primaryBtn')?.addEventListener('click', () => {
  window.parent?.postMessage({ type: 'banner_cta_click' }, '*');
});`}</code></pre>
                        </div>
                        <p className="text-sm text-muted-foreground">Tip: Track CTA clicks by listening for the posted message in the host page or trigger a workflow Custom Event from your own code.</p>
                      </CardContent>
                    </Card>
                 </div>

                 <section id="localstorage" className="scroll-m-20 mt-8">
                   <h3 className="font-headline text-2xl font-semibold tracking-tight">Using localStorage in Actions</h3>
                   <p>
                     Actions such as <strong>Send Email</strong>, <strong>Webhook</strong>, <strong>Show Modal/Banner (custom)</strong>, and <strong>Insert Section</strong> can read values from your site's <code>localStorage</code> and inject them into action fields via placeholders.
                   </p>
                   <ol className="list-decimal pl-6">
                     <li>In the action settings, add localStorage keys (e.g., <code>cartId</code>, <code>userPlan</code>).</li>
                     <li>Use placeholders like <code>{`{{cartId}}`}</code> or <code>{`{{userPlan}}`}</code> in Subject, Body, or Webhook JSON.</li>
                   </ol>
                   <Card className="mt-3">
                     <CardContent className="p-4 space-y-3">
                       <div>
                         <div className="text-sm font-semibold">Save values in your app</div>
                         <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm overflow-auto"><code className="text-slate-800 dark:text-slate-200">{`localStorage.setItem('cartId', 'CART_12345');
localStorage.setItem('userPlan', 'pro');`}</code></pre>
                       </div>
                       <div>
                         <div className="text-sm font-semibold">Reference in Actions</div>
                         <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm overflow-auto"><code className="text-slate-800 dark:text-slate-200">{`Subject:  "Order {{cartId}} is pending"
Webhook JSON: { "plan": "{{userPlan}}" }`}</code></pre>
                       </div>
                       <p className="text-sm text-muted-foreground">You can also use identified user fields: <code>{`{{identifiedUser.id}}`}</code>, <code>{`{{identifiedUser.attributes.email}}`}</code> when calling <code>seentics.identify()</code>.</p>
                     </CardContent>
                   </Card>
                   <p className="text-sm text-muted-foreground mt-2">Implementation verified: client collects keys in <code>workflow-tracker.js</code>, server receives them in the execution payload, and actions resolve placeholders using <code>localStorageData</code> and <code>identifiedUser</code>.</p>
                 </section>

                <div id="webhooks" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Webhooks</h3>
                    <p>Send workflow data to external services using webhook actions:</p>
                    <Card>
                        <CardContent className="p-4">
                            <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm overflow-auto"><code className="text-slate-800 dark:text-slate-200">{`{
  "event": "webhook_triggered",
  "workflow_id": "workflow_123",
  "trigger_type": "funnel",
  "visitor": {
    "id": "visitor_456",
    "session_id": "session_789",
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1",
    "referrer": "https://google.com",
    "identified_user": {
      "id": "user_123",
      "email": "user@example.com",
      "plan": "premium"
    }
  },
  "trigger_data": {
    "funnel_id": "funnel_abc",
    "event_type": "conversion",
    "step_name": "Purchase Complete"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`}</code></pre>
                        </CardContent>
                    </Card>
                </div>

                <div id="api-reference" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">API Reference</h3>
                    <p>Available JavaScript methods on your website:</p>
                    <ul className="list-disc pl-6">
                        <li><code>window.seentics.track(eventName, data)</code> - Track custom events</li>
                        <li><code>window.seentics.identify(userId, attributes)</code> - Identify users</li>
                        <li><code>window.seentics.funnelTracker.trackFunnelStep(funnelId, stepNumber)</code> - Manual funnel tracking</li>
                        <li><code>window.seentics.funnelTracker.trackFunnelConversion(funnelId, value)</code> - Track conversions</li>
                    </ul>
                </div>
            </section>

            <section id="privacy">
                <h2 className="font-headline scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Privacy & Compliance</h2>
                
                <div id="gdpr" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">GDPR Compliance</h3>
                    <p>Seentics includes built-in GDPR compliance features:</p>
                    <ul className="list-disc pl-6">
                        <li><strong>Data export</strong>: Users can request their data in JSON format</li>
                        <li><strong>Data deletion</strong>: Complete removal of user data on request</li>
                        <li><strong>Consent management</strong>: Cookie consent integration</li>
                        <li><strong>Privacy controls</strong>: Granular data collection settings</li>
                    </ul>
                </div>

                <div id="data-retention" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Data Retention</h3>
                    <p>Configure how long visitor data is stored:</p>
                    <ul className="list-disc pl-6">
                        <li>Default retention: 2 years for analytics data</li>
                        <li>Custom retention periods available</li>
                        <li>Automatic data cleanup and archiving</li>
                        <li>Export before deletion options</li>
                    </ul>
                </div>

                <div id="cookie-consent" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Cookie Consent</h3>
                    <p>Seentics respects user privacy preferences:</p>
                    <ul className="list-disc pl-6">
                        <li>No tracking without consent</li>
                        <li>Minimal essential cookies only</li>
                        <li>Easy consent withdrawal</li>
                        <li>Transparent data usage</li>
                    </ul>
                </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}