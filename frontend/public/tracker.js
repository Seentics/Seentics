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
      const DEBUG = !!(window.SEENTICS_CONFIG && window.SEENTICS_CONFIG.debugMode);
      
      // Feature flags
      const trackVisibility = (scriptTag.getAttribute('data-track-visibility') || '').toLowerCase() === 'true';
      const trackExitIntent = (scriptTag.getAttribute('data-track-exit-intent') || '').toLowerCase() === 'true';
      
      const VISITOR_ID_KEY = 'seentics_visitor_id';
      const SESSION_ID_KEY = 'seentics_session_id';
      const SESSION_LAST_SEEN_KEY = 'seentics_session_last_seen';

      // State
      let visitorId = getOrCreateId(VISITOR_ID_KEY, 30 * 24 * 60 * 60 * 1000); // 30 days
      let sessionId = getOrCreateId(SESSION_ID_KEY, 30 * 60 * 1000); // 30 minutes
      let pageStartTime = Date.now();
      let pageviewSent = false;
      // Suppress duplicate click after form submission
      let lastFormSubmitAt = 0;

      // --- Core Functions ---
      function getOrCreateId(key, expiryMs) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const obj = JSON.parse(raw);
              if (obj && obj.value) {
                if (!obj.expiresAt || Date.now() < obj.expiresAt) {
                  return obj.value;
                }
              }
            } catch {
              // legacy plain string
              return raw;
            }
          }
          const value = generateUniqueId();
          const expiresAt = Date.now() + (expiryMs || 0);
          localStorage.setItem(key, JSON.stringify({ value, expiresAt }));
          if (key === SESSION_ID_KEY) {
            localStorage.setItem(SESSION_LAST_SEEN_KEY, String(Date.now()));
          }
          return value;
        } catch {
          // Fallback if storage unavailable
          return generateUniqueId();
        }
      }

      function refreshSessionIfNeeded() {
        try {
          const raw = localStorage.getItem(SESSION_ID_KEY);
          const lastSeenRaw = localStorage.getItem(SESSION_LAST_SEEN_KEY);
          const now = Date.now();
          const lastSeen = lastSeenRaw ? parseInt(lastSeenRaw, 10) : 0;
          const expiryMs = 30 * 60 * 1000;
          if (!raw) {
            sessionId = getOrCreateId(SESSION_ID_KEY, expiryMs);
            return;
          }
          let parsed;
          try { parsed = JSON.parse(raw); } catch {}
          if (!parsed || !parsed.value || (parsed.expiresAt && now >= parsed.expiresAt) || (lastSeen && now - lastSeen > expiryMs)) {
            sessionId = getOrCreateId(SESSION_ID_KEY, expiryMs);
          } else {
            // extend expiry and update last seen
            parsed.expiresAt = now + expiryMs;
            localStorage.setItem(SESSION_ID_KEY, JSON.stringify(parsed));
          }
          localStorage.setItem(SESSION_LAST_SEEN_KEY, String(now));
        } catch {}
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
          if (DEBUG) {}
          // Use sendBeacon for best performance
            if (navigator.sendBeacon) {
              const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
            const success = navigator.sendBeacon(`${apiHost}/api/v1/analytics/event`, blob);
            } else {
            // Fallback to fetch with keepalive
            const response = await fetch(`${apiHost}/api/v1/analytics/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event),
                keepalive: true
              });
          }
        } catch (error) {
          if (DEBUG) {}
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
        
        refreshSessionIfNeeded();
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
        try { document.dispatchEvent(new CustomEvent('seentics:custom-event', { detail: { eventName, data: properties } })); } catch {}
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
        
        refreshSessionIfNeeded();
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

        // Use sendBeacon for best performance
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(batchData)], { type: 'application/json' });
          const success = navigator.sendBeacon(API_ENDPOINT, blob);
        } else {
          // Fallback to fetch with keepalive
          try {
            const response = await fetch(API_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(batchData),
              keepalive: true
            });
          } catch (err) {
            if (DEBUG) {}
          }
        }
      }

      // --- Smart Automatic Event Tracking (minimal, high-signal only) ---
      
      // Track important user interactions automatically
      function setupAutomaticEventTracking() {
        // Precompiled regexes
        const UI_RE = /tab|dropdown|menu|toggle|switch|accordion|modal|dialog|popover|tooltip|trigger|radix|shadcn|ui-|btn-|button-/i;
        const CONVERSION_RE = /buy|purchase|order|checkout|signup|register|subscribe|download|get started|start trial|free trial|learn more|contact|demo|trial|submit|send|save|create|add|join|login|sign in/i;
        // Track only meaningful button clicks (not UI elements)
        document.addEventListener('click', (e) => {
          const element = e.target;
          
          // Only track buttons that are NOT UI elements (tabs, dropdowns, etc.)
          if (element.tagName === 'BUTTON' || element.type === 'submit') {
            const buttonText = element.textContent?.trim() || element.value || 'Button';
            const buttonId = element.id || 'no-id';
            const buttonClass = element.className || 'no-class';
            const parentForm = element.closest && element.closest('form');
            const now = Date.now();
            
            // Skip UI elements and generic buttons
            const isUIElement = UI_RE.test(buttonClass) ||
                               UI_RE.test(buttonId) ||
                               buttonText.length < 3 || // Skip very short button text
                               /^[0-9]+$/.test(buttonText); // Skip numbered buttons
            
            if (isUIElement) {
              return; // Skip tracking UI elements
            }
            
            // If inside a meaningful POST form or just submitted a form, don't send conversion_click
            if (parentForm) {
              const method = (parentForm.method || 'get').toLowerCase();
              const fieldCount = parentForm.querySelectorAll('input, textarea, select').length;
              const isSearchForm = parentForm.querySelector('input[type="search"], input[name*="search"], input[name*="query"]');
              const isMeaningfulForm = method === 'post' && fieldCount > 1 && !isSearchForm;
              if (isMeaningfulForm) {
                return; // prefer form_submit event
              }
            }
            if (now - lastFormSubmitAt < 800) {
              return; // suppress click right after submit
            }
            
            // Check if this is a high-value conversion button
            const isConversionButton = CONVERSION_RE.test(buttonText);
            
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
        
        // Combined submit listener for search and form_submit
        document.addEventListener('submit', (e) => {
          const form = e.target;
          const formMethod = (form.method || 'get').toLowerCase();
          const fieldCount = form.querySelectorAll('input, textarea, select').length;
          const searchInputs = form.querySelectorAll('input[type="search"], input[name*="search"], input[name*="query"]');
          const isSearchForm = searchInputs.length > 0;
          if (isSearchForm) {
            const searchTerm = searchInputs[0].value?.trim();
            if (searchTerm && searchTerm.length > 2) {
              trackCustomEvent('search_submitted', {
                search_term: searchTerm,
                form_id: form.id || 'no-id',
                page: window.location.pathname,
                page_url: window.location.pathname
              });
            }
            return;
          }
          const isMeaningfulForm = formMethod === 'post' && fieldCount > 1;
          if (isMeaningfulForm) {
            lastFormSubmitAt = Date.now();
            trackCustomEvent('form_submit', {
              form_action: form.action || 'no-action',
              form_method: formMethod,
              form_id: form.id || 'no-id',
              form_class: form.className || 'no-class',
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
        
        // removed duplicate search submit listener (merged above)

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
        
      }

      // --- Event Listeners ---
      
      // Page visibility change - only send pageview if not already sent
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && !pageviewSent) {
          sendPageview();
        }
        // refresh session on visibility changes
        refreshSessionIfNeeded();
      });

      // Before unload
      window.addEventListener('beforeunload', () => {
        if (!pageviewSent) {
          sendPageview();
        }
      });

      // Light activity ping to keep session alive
      ['click','keydown','scroll','mousemove','touchstart'].forEach(evt => {
        document.addEventListener(evt, () => refreshSessionIfNeeded(), { passive: true });
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
            return;
          }
          
          // Create link element for tracker styles
          const styleLink = document.createElement('link');
          styleLink.rel = 'stylesheet';
          styleLink.href = '/tracker-styles.css';
          styleLink.type = 'text/css';
          
          // Add error handling
          styleLink.onerror = function() {};
          
          document.head.appendChild(styleLink);
        } catch (error) {
          if (DEBUG) {}
        }
      }

      // --- Workflow Tracker Loading ---
      function loadWorkflowTracker() {
        try {
          // Check if workflow tracker is already loaded
          if (window.seentics && window.seentics.workflowTracker) {
            return;
          }
          
          // Also check if the script tag is already present
          if (document.querySelector('script[src="/workflow-tracker.js"]')) {
            return;
          }
          
          // Create script element for workflow tracker
          const workflowScript = document.createElement('script');
          workflowScript.src = '/workflow-tracker.js';
          workflowScript.setAttribute('data-site-id', siteId);
          workflowScript.async = true;
          
          // Add error handling
          workflowScript.onerror = function() {};
          
          // Initialize workflow tracker after it loads
          workflowScript.onload = async function() {
            if (window.seentics && window.seentics.workflowTracker) {
              await window.seentics.workflowTracker.init(siteId);
            }
          };
          
          document.head.appendChild(workflowScript);
        } catch (error) {
          if (DEBUG) {}
        }
      }

      // --- Funnel Tracker Loading ---
      function loadFunnelTracker() {
        try {
          // Check if funnel tracker is already loaded
          if (window.seentics && window.seentics.funnelTracker) {
            return;
          }
          
          // Also check if the script tag is already present
          if (document.querySelector('script[src="/funnel-tracker.js"]')) {
            return;
          }
          
          // Create script element for funnel tracker
          const funnelScript = document.createElement('script');
          funnelScript.src = '/funnel-tracker.js';
          funnelScript.setAttribute('data-site-id', siteId);
          funnelScript.async = true;
          
          // Add error handling
          funnelScript.onerror = function() {};
          
          // Initialize funnel tracker after it loads
          funnelScript.onload = function() {
            if (window.seentics && window.seentics.funnelTracker) {
              // Funnel tracker initializes automatically
            }
          };
          
          document.head.appendChild(funnelScript);
        } catch (error) {
          if (DEBUG) {}
        }
      }

      // --- Initialization ---
      function init() {
        if (!siteId) {
          return;
        }
        
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
