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
    id: 'workflow-concepts',
    title: 'Workflow Concepts',
    subsections: [
        { id: 'triggers', title: 'Triggers' },
        { id: 'conditions', title: 'Conditions' },
        { id: 'actions', title: 'Actions' },
    ]
  },
  {
    id: 'customization',
    title: 'Customization & API',
    subsections: [
      { id: 'identifying-users', title: 'Identifying Users' },
      { id: 'custom-events', title: 'Tracking Custom Events' },
        { id: 'custom-ui', title: 'Custom UI (Modals & Banners)' },
        { id: 'localstorage', title: 'Using localStorage in Actions' },
      { id: 'webhooks', title: 'Using Webhooks' },
      { id: 'dynamic-data', title: 'Using Dynamic Data' },
    ],
  },
  {
    id: 'subscriptions',
    title: 'Subscription & Billing',
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
                <h1 className="font-headline scroll-m-20 text-4xl font-bold tracking-tight">Introduction</h1>
                <p className="leading-7">
                    Welcome to Seentics! Our mission is to empower you to create intelligent, automated workflows that respond to user behavior on your website in real-time. This guide will walk you through everything from installation to building complex workflows and integrating with your own tools.
                </p>
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
                        <pre className="bg-muted p-4 rounded-md text-sm">
                            <code className="text-sm">
                                {`<script async src="${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/tracker.js" data-site-id="YOUR_SITE_ID_HERE"></script>`}
                            </code>
                        </pre>
                    </CardContent>
                </Card>
                 <p className="mt-4">
                    Paste this snippet into the <code>{`<head>`}</code> section of your website's HTML. Once the script is added, Seentics will immediately begin tracking visitors and become ready to execute any active workflows you've created for that site.
                </p>
            </section>

             <section id="workflow-concepts">
                <h2 className="font-headline scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Workflow Concepts</h2>
                <p>Workflows are the heart of Seentics. They are composed of three fundamental building blocks: Triggers, Conditions, and Actions. Understanding how these interact is key to mastering the platform.</p>
                
                <div id="triggers" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Triggers: The "When"</h3>
                    <p>Triggers are the events that initiate a workflow. They are the "when" something should happen. A workflow can have multiple triggers; it will start if any one of them occurs.</p>
                    <ul className="list-disc pl-6">
                        <li><strong>Page View</strong>: Fires as soon as a user lands on a page.</li>
                        <li><strong>Time Spent</strong>: Fires after a user has been on a page for a specified number of seconds.</li>
                        <li><strong>Exit Intent</strong>: Fires when a user's mouse moves towards the top of the browser window, indicating they are about to leave.</li>
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
                    <p>Actions are the final step. They define what the workflow actually does when the trigger fires and all conditions are met.</p>
                     <ul className="list-disc pl-6">
                        <li><strong>Show Modal</strong>: Displays a popup modal with a title and content.</li>
                        <li><strong>Show Banner</strong>: Displays a dismissible banner at the top of the page.</li>
                        <li><strong>Add/Remove Tag (Server-Side)</strong>: Securely adds or removes a tag from a visitor's profile in your database.</li>
                        <li><strong>Send Email (Server-Side)</strong>: Sends an email from your server. This is secure and reliable. It can be sent to the visitor or to a custom address for notifications.</li>
                        <li><strong>Webhook (Server-Side)</strong>: Sends data to an external URL, allowing you to integrate with other services.</li>
                    </ul>
                </div>
            </section>

            <section id="customization">
                <h2 className="font-headline scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Customization & API</h2>
                 <div id="identifying-users" className="scroll-m-20">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Identifying Users</h3>
                    <p>
                        To truly personalize workflows, you need to tell Seentics who your users are. By default, visitors are anonymous. The most reliable method is to call a JavaScript function from your website's code, typically after a user logs in or signs up.
                    </p>
                     <p>This function call holds the user's data in memory for the current page view only and <strong>does not store it in `localStorage`</strong>, ensuring better security.</p>
                     <Card>
                        <CardContent className="p-4">
                            <pre><code className="text-sm">window.seentics.identify('YOUR_USER_ID', {'{ email: "user@example.com", name: "Jane Doe" }'});</code></pre>
                        </CardContent>
                    </Card>
                    <p className="mt-4">
                       The first argument is the user's unique ID from your database. The second is an object of attributes. This identified information will be automatically used by server-side actions like "Send Email" (to set the recipient) and included in "Webhook" payloads.
                    </p>
                </div>
                 <div id="custom-events" className="scroll-m-20 mt-8">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Tracking Custom Events</h3>
                    <p>
                       You can track any action that isn't a standard page view or click. This is perfect for things like form submissions, video plays, or other unique interactions. To do this, you track a custom event from your site's code.
                    </p>
                     <Card>
                        <CardContent className="p-4">
                            <pre><code className="text-sm">window.seentics.track('your_custom_event_name');</code></pre>
                        </CardContent>
                    </Card>
                    <h4>Example: Tracking a custom "video-played" event</h4>
                    <pre><code className="text-sm">{`
// Get your video element
const videoPlayer = document.getElementById('product-demo-video');

// Add an event listener
videoPlayer.addEventListener('play', function() {
  // Send the event to Seentics when the video starts playing
  window.seentics.track('video-played');
});
                    `}</code></pre>
                     <h4 className="mt-4">Tracking Pre-configured Conversion Events</h4>
                     <p>
                        To make things even easier, you can use our pre-configured event names to automatically track primary conversion goals. Using the <code>conversion:</code> prefix will count the event towards your main dashboard metrics.
                    </p>
                     <Card>
                        <CardContent className="p-4">
                            <ul className="list-disc pl-5 my-0">
                                <li><strong>User Signed Up:</strong> <code>seentics.track('conversion:signup');</code></li>
                                <li><strong>Made Purchase:</strong> <code>seentics.track('conversion:purchase');</code></li>
                                <li><strong>Newsletter Signup:</strong> <code>seentics.track('conversion:newsletter-signup');</code></li>
                                <li><strong>Contact Form Submitted:</strong> <code>seentics.track('conversion:contact-submit');</code></li>
                            </ul>
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
                          <pre className="bg-muted p-3 rounded-md text-sm overflow-auto"><code>{`<div class="banner">
  <div class="banner-content">
    <h1>Create Something <span class="highlight">Amazing</span></h1>
    <p class="subtitle">Transform your ideas into reality</p>
    <button id="primaryBtn">Get Started</button>
  </div>
</div>`}</code></pre>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Custom CSS</div>
                          <pre className="bg-muted p-3 rounded-md text-sm overflow-auto"><code>{`html, body { margin: 0; padding: 0; }
.banner { width: 100vw; min-height: 40vh; display: grid; place-items: center; background: linear-gradient(135deg,#667eea,#764ba2); }
.banner-content { max-width: none; padding: 0 1rem; text-align: center; color: #fff; }
.highlight { color: #ffd93d; }`}</code></pre>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Custom JS</div>
                          <pre className="bg-muted p-3 rounded-md text-sm overflow-auto"><code>{`document.getElementById('primaryBtn')?.addEventListener('click', () => {
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
                         <pre className="bg-muted p-3 rounded-md text-sm overflow-auto"><code>{`localStorage.setItem('cartId', 'CART_12345');
localStorage.setItem('userPlan', 'pro');`}</code></pre>
                       </div>
                       <div>
                         <div className="text-sm font-semibold">Reference in Actions</div>
                         <pre className="bg-muted p-3 rounded-md text-sm overflow-auto"><code>{`Subject:  "Order {{cartId}} is pending"
Webhook JSON: { "plan": "{{userPlan}}" }`}</code></pre>
                       </div>
                       <p className="text-sm text-muted-foreground">You can also use identified user fields: <code>{`{{identifiedUser.id}}`}</code>, <code>{`{{identifiedUser.attributes.email}}`}</code> when calling <code>seentics.identify()</code>.</p>
                     </CardContent>
                   </Card>
                   <p className="text-sm text-muted-foreground mt-2">Implementation verified: client collects keys in <code>workflow-tracker.js</code>, server receives them in the execution payload, and actions resolve placeholders using <code>localStorageData</code> and <code>identifiedUser</code>.</p>
                 </section>

                 <div id="webhooks" className="scroll-m-20 mt-8">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Using Webhooks</h3>
                    <p>
                        The "Webhook" action is the primary tool for sending data from your workflows to other services (like Zapier, Make, or your own backend). When a workflow executes a Webhook action, Seentics will send a `POST` request to the URL you specify with a JSON payload containing all available data about the user and event.
                    </p>
                    <p>
                        To send tag or other event information to your backend, you should chain a "Webhook" action after the "Add/Remove Tag" action in your workflow.
                    </p>
                </div>
                <div id="dynamic-data" className="scroll-m-20 mt-8">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight">Using Dynamic Data</h3>
                    <p>
                        Server-side actions like "Send Email" and "Webhook" can be personalized with data from the user's browser `localStorage`. This is useful for including dynamic information like a cart ID, a username, or other details your application stores locally.
                    </p>
                    <p>In the settings for a server action, you can map a `localStorage` key to a `payloadKey`. You can then use this `payloadKey` in your action's text fields (like an email subject) using placeholders, like <code>{"{{payloadKey}}"}</code>. This will be replaced with the actual value from the user's `localStorage` at the time of execution.</p>
                </div>
            </section>
            
            <section id="subscriptions">
                <h2 className="font-headline scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Subscription & Billing</h2>
                <p>
                    Seentics's billing is handled via Lemon Squeezy. The application is fully set up to handle subscription states based on data in your Firestore database. To make this fully functional, you need to set up a webhook in your Lemon Squeezy account to send subscription events to your application.
                </p>
                <p>
                    A complete, step-by-step guide on how to create the webhook handler and what data structure to use is available in the <code>LEMON_SQUEEZY.md</code> file in the project root. This guide contains the exact code needed for the webhook API route.
                </p>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}