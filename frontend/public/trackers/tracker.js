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

      // State variables
      let visitorId = getOrCreateId(VISITOR_ID_KEY, VISITOR_EXPIRY_MS);
      let sessionId = getOrCreateId(SESSION_ID_KEY, SESSION_EXPIRY_MS);
      let pageStartTime = performance.now();
      let pageviewSent = false;
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

      // --- Automatic event handlers removed - users can manually call seentics.track() ---

      // Removed automatic event tracking - users can manually call seentics.track()

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
            loadResource('/styles/tracker-styles.css', 'link'),
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