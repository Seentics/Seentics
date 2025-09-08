(function () {
  // --- Seentics Analytics Tracker v1.0.1 (Further Optimized) ---
  // Additional optimizations applied for better performance and smaller size

  // --- Polyfills ---
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = function (cb) {
      const start = performance.now();
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (performance.now() - start));
          }
        });
      }, 1);
    };
  }

  // --- Main Tracker ---
  if (document.currentScript) {
    (function (doc, win, nav, loc) {
      // Configuration
      const scriptTag = doc.currentScript;
      const siteId = scriptTag.getAttribute('data-site-id');
      const apiHost = win.SEENTICS_CONFIG?.apiHost ||
        (loc.hostname === 'localhost' ?
          (win.SEENTICS_CONFIG?.devApiHost || 'http://localhost:8080') :
          `https://${loc.hostname}`);
      const API_ENDPOINT = `${apiHost}/api/v1/analytics/event/batch`;
      const DEBUG = !!(win.SEENTICS_CONFIG?.debugMode);

      // Constants
      const VISITOR_ID_KEY = 'seentics_visitor_id';
      const SESSION_ID_KEY = 'seentics_session_id';
      const SESSION_LAST_SEEN_KEY = 'seentics_session_last_seen';
      const SESSION_EXPIRY_MS = 1800000; // 30 minutes
      const VISITOR_EXPIRY_MS = 2592000000; // 30 days
      const BATCH_DELAY = 100;

      // Pre-compiled regex patterns
      const UI_ELEMENT_REGEX = /tab|dropdown|menu|toggle|switch|accordion|modal|dialog|popover|tooltip|trigger|radix|shadcn|ui-|btn-|button-/i;
      const CONVERSION_REGEX = /buy|purchase|order|checkout|signup|register|subscribe|download|get started|start trial|free trial|learn more|contact|demo|trial|submit|send|save|create|add|join|login|sign in/i;
      const FILE_EXTENSION_REGEX = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|mp4|mp3|avi|mov|jpg|jpeg|png|gif|svg)$/i;

      // State variables
      let visitorId = getOrCreateId(VISITOR_ID_KEY, VISITOR_EXPIRY_MS);
      let sessionId = getOrCreateId(SESSION_ID_KEY, SESSION_EXPIRY_MS);
      let pageStartTime = performance.now();
      let pageviewSent = false;
      let lastFormSubmitAt = 0;
      let currentUrl = loc.pathname;
      let cachedUTMParams = null;
      let lastUrlForUTM = '';
      let activityTimeout = null;

      // Event batching
      const eventQueue = [];
      let flushTimeout = null;

      // --- Core Functions ---

      function getOrCreateId(key, expiryMs) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            let obj;
            try {
              obj = JSON.parse(raw);
            } catch {
              if (raw.length > 10) return raw;
            }

            if (obj?.value && (!obj.expiresAt || Date.now() < obj.expiresAt)) {
              return obj.value;
            }
          }

          const value = Date.now().toString(36) + Math.random().toString(36).slice(2);
          const expiresAt = Date.now() + expiryMs;
          const data = JSON.stringify({ value, expiresAt });

          localStorage.setItem(key, data);
          if (key === SESSION_ID_KEY) {
            localStorage.setItem(SESSION_LAST_SEEN_KEY, Date.now().toString());
          }

          return value;
        } catch {
          return Date.now().toString(36) + Math.random().toString(36).slice(2);
        }
      }

      function refreshSessionIfNeeded() {
        try {
          const now = Date.now();
          const lastSeenStr = localStorage.getItem(SESSION_LAST_SEEN_KEY);
          const lastSeen = lastSeenStr ? parseInt(lastSeenStr, 10) : 0;

          if (lastSeen && now - lastSeen < SESSION_EXPIRY_MS) {
            localStorage.setItem(SESSION_LAST_SEEN_KEY, now.toString());
            return;
          }

          sessionId = getOrCreateId(SESSION_ID_KEY, SESSION_EXPIRY_MS);
        } catch { }
      }

      function getCurrentDomain() {
        return loc.hostname.split(':')[0];
      }

      // --- Event Batching ---

      function queueEvent(event) {
        eventQueue.push(event);

        if (!flushTimeout) {
          flushTimeout = setTimeout(flushEventQueue, BATCH_DELAY);
        }
      }

      async function flushEventQueue() {
        if (eventQueue.length === 0) return;

        const events = eventQueue.splice(0);
        flushTimeout = null;

        try {
          const batchData = {
            siteId,
            domain: getCurrentDomain(),
            events
          };

          if (nav.sendBeacon) {
            const blob = new Blob([JSON.stringify(batchData)], { type: 'application/json' });
            nav.sendBeacon(API_ENDPOINT, blob);
          } else {
            await fetch(API_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(batchData),
              keepalive: true
            });
          }
        } catch (error) {
          if (DEBUG) console.warn('Seentics: Failed to send events', error);
        }
      }

      // --- Custom Event Tracking ---

      function trackCustomEvent(eventName, properties = {}) {
        if (!siteId || !eventName || typeof eventName !== 'string') {
          if (DEBUG) console.warn('Seentics: Invalid event parameters');
          return;
        }

        refreshSessionIfNeeded();

        const event = {
          website_id: siteId,
          visitor_id: visitorId,
          session_id: sessionId,
          event_type: eventName,
          page: loc.pathname,
          referrer: doc.referrer || null,
          user_agent: nav.userAgent,
          properties,
          timestamp: new Date().toISOString()
        };

        queueEvent(event);

        // Emit for funnel tracker
        try {
          doc.dispatchEvent(new CustomEvent('seentics:custom-event', {
            detail: { eventName, data: properties }
          }));
        } catch { }
      }

      // --- Pageview Tracking ---

      function extractUTMParameters() {
        const currentUrl = loc.search;
        if (currentUrl === lastUrlForUTM && cachedUTMParams) {
          return cachedUTMParams;
        }

        const urlParams = new URLSearchParams(currentUrl);
        cachedUTMParams = {
          utm_source: urlParams.get('utm_source'),
          utm_medium: urlParams.get('utm_medium'),
          utm_campaign: urlParams.get('utm_campaign'),
          utm_term: urlParams.get('utm_term'),
          utm_content: urlParams.get('utm_content')
        };
        lastUrlForUTM = currentUrl;

        return cachedUTMParams;
      }

      async function sendPageview() {
        if (pageviewSent || !siteId) return;

        const timeOnPage = Math.round((performance.now() - pageStartTime) / 1000);
        const utmParams = extractUTMParameters();

        refreshSessionIfNeeded();

        const event = {
          website_id: siteId,
          visitor_id: visitorId,
          session_id: sessionId,
          event_type: 'pageview',
          page: loc.pathname,
          referrer: doc.referrer || null,
          user_agent: nav.userAgent,
          time_on_page: timeOnPage,
          timestamp: new Date().toISOString(),
          ...utmParams
        };

        const batchData = {
          siteId,
          domain: getCurrentDomain(),
          events: [event]
        };

        pageviewSent = true;

        try {
          if (nav.sendBeacon) {
            const blob = new Blob([JSON.stringify(batchData)], { type: 'application/json' });
            nav.sendBeacon(API_ENDPOINT, blob);
          } else {
            await fetch(API_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(batchData),
              keepalive: true
            });
          }
        } catch (err) {
          if (DEBUG) console.warn('Seentics: Pageview failed', err);
        }
      }

      // --- Event Handlers ---

      function handleClick(e) {
        const element = e.target;
        const now = Date.now();

        if (element.tagName === 'BUTTON' || element.type === 'submit') {
          handleButtonClick(element, now);
        }

        if (element.tagName === 'A' && element.href) {
          handleLinkClick(element);
        }
      }

      function handleButtonClick(element, now) {
        const buttonText = (element.textContent?.trim() || element.value || 'Button').slice(0, 100);
        const buttonId = element.id || 'no-id';
        const buttonClass = element.className || 'no-class';

        if (now - lastFormSubmitAt < 800) return;

        if (UI_ELEMENT_REGEX.test(buttonClass) ||
          UI_ELEMENT_REGEX.test(buttonId) ||
          buttonText.length < 3 ||
          /^[0-9]+$/.test(buttonText)) {
          return;
        }

        const parentForm = element.closest('form');
        if (parentForm && isMeaningfulForm(parentForm)) return;

        if (CONVERSION_REGEX.test(buttonText)) {
          trackCustomEvent('conversion_click', {
            element_type: 'button',
            element_text: buttonText,
            element_id: buttonId,
            element_class: buttonClass,
            page: loc.pathname,
            page_url: loc.href
          });
        }
      }

      function handleLinkClick(element) {
        const linkHref = element.href;
        const isExternal = !linkHref.startsWith(loc.origin);

        if (isExternal) {
          trackCustomEvent('external_link_click', {
            element_type: 'link',
            element_text: (element.textContent?.trim() || 'Link').slice(0, 100),
            element_href: linkHref,
            element_id: element.id || 'no-id',
            element_class: element.className || 'no-class',
            page: loc.pathname,
            page_url: loc.href
          });
        }

        const hasDownloadAttr = element.hasAttribute('download');
        const isFileDownload = FILE_EXTENSION_REGEX.test(linkHref.toLowerCase());

        if (hasDownloadAttr || isFileDownload) {
          const fileName = element.download || linkHref.split('/').pop() || 'file';
          trackCustomEvent('file_download', {
            file_name: fileName,
            file_url: linkHref,
            element_text: (element.textContent?.trim() || 'Download').slice(0, 100),
            page: loc.pathname,
            page_url: loc.href
          });
        }
      }

      function isMeaningfulForm(form) {
        const method = (form.method || 'get').toLowerCase();
        const fieldCount = form.querySelectorAll('input, textarea, select').length;
        const isSearchForm = form.querySelector('input[type="search"], input[name*="search"], input[name*="query"]');
        const hasTextarea = form.querySelector('textarea');
        const hasEmailField = form.querySelector('input[type="email"], input[name*="email"]');
        const hasMessageField = form.querySelector('input[name*="message"], textarea[name*="message"], input[placeholder*="message"], textarea[placeholder*="message"]');
        const hasContactFields = hasEmailField || hasMessageField;

        return (method === 'post' && fieldCount > 1 && !isSearchForm) ||
          hasContactFields ||
          (hasTextarea && !isSearchForm);
      }

      function handleFormSubmit(e) {
        const form = e.target;
        const searchInput = form.querySelector('input[type="search"], input[name*="search"], input[name*="query"]');

        if (searchInput) {
          const searchTerm = searchInput.value?.trim();
          if (searchTerm && searchTerm.length > 2) {
            trackCustomEvent('search_submitted', {
              search_term: searchTerm.slice(0, 200),
              form_id: form.id || 'no-id',
              page: loc.pathname,
              page_url: loc.href
            });
          }
          return;
        }

        if (isMeaningfulForm(form)) {
          lastFormSubmitAt = Date.now();

          const hasEmailField = form.querySelector('input[type="email"], input[name*="email"]');
          const hasMessageField = form.querySelector('input[name*="message"], textarea[name*="message"], input[placeholder*="message"], textarea[placeholder*="message"]');
          const hasTextarea = form.querySelector('textarea');

          let formType = 'form_submit';
          if (hasEmailField || hasMessageField) {
            formType = 'contact_form_submit';
          } else if (hasTextarea) {
            formType = 'message_form_submit';
          }

          trackCustomEvent(formType, {
            form_action: form.action || 'no-action',
            form_method: (form.method || 'get').toLowerCase(),
            form_id: form.id || 'no-id',
            form_class: form.className || 'no-class',
            field_count: form.querySelectorAll('input, textarea, select').length,
            has_email_field: !!hasEmailField,
            has_message_field: !!hasMessageField,
            has_textarea: !!hasTextarea,
            page: loc.pathname,
            page_url: loc.href
          });
        }
      }

      function handleVideoEvent(e, action) {
        if (e.target.tagName === 'VIDEO') {
          const video = e.target;
          const eventData = {
            action,
            video_src: (video.src || 'no-src').slice(0, 200),
            page: loc.pathname,
            page_url: loc.href
          };

          if (action === 'play') {
            eventData.video_duration = Math.round(video.duration) || 0;
          } else {
            eventData.video_current_time = Math.round(video.currentTime) || 0;
          }

          trackCustomEvent('video_interaction', eventData);
        }
      }

      function setupAutomaticEventTracking() {
        doc.addEventListener('click', handleClick, { passive: true });
        doc.addEventListener('submit', handleFormSubmit);

        doc.addEventListener('play', (e) => handleVideoEvent(e, 'play'), true);
        doc.addEventListener('pause', (e) => handleVideoEvent(e, 'pause'), true);
      }

      // --- Event Listeners ---

      function onActivity() {
        if (activityTimeout) return;
        activityTimeout = setTimeout(() => {
          refreshSessionIfNeeded();
          activityTimeout = null;
        }, 1000);
      }

      function onRouteChange() {
        const newUrl = loc.pathname;
        if (newUrl === currentUrl) return;

        currentUrl = newUrl;
        cachedUTMParams = null;
        pageStartTime = performance.now();
        pageviewSent = false;

        requestIdleCallback(() => sendPageview());
      }

      // Setup all event listeners
      function setupEventListeners() {
        doc.addEventListener('visibilitychange', () => {
          if (doc.hidden && !pageviewSent) {
            sendPageview();
          }
          refreshSessionIfNeeded();
        });

        win.addEventListener('beforeunload', () => {
          if (!pageviewSent) sendPageview();
          if (eventQueue.length > 0) flushEventQueue();
        });

        ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'].forEach(evt => {
          doc.addEventListener(evt, onActivity, { passive: true });
        });

        // SPA navigation detection
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
          originalPushState.apply(this, args);
          onRouteChange();
        };

        history.replaceState = function (...args) {
          originalReplaceState.apply(this, args);
          onRouteChange();
        };

        win.addEventListener('popstate', onRouteChange);
      }

      // --- Resource Loading ---

      function loadResource(src, type = 'script') {
        return new Promise((resolve) => {
          const existing = doc.querySelector(`${type}[${type === 'script' ? 'src' : 'href'}="${src}"]`);
          if (existing) {
            resolve();
            return;
          }

          const element = doc.createElement(type);
          if (type === 'script') {
            element.src = src;
            element.async = true;
          } else {
            element.rel = 'stylesheet';
            element.href = src;
            element.type = 'text/css';
          }

          element.onload = () => resolve();
          element.onerror = () => resolve();

          doc.head.appendChild(element);
        });
      }

      async function loadAdditionalTrackers() {
        try {
          await Promise.all([
            loadResource('/tracker-styles.css', 'link'),
            loadResource('/workflow-tracker.js'),
            loadResource('/funnel-tracker.js')
          ]);

          if (win.seentics?.workflowTracker) {
            await win.seentics.workflowTracker.init(siteId);
          }
        } catch (error) {
          if (DEBUG) console.warn('Seentics: Failed to load additional trackers', error);
        }
      }

      // --- Initialization ---
      function init() {
        if (!siteId) {
          if (DEBUG) console.warn('Seentics: No site ID provided');
          return;
        }

        requestIdleCallback(() => sendPageview());
        setupAutomaticEventTracking();
        setupEventListeners();
        requestIdleCallback(() => loadAdditionalTrackers());

        // Public API
        win.seentics = {
          siteId,
          apiHost,
          track: trackCustomEvent,
          sendPageview,
          ...(DEBUG && {
            getVisitorId: () => visitorId,
            getSessionId: () => sessionId,
            flushEvents: flushEventQueue
          })
        };
      }

      // Initialize
      if (doc.readyState === 'loading') {
        doc.addEventListener('DOMContentLoaded', init);
      } else {
        requestIdleCallback(init);
      }

    })(document, window, navigator, location);
  }
})();