
'use server';

// Types for the AI Assistant
export interface LandingPageAssistantInput {
    message: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface LandingPageAssistantOutput {
    response: string;
    suggestions?: string[];
}

// AI Knowledge Base for Seentics
const SEENTICS_KNOWLEDGE = {
    pricing: {
        free: "**Free Plan** - Perfect for getting started: 1 website, 5 workflows, 10K monthly events, and basic analytics. No credit card required!",
        standard: "**Standard Plan** ($29/month) - For growing businesses: 10 websites, 50 workflows, 250K monthly events, AI Assistant, and priority email support.",
        pro: "**Pro Plan** ($99/month) - For established businesses: 25 websites, 200 workflows, 1M monthly events, advanced integrations, and dedicated support.",
        enterprise: "**Enterprise Plan** ($299/month) - For large organizations: 50 websites, 500 workflows, 5M monthly events, custom integrations, and priority phone support."
    },
    features: {
        analytics: "**Privacy-First Analytics** - Track visitors without cookies, GDPR-compliant, real-time insights, conversion funnels, and heatmaps.",
        workflows: "**Smart Workflow Automation** - Create automated sequences that trigger actions based on visitor behavior, like sending emails, showing popups, or adding tags.",
        ai: "**AI-Powered Insights** - Machine learning algorithms help you understand visitor patterns, predict behavior, and optimize your website for better conversions.",
        privacy: "**Enterprise-Grade Privacy** - GDPR, CCPA, and SOC 2 compliant. No cookies required, data processed in real-time, and stored securely in your region."
    },
    integrations: "**Universal Integration** - Works with any website platform: WordPress plugin, Shopify app, custom websites via tracking script, REST API, and webhook support.",
    support: "**Multi-Level Support** - Community support for all users, email support for Standard+ plans, priority support for Pro+ plans, and dedicated account managers for Enterprise."
};

// Simple AI Response Generator
function generateAIResponse(message: string, conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []): LandingPageAssistantOutput {
    const lowerMessage = message.toLowerCase();
    
    // Extract context from conversation history
    const recentContext = conversationHistory.slice(-3).map(msg => msg.content.toLowerCase()).join(' ');
    
    // Generate contextual response
    let response = "";
    let suggestions: string[] = [];
    
    if (lowerMessage.includes('pricing') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan')) {
        response = "💰 **Seentics Pricing Plans**\n\n";
        response += `• ${SEENTICS_KNOWLEDGE.pricing.free}\n`;
        response += `• ${SEENTICS_KNOWLEDGE.pricing.standard}\n`;
        response += `• ${SEENTICS_KNOWLEDGE.pricing.pro}\n`;
        response += `• ${SEENTICS_KNOWLEDGE.pricing.enterprise}\n\n`;
        response += "🎯 **All paid plans include:**\n";
        response += "• 14-day free trial (no credit card required)\n";
        response += "• 30-day money-back guarantee\n";
        response += "• Priority email support\n";
        response += "• Advanced analytics & workflows\n\n";
        response += "💡 **Pro tip:** Start with the free plan to see Seentics in action!";
        
        suggestions = ["What's included in the Pro plan?", "Do you offer annual discounts?", "Can I upgrade my plan later?", "Tell me about the free trial"];
    }
    else if (lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('capability')) {
        response = "⚡ **Seentics Core Features**\n\n";
        response += `• ${SEENTICS_KNOWLEDGE.features.analytics}\n`;
        response += `• ${SEENTICS_KNOWLEDGE.features.workflows}\n`;
        response += `• ${SEENTICS_KNOWLEDGE.features.ai}\n`;
        response += `• ${SEENTICS_KNOWLEDGE.features.privacy}\n\n`;
        response += "🚀 **Why choose Seentics?**\n";
        response += "• No coding required - visual workflow builder\n";
        response += "• Real-time processing and insights\n";
        response += "• Enterprise-grade security and privacy\n";
        response += "• Scalable from startup to enterprise\n\n";
        response += "Would you like me to explain any specific feature in detail?";
        
        suggestions = ["Tell me about workflows", "How does the AI work?", "What about privacy compliance?", "Show me analytics features"];
    }
    else if (lowerMessage.includes('workflow') || lowerMessage.includes('automation')) {
        response = "🔄 **Smart Workflow Automation**\n\n";
        response += "**What are workflows?**\n";
        response += "Workflows are automated sequences that trigger actions based on visitor behavior. Think of them as your website's personal assistant!\n\n";
        response += "**Popular Workflow Templates:**\n";
        response += "• 🎯 **Welcome Series** - Send personalized emails to new visitors\n";
        response += "• 🛒 **Abandoned Cart Recovery** - Remind visitors about items they left behind\n";
        response += "• 🌱 **Lead Nurturing** - Follow up with potential customers\n";
        response += "• ⬆️ **Upselling** - Recommend related products or upgrades\n";
        response += "• 🎉 **Onboarding** - Guide new users through your platform\n\n";
        response += "**How it works:**\n";
        response += "1. **Set Triggers** - Page views, time spent, clicks, etc.\n";
        response += "2. **Add Conditions** - Device type, location, behavior patterns\n";
        response += "3. **Choose Actions** - Emails, popups, tags, webhooks\n\n";
        response += "You can create workflows using our visual builder - no coding required!";
        
        suggestions = ["How do I create a workflow?", "What triggers are available?", "Can I integrate with my email service?", "Show me workflow examples"];
    }
    else if (lowerMessage.includes('analytics') || lowerMessage.includes('tracking') || lowerMessage.includes('data')) {
        response = "📊 **Privacy-First Analytics & Tracking**\n\n";
        response += "**Real-Time Insights:**\n";
        response += "• 👥 **Visitor Tracking** - See who visits your site in real-time\n";
        response += "• 📈 **Conversion Funnels** - Identify where visitors drop off\n";
        response += "• 🗺️ **Heatmaps** - Visualize where visitors click and scroll\n";
        response += "• 🎯 **Custom Events** - Track specific interactions and goals\n";
        response += "• 📱 **Device Analytics** - Understand mobile vs desktop behavior\n\n";
        response += "**Privacy & Compliance:**\n";
        response += "• 🛡️ **GDPR & CCPA Compliant** - No cookies required\n";
        response += "• 🔒 **Data Security** - SOC 2 certified, encrypted storage\n";
        response += "• 🌍 **Regional Compliance** - Data stored in your region\n";
        response += "• 👤 **Visitor Privacy** - No personal data collection\n\n";
        response += "All data is processed in real-time and stored securely with enterprise-grade encryption.";
        
        suggestions = ["How do I install tracking?", "What data do you collect?", "Can I export my data?", "Tell me about privacy features"];
    }
    else if (lowerMessage.includes('trial') || lowerMessage.includes('free') || lowerMessage.includes('start')) {
        response = "🚀 **Getting Started with Seentics**\n\n";
        response += "**Quick Setup (2 minutes):**\n";
        response += "1. 🆓 **Sign up** for a free account (no credit card required)\n";
        response += "2. 📝 **Add your website** and get your tracking code\n";
        response += "3. 🔧 **Install tracking** by adding our script to your website\n";
        response += "4. 📊 **Start tracking** visitors and collecting data\n";
        response += "5. ⚡ **Create workflows** to automate visitor engagement\n";
        response += "6. 🚀 **Upgrade anytime** to unlock advanced features\n\n";
        response += "**Free Plan Includes:**\n";
        response += "• 1 website with unlimited visitors\n";
        response += "• 5 active workflows\n";
        response += "• 10K monthly events\n";
        response += "• Basic analytics dashboard\n";
        response += "• Community support\n\n";
        response += "🎯 **Ready to transform your website?** Start with our free plan today!";
        
        suggestions = ["How do I sign up?", "What's the installation process?", "Can I try paid features?", "Show me the dashboard"];
    }
    else if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('contact')) {
        response = "🆘 **We're Here to Help You Succeed!**\n\n";
        response += "**Support Tiers:**\n";
        response += "• 🆓 **Community Support** - Available for all users (forums, docs)\n";
        response += "• 📧 **Email Support** - Standard+ plans get priority email support\n";
        response += "• ⚡ **Priority Support** - Pro+ plans get dedicated support\n";
        response += "• 👨‍💼 **Account Manager** - Enterprise plans get dedicated account managers\n\n";
        response += "**Resources Available:**\n";
        response += "• 📚 **Documentation** - Comprehensive guides and tutorials\n";
        response += "• 🎥 **Video Tutorials** - Step-by-step setup guides\n";
        response += "• 💬 **Community Forum** - Connect with other users\n";
        response += "• 🆘 **Help Center** - Searchable knowledge base\n\n";
        response += "**Response Times:**\n";
        response += "• Community: Real-time\n";
        response += "• Email: Within 24 hours\n";
        response += "• Priority: Within 4 hours\n\n";
        response += "You can also submit feedback using the Feedback tab!";
        
        suggestions = ["Where can I find documentation?", "How fast is email support?", "Do you offer phone support?", "Show me the help center"];
    }
    else if (lowerMessage.includes('integration') || lowerMessage.includes('connect') || lowerMessage.includes('plugin')) {
        response = "🔗 **Seamless Integration Options**\n\n";
        response += "**Platform Integrations:**\n";
        response += "• 🌐 **Universal Tracking** - Works with any website platform\n";
        response += "• 📝 **WordPress Plugin** - One-click installation from plugin directory\n";
        response += "• 🛍️ **Shopify App** - Available in the Shopify App Store\n";
        response += "• 🔧 **Custom Integration** - REST API for advanced users\n";
        response += "• ⚡ **Webhook Support** - Connect with your favorite tools\n\n";
        response += "**Popular Integrations:**\n";
        response += "• 📧 **Email Services** - Mailchimp, SendGrid, ConvertKit\n";
        response += "• 🛒 **E-commerce** - WooCommerce, Shopify, BigCommerce\n";
        response += "• 📊 **Analytics** - Google Analytics, Mixpanel, Amplitude\n";
        response += "• 🚀 **Marketing Tools** - HubSpot, ActiveCampaign, Klaviyo\n\n";
        response += "**Installation Time:**\n";
        response += "• WordPress: 2 minutes\n";
        response += "• Shopify: 3 minutes\n";
        response += "• Custom: 5 minutes\n\n";
        response += "🎯 **No technical skills required!** Our setup wizard guides you through every step.";
        
        suggestions = ["How do I install on WordPress?", "Is there a Shopify app?", "What about custom websites?", "Show me API docs"];
    }
    else {
        response = "👋 **Welcome to Seentics AI Assistant!**\n\n";
        response += "I'm here to help you discover how Seentics can transform your website with powerful analytics and automation.\n\n";
        response += "**What would you like to know about?**\n\n";
        response += "🚀 **Getting Started** - Quick setup guide and free trial\n";
        response += "💰 **Pricing & Plans** - Find the perfect plan for your business\n";
        response += "⚡ **Features** - Analytics, workflows, and AI insights\n";
        response += "🔗 **Integrations** - Connect with your existing tools\n";
        response += "🛡️ **Privacy & Security** - GDPR compliant, no cookies required\n";
        response += "📞 **Support** - We're here to help you succeed\n\n";
        response += "💡 **Pro tip:** Try asking me about specific features or use cases!";
        
        suggestions = ["Tell me about pricing", "What features do you offer?", "How do I get started?", "Show me workflows"];
    }
    
    return { response, suggestions };
}

// Main AI Assistant Function
export async function handleLandingPageAssistant(
    input: LandingPageAssistantInput
): Promise<Partial<LandingPageAssistantOutput> & { error?: string }> {
    try {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = generateAIResponse(input.message, input.conversationHistory);
        return response;
    } catch (e: any) {
        console.error("Error in landingPageAssistant server action:", e);
        return { error: e.message || "An unexpected error occurred." };
    }
}

export async function handleFeedbackSubmit(
    feedback: string
): Promise<{ error?: string }> {
    try {
        // In a real application, you would save this to a database,
        // send it to a support tool, or trigger a notification.
        console.log("--- New Feedback Received ---");
        console.log(feedback);
        console.log("-----------------------------");
        
        // Simulate a short delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {};
    } catch (e: any) {
         console.error("Error submitting feedback:", e);
        return { error: e.message || "An unexpected error occurred." };
    }
}
