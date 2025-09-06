(function () {
  // --- Seentics Analytics Tracker v5.0.0 ---
  // OPTIMIZED: Core analytics only - funnel tracking moved to separate script
  // SIZE: ~4KB (reduced from 8KB)
  // PERFORMANCE: Optimized for pageview-only tracking
  // FEATURES: Core pageview analytics + UTM tracking + Custom events
  
  // --- Polyfills for older browsers ---
  if (typeof window.requestIdleCallback === 'undefined') {
    window.requestIdleCallback = function (cb) {
      return setTimeout(cb, 1);
    };
  }

  // --- Main Tracker ---
  if (document.currentScript) {
    (function (document) {
      // Configuration
      const SCRIPT_VERSION = '5.0.0';
      const scriptTag = document.currentScript;
      const siteId = scriptTag.getAttribute('data-site-id');
      const apiHost = window.SEENTICS_CONFIG?.apiHost || 
        (window.location.hostname === 'localhost' ? 
          (window.SEENTICS_CONFIG?.devApiHost || 'http://localhost:8080') : 
          `https://${window.location.hostname}`);
      const API_ENDPOINT = `${apiHost}/api/v1/analytics/event/batch`;
      
      // Feature flags
      const trackVisibility = (scriptTag.getAttribute('data-track-visibility') || '').toLowerCase() === 'true';
      const trackExitIntent = (scriptTag.getAttribute('data-track-exit-intent') || '').toLowerCase() === 'true';
      
      const VISITOR_ID_KEY = 'seentics_visitor_id';
      const SESSION_ID_KEY = 'seentics_session_id';

      // State
      let visitorId = getOrCreateId(VISITOR_ID_KEY, 30 * 24 * 60 * 60 * 1000); // 30 days
      let sessionId = getOrCreateId(SESSION_ID_KEY, 30 * 60 * 1000); // 30 minutes
      let pageStartTime = Date.now();
      let pageviewSent = false;

      // --- Core Functions ---
      function getOrCreateId(key, expiryMs) {
        let id = localStorage.getItem(key);
        if (!id) {
          id = generateUniqueId();
          localStorage.setItem(key, id);
        }
        return id;
      }

      function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
      }

      function getCurrentDomain() {
        return window.location.hostname.split(':')[0];
      }

      function resetTimeTracking() {
        pageStartTime = Date.now();
      }

      // --- Custom Event Tracking ---
      
      // Send custom event to analytics API
      async function sendCustomEvent(event) {
        try {
          console.log('🔍 Seentics Tracker: Sending custom event:', event.event_type, event.properties);
          
          // Use sendBeacon for best performance
            if (navigator.sendBeacon) {
              const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
            const success = navigator.sendBeacon(`${apiHost}/api/v1/analytics/event`, blob);
            console.log('🔍 Seentics Tracker: Custom event sent via sendBeacon:', success);
            } else {
            // Fallback to fetch with keepalive
            const response = await fetch(`${apiHost}/api/v1/analytics/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event),
                keepalive: true
              });
            console.log('🔍 Seentics Tracker: Custom event sent via fetch:', response.status);
          }
        } catch (error) {
          console.warn('🔍 Seentics Tracker: Failed to send custom event:', error);
        }
      }
      
      // Public API for custom event tracking
      function trackCustomEvent(eventName, properties = {}) {
        if (!siteId) {
          console.warn('🔍 Seentics Tracker: siteId not available for custom event tracking');
          return;
        }
        
        if (!eventName || typeof eventName !== 'string') {
          console.warn('🔍 Seentics Tracker: Event name must be a non-empty string');
          return;
        }
        
        const event = {
          website_id: siteId,
          visitor_id: visitorId,
          session_id: sessionId,
          event_type: eventName,
          page: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          properties: properties,
          timestamp: new Date().toISOString()
        };
        
        // Send the custom event
        sendCustomEvent(event);
        
        // Emit custom event for funnel tracker
        try {
          document.dispatchEvent(new CustomEvent('seentics:custom-event', {
            detail: { eventName, data: properties }
          }));
        } catch (error) {
          console.warn('🔍 Seentics Tracker: Failed to emit custom event for funnel tracker:', error);
        }
      }

      // --- Pageview Tracking ---
      
      // Extract UTM parameters from URL
      function extractUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
          utm_source: urlParams.get('utm_source') || null,
          utm_medium: urlParams.get('utm_medium') || null,
          utm_campaign: urlParams.get('utm_campaign') || null,
          utm_term: urlParams.get('utm_term') || null,
          utm_content: urlParams.get('utm_content') || null
        };
      }

      // Send pageview event
      async function sendPageview() {
        if (pageviewSent || !siteId) return;

        const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
        const utmParams = extractUTMParameters();
        
        const event = {
          website_id: siteId,
          visitor_id: visitorId,
          session_id: sessionId,
          event_type: 'pageview',
          page: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          time_on_page: timeOnPage,
          timestamp: new Date().toISOString(),
          // Add UTM parameters
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_term: utmParams.utm_term,
          utm_content: utmParams.utm_content
        };

        const batchData = {
          siteId: siteId,
          domain: getCurrentDomain(),
          events: [event]
        };

        pageviewSent = true;
        console.log('🔍 Seentics Tracker: Sending pageview event');

        // Use sendBeacon for best performance
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(batchData)], { type: 'application/json' });
          const success = navigator.sendBeacon(API_ENDPOINT, blob);
          console.log('🔍 Seentics Tracker: sendBeacon result:', success);
        } else {
          // Fallback to fetch with keepalive
          try {
            const response = await fetch(API_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(batchData),
              keepalive: true
            });
            console.log('🔍 Seentics Tracker: Fetch response status:', response.status);
            const data = await response.json();
            console.log('🔍 Seentics Tracker: Fetch response data:', data);
          } catch (err) {
            console.warn('🔍 Seentics Tracker: Failed to send pageview:', err);
          }
        }
      }

      // --- Smart Automatic Event Tracking (minimal, high-signal only) ---
      
      // Track important user interactions automatically
      function setupAutomaticEventTracking() {
        // Track only meaningful button clicks (not UI elements)
        document.addEventListener('click', (e) => {
          const element = e.target;
          
          // Only track buttons that are NOT UI elements (tabs, dropdowns, etc.)
          if (element.tagName === 'BUTTON' || element.type === 'submit') {
            const buttonText = element.textContent?.trim() || element.value || 'Button';
            const buttonId = element.id || 'no-id';
            const buttonClass = element.className || 'no-class';
            
            // Skip UI elements and generic buttons
            const isUIElement = /tab|dropdown|menu|toggle|switch|accordion|modal|dialog|popover|tooltip|trigger/i.test(buttonClass) ||
                               /tab|dropdown|menu|toggle|switch|accordion|modal|dialog|popover|tooltip|trigger/i.test(buttonId) ||
                               /radix|shadcn|ui-|btn-|button-/i.test(buttonClass) ||
                               buttonText.length < 3 || // Skip very short button text
                               /^[0-9]+$/.test(buttonText); // Skip numbered buttons
            
            if (isUIElement) {
              return; // Skip tracking UI elements
            }
            
            // Check if this is a high-value conversion button
            const isConversionButton = /buy|purchase|order|checkout|signup|register|subscribe|download|get started|start trial|free trial|learn more|contact|demo|trial|submit|send|save|create|add|join|login|sign in/i.test(buttonText);
            
            if (isConversionButton) {
              trackCustomEvent('conversion_click', {
                element_type: 'button',
                element_text: buttonText,
                element_id: buttonId,
                element_class: buttonClass,
                page: window.location.pathname,
                page_url: window.location.pathname
              });
            }
            // Don't track generic button clicks - only conversion buttons
          }
          
          // Track link clicks (external links)
          if (element.tagName === 'A' && element.href) {
            const linkText = element.textContent?.trim() || 'Link';
            const linkHref = element.href;
            const isExternal = !linkHref.startsWith(window.location.origin);
            
            if (isExternal) {
              trackCustomEvent('external_link_click', {
                element_type: 'link',
                element_text: linkText,
                element_href: linkHref,
                element_id: element.id || 'no-id',
                element_class: element.className || 'no-class',
                page: window.location.pathname,
                page_url: window.location.pathname
              });
            }
          }
        });
        
        // Track meaningful form submissions (only POST forms with actual data)
        document.addEventListener('submit', (e) => {
          const form = e.target;
          const formAction = form.action || 'no-action';
          const formMethod = (form.method || 'get').toLowerCase();
          const formId = form.id || 'no-id';
          const formClass = form.className || 'no-class';
          const fieldCount = form.querySelectorAll('input, textarea, select').length;
          
          // Only track POST forms with meaningful data (not search forms or GET forms)
          const isSearchForm = form.querySelector('input[type="search"], input[name*="search"], input[name*="query"]');
          const isMeaningfulForm = formMethod === 'post' && fieldCount > 1 && !isSearchForm;
          
          if (isMeaningfulForm) {
            trackCustomEvent('form_submit', {
              form_action: formAction,
              form_method: formMethod,
              form_id: formId,
              form_class: formClass,
              field_count: fieldCount,
              page: window.location.pathname,
              page_url: window.location.href
            });
          }
        });
        
        // Track file downloads (links with download attribute or common file extensions)
        document.addEventListener('click', (e) => {
          const element = e.target;
          if (element.tagName === 'A' && element.href) {
            const href = element.href.toLowerCase();
            const hasDownloadAttr = element.hasAttribute('download');
            const isFileDownload = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|mp4|mp3|avi|mov|jpg|jpeg|png|gif|svg)$/i.test(href);
            
            if (hasDownloadAttr || isFileDownload) {
              const fileName = element.download || href.split('/').pop() || 'file';
              trackCustomEvent('file_download', {
                file_name: fileName,
                file_url: element.href,
                element_text: element.textContent?.trim() || 'Download',
                page: window.location.pathname,
                page_url: window.location.pathname
              });
            }
          }
        });
        
        // Track search form submissions (only meaningful searches)
        document.addEventListener('submit', (e) => {
          const form = e.target;
          const searchInputs = form.querySelectorAll('input[type="search"], input[name*="search"], input[name*="query"]');
          
          if (searchInputs.length > 0) {
            const searchTerm = searchInputs[0].value?.trim();
            // Only track searches with actual terms (not empty or very short)
            if (searchTerm && searchTerm.length > 2) {
              trackCustomEvent('search_submitted', {
                search_term: searchTerm,
                form_id: form.id || 'no-id',
                page: window.location.pathname,
                page_url: window.location.pathname
              });
            }
          }
        });
        
        // Track video interactions
        document.addEventListener('play', (e) => {
          if (e.target.tagName === 'VIDEO') {
            const video = e.target;
            trackCustomEvent('video_interaction', {
              action: 'play',
              video_src: video.src || 'no-src',
              video_duration: video.duration || 0,
              page: window.location.pathname,
              page_url: window.location.href
            });
          }
        }, true);
        
        document.addEventListener('pause', (e) => {
          if (e.target.tagName === 'VIDEO') {
            const video = e.target;
            trackCustomEvent('video_interaction', {
              action: 'pause',
              video_src: video.src || 'no-src',
              video_current_time: video.currentTime || 0,
              page: window.location.pathname,
              page_url: window.location.href
            });
          }
        }, true);
        
        // Track scroll milestones (25%, 50%, 75%, 100%)
        let scrollMilestones = [25, 50, 75, 100];
        let triggeredMilestones = new Set();
        
        function trackScrollMilestone() {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
          
          scrollMilestones.forEach(milestone => {
            if (scrollPercent >= milestone && !triggeredMilestones.has(milestone)) {
              triggeredMilestones.add(milestone);
              trackCustomEvent('scroll_milestone', {
                scroll_percent: milestone,
                page: window.location.pathname,
                page_url: window.location.pathname
              });
            }
          });
        }
        
        // Throttle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(trackScrollMilestone, 100);
        });
        
        console.log('🔍 Seentics Tracker: Automatic event tracking enabled');
      }

      // --- Event Listeners ---
      
      // Page visibility change - only send pageview if not already sent
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && !pageviewSent) {
          sendPageview();
        }
      });

      // Before unload
      window.addEventListener('beforeunload', () => {
        if (!pageviewSent) {
          sendPageview();
        }
      });

      // SPA navigation detection via History API
      let currentUrl = window.location.pathname;
      function onRouteChange() {
        if (window.location.pathname === currentUrl) return;
        currentUrl = window.location.pathname;
        resetTimeTracking();
        pageviewSent = false;
        setTimeout(sendPageview, 100);
      }
      
      const _pushState = history.pushState;
      const _replaceState = history.replaceState;
      history.pushState = function () {
        _pushState.apply(history, arguments);
        onRouteChange();
      };
      history.replaceState = function () {
        _replaceState.apply(history, arguments);
        onRouteChange();
      };
      window.addEventListener('popstate', onRouteChange);

      // --- Tracker Styles Loading ---
      function loadTrackerStyles() {
        try {
          // Check if styles are already loaded
          if (document.querySelector('link[href="/tracker-styles.css"]')) {
            console.log('🔍 Seentics Tracker: Tracker styles already loaded');
            return;
          }
          
          // Create link element for tracker styles
          const styleLink = document.createElement('link');
          styleLink.rel = 'stylesheet';
          styleLink.href = '/tracker-styles.css';
          styleLink.type = 'text/css';
          
          // Add error handling
          styleLink.onerror = function() {
            console.warn('🔍 Seentics Tracker: Failed to load tracker styles');
          };
          
          document.head.appendChild(styleLink);
          console.log('🔍 Seentics Tracker: Tracker styles loaded');
        } catch (error) {
          console.warn('🔍 Seentics Tracker: Error loading tracker styles:', error);
        }
      }

      // --- Workflow Tracker Loading ---
      function loadWorkflowTracker() {
        try {
          // Check if workflow tracker is already loaded
          if (window.seentics && window.seentics.workflowTracker) {
            console.log('🔍 Seentics Tracker: Workflow tracker already loaded');
            return;
          }
          
          // Also check if the script tag is already present
          if (document.querySelector('script[src="/workflow-tracker.js"]')) {
            console.log('🔍 Seentics Tracker: Workflow tracker script already present');
            return;
          }
          
          // Create script element for workflow tracker
          const workflowScript = document.createElement('script');
          workflowScript.src = '/workflow-tracker.js';
          workflowScript.setAttribute('data-site-id', siteId);
          workflowScript.async = true;
          
          // Add error handling
          workflowScript.onerror = function() {
            console.warn('🔍 Seentics Tracker: Failed to load workflow tracker');
          };
          
          // Initialize workflow tracker after it loads
          workflowScript.onload = async function() {
            if (window.seentics && window.seentics.workflowTracker) {
              await window.seentics.workflowTracker.init(siteId);
              console.log('🔍 Seentics Tracker: Workflow tracker initialized');
            }
          };
          
          document.head.appendChild(workflowScript);
          console.log('🔍 Seentics Tracker: Workflow tracker script loaded');
        } catch (error) {
          console.warn('🔍 Seentics Tracker: Error loading workflow tracker:', error);
        }
      }

      // --- Funnel Tracker Loading ---
      function loadFunnelTracker() {
        try {
          // Check if funnel tracker is already loaded
          if (window.seentics && window.seentics.funnelTracker) {
            console.log('🔍 Seentics Tracker: Funnel tracker already loaded');
            return;
          }
          
          // Also check if the script tag is already present
          if (document.querySelector('script[src="/funnel-tracker.js"]')) {
            console.log('🔍 Seentics Tracker: Funnel tracker script already present');
            return;
          }
          
          // Create script element for funnel tracker
          const funnelScript = document.createElement('script');
          funnelScript.src = '/funnel-tracker.js';
          funnelScript.setAttribute('data-site-id', siteId);
          funnelScript.async = true;
          
          // Add error handling
          funnelScript.onerror = function() {
            console.warn('🔍 Seentics Tracker: Failed to load funnel tracker');
          };
          
          // Initialize funnel tracker after it loads
          funnelScript.onload = function() {
            if (window.seentics && window.seentics.funnelTracker) {
              // Funnel tracker initializes automatically
              console.log('🔍 Seentics Tracker: Funnel tracker initialized');
            }
          };
          
          document.head.appendChild(funnelScript);
          console.log('🔍 Seentics Tracker: Funnel tracker script loaded');
        } catch (error) {
          console.warn('🔍 Seentics Tracker: Error loading funnel tracker:', error);
        }
      }

      // --- Initialization ---
      function init() {
        if (!siteId) {
          console.warn('🔍 Seentics Tracker: siteId not provided');
          return;
        }
        
        console.log(`🔍 Seentics Tracker v${SCRIPT_VERSION} initialized for site: ${siteId}`);
        
        // Send initial pageview
        setTimeout(sendPageview, 100);
        
        // Setup automatic event tracking
        setupAutomaticEventTracking();
        
        // Load tracker styles
        loadTrackerStyles();
        
        // Load additional trackers
        loadWorkflowTracker();
        loadFunnelTracker();
        
        // Public API
        window.seentics = {
          siteId: siteId,
          apiHost: apiHost,
          // Custom event tracking
          track: trackCustomEvent,
          // Debug functions
          sendPageview: sendPageview,
          // Test functions for debugging
          testEvents: () => {
            console.log('🧪 Testing custom events...');
            trackCustomEvent('test_click', { element_type: 'button', element_text: 'Test Button', page: window.location.pathname });
            trackCustomEvent('test_form_submit', { form_id: 'test-form', page: window.location.pathname });
            trackCustomEvent('test_conversion_click', { element_type: 'button', element_text: 'Buy Now', page: window.location.pathname });
            trackCustomEvent('test_file_download', { file_name: 'test.pdf', page: window.location.pathname });
            trackCustomEvent('test_search_submitted', { search_term: 'test search', page: window.location.pathname });
          }
        };
      }

      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })(document);
  }
})();
