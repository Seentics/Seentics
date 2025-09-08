(function () {
  // --- Seentics Funnel Tracker v1.0.1 (Optimized) ---
  // SIZE: ~5.5KB (optimized for funnel tracking only)
  // PERFORMANCE: Lightweight funnel tracking with batching
  // FEATURES: Page-based, event-based, and custom event funnel tracking
  
  // --- Main Funnel Tracker ---
  if (document.currentScript) {
    (function (doc) {
      // Configuration
      const scriptTag = doc.currentScript;
      const siteId = scriptTag.getAttribute('data-site-id');
      const apiHost = window.SEENTICS_CONFIG?.apiHost || 
        (window.location.hostname === 'localhost' ? 
          (window.SEENTICS_CONFIG?.devApiHost || 'http://localhost:8080') : 
          `https://${window.location.hostname}`);
      const FUNNEL_API_ENDPOINT = `${apiHost}/api/v1/funnels/track`;
      
      // Feature flags
      const trackFunnels = (scriptTag.getAttribute('data-track-funnels') || '').toLowerCase() !== 'false';
      
      // Constants
      const VISITOR_ID_KEY = 'seentics_visitor_id';
      const SESSION_ID_KEY = 'seentics_session_id';
      const FUNNEL_STATE_KEY = 'seentics_funnel_state';
      const BATCH_DELAY = 1000;
      const VISITOR_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
      const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

      // State
      let visitorId = getOrCreateId(VISITOR_ID_KEY, VISITOR_TTL);
      let sessionId = getOrCreateId(SESSION_ID_KEY, SESSION_TTL);
      let activeFunnels = new Map();
      let funnelEventQueue = [];
      let funnelEventTimer = null;
      let funnelsValidated = false;
      let currentUrl = window.location.pathname;

      // --- Core Functions ---
      function getOrCreateId(key, expiryMs) {
        let id = localStorage.getItem(key);
        if (!id) {
          id = Date.now().toString(36) + Math.random().toString(36).substring(2);
          localStorage.setItem(key, id);
        }
        return id;
      }

      // --- Funnel Tracking Functions ---
      
      async function initFunnelTracking() {
        if (!trackFunnels || !siteId) return;
        
        await loadFunnelDefinitions();
        startFunnelMonitoring();
      }
      
      async function loadFunnelDefinitions() {
        try {
          // Load from cache first
          const cacheKey = `${FUNNEL_STATE_KEY}_${siteId}`;
          const savedFunnels = localStorage.getItem(cacheKey);
          
          if (savedFunnels) {
            try {
              const funnels = JSON.parse(savedFunnels);
              initializeFunnels(funnels);
              funnelsValidated = false;
            } catch (error) {
              console.warn('🔍 Seentics: Error loading cached funnels:', error);
            }
          }

          // Fetch from API
          const response = await fetch(`${apiHost}/api/v1/funnels/active?website_id=${siteId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true
          });

          if (response.ok) {
            const data = await response.json();
            const funnels = data.funnels || data || [];
            
            activeFunnels.clear();
            initializeFunnels(funnels);
            
            localStorage.setItem(cacheKey, JSON.stringify(funnels));
            funnelsValidated = true;
            
            if (funnelEventQueue.length > 0) {
              sendFunnelEvents();
            }
          } else {
            console.warn('🔍 Seentics: Failed to fetch funnel definitions:', response.status);
          }
        } catch (error) {
          console.warn('🔍 Seentics: Error loading funnel definitions:', error);
        }
      }

      function initializeFunnels(funnels) {
        funnels.forEach(funnel => {
          if (funnel.is_active) {
            activeFunnels.set(funnel.id, {
              ...funnel,
              currentStep: 0,
              completedSteps: [],
              startedAt: null,
              lastActivity: null,
              converted: false
            });
          }
        });
      }
      
      function startFunnelMonitoring() {
        monitorPageChanges();
        monitorClickEvents();
        monitorCustomEvents();
      }
      
      function monitorPageChanges() {
        activeFunnels.forEach((funnelState, funnelId) => {
          if (!funnelState.steps) return;
          
          let foundMatch = false;
          
          funnelState.steps.forEach((step, index) => {
            if (step.type === 'page' && step.condition?.page && 
                matchesPageCondition(currentUrl, step.condition.page)) {
              console.log(`🔍 Seentics: Page match for funnel ${funnelId}, step ${index + 1}`);
              updateFunnelProgress(funnelId, index + 1, step);
              foundMatch = true;
            }
          });
          
          // Handle dropoff
          if (!foundMatch && funnelState.currentStep > 0) {
            queueDropoffEvent(funnelId, funnelState);
          }
        });
      }

      function queueDropoffEvent(funnelId, funnelState) {
        const dropoffEvent = createFunnelEvent(funnelId, funnelState, {
          step_name: funnelState.steps[funnelState.currentStep - 1]?.name || 'Unknown',
          step_type: funnelState.steps[funnelState.currentStep - 1]?.type || 'page',
          dropoff_reason: "navigated_to_unexpected_page"
        });
        
        funnelEventQueue.push(dropoffEvent);
        sendFunnelEvents();
      }
      
      function monitorClickEvents() {
        doc.addEventListener('click', (e) => {
          const element = e.target;
          
          activeFunnels.forEach((funnelState, funnelId) => {
            if (!funnelState.steps) return;
            
            funnelState.steps.forEach((step, index) => {
              if (step.type === 'event' && step.condition?.event &&
                  matchesEventCondition(element, step.condition.event)) {
                updateFunnelProgress(funnelId, index + 1, step);
              }
            });
          });
        }, { passive: true });
      }
      
      function monitorCustomEvents() {
        doc.addEventListener('seentics:custom-event', (event) => {
          const { eventName, data } = event.detail;
          checkCustomEventForFunnels(eventName, data);
        });
      }
      
      function checkCustomEventForFunnels(eventName, data = {}) {
        activeFunnels.forEach((funnelState, funnelId) => {
          if (!funnelState.steps) return;
          
          funnelState.steps.forEach((step, index) => {
            if (step.type === 'custom' && step.condition?.custom === eventName) {
              updateFunnelProgress(funnelId, index + 1, step, data);
            }
          });
        });
      }
      
      function updateFunnelProgress(funnelId, stepNumber, step, additionalData = {}) {
        const funnelState = activeFunnels.get(funnelId);
        if (!funnelState || stepNumber <= funnelState.currentStep) return;
        
        // Update state
        funnelState.currentStep = stepNumber;
        funnelState.completedSteps.push(stepNumber - 1);
        
        if (stepNumber === 1 && !funnelState.startedAt) {
          funnelState.startedAt = new Date().toISOString();
        }
        
        funnelState.lastActivity = new Date();
        
        if (stepNumber === funnelState.steps.length) {
          funnelState.converted = true;
          console.log(`🔍 Seentics: Funnel ${funnelId} completed!`);
        }
        
        activeFunnels.set(funnelId, funnelState);
        saveFunnelState();
        queueFunnelEvent(funnelId, funnelState, stepNumber, additionalData);
      }
      
      function queueFunnelEvent(funnelId, funnelState, step, additionalData) {
        const funnelEvent = createFunnelEvent(funnelId, funnelState, {
          step_name: funnelState.steps[step - 1]?.name || `Step ${step}`,
          step_type: funnelState.steps[step - 1]?.type || 'page',
          ...additionalData
        });
        
        funnelEventQueue.push(funnelEvent);
        
        clearTimeout(funnelEventTimer);
        funnelEventTimer = setTimeout(sendFunnelEvents, BATCH_DELAY);
      }

      function createFunnelEvent(funnelId, funnelState, properties) {
        return {
          funnel_id: funnelId,
          website_id: siteId,
          visitor_id: visitorId,
          session_id: sessionId,
          current_step: funnelState.currentStep,
          completed_steps: funnelState.completedSteps,
          started_at: funnelState.startedAt,
          last_activity: funnelState.lastActivity,
          converted: funnelState.converted,
          properties
        };
      }
      
      async function sendFunnelEvents() {
        if (!funnelsValidated || funnelEventQueue.length === 0) return;
        
        const eventsToSend = [...funnelEventQueue];
        funnelEventQueue = [];
        
        try {
          const sendEvent = async (event) => {
            if (navigator.sendBeacon) {
              const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
              if (!navigator.sendBeacon(FUNNEL_API_ENDPOINT, blob)) {
                console.warn('🔍 Seentics: Failed to send via sendBeacon');
              }
            } else {
              await fetch(FUNNEL_API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event),
                keepalive: true
              });
            }
            
            // Emit for workflow tracker
            try {
              doc.dispatchEvent(new CustomEvent('seentics:funnel-event', { detail: event }));
            } catch (error) {
              console.warn('🔍 Seentics: Failed to emit funnel event:', error);
            }
          };

          await Promise.all(eventsToSend.map(sendEvent));
        } catch (error) {
          console.error('🔍 Seentics: Error sending funnel events:', error);
          funnelEventQueue.unshift(...eventsToSend);
        }
      }
      
      function saveFunnelState() {
        try {
          const funnelStates = Array.from(activeFunnels.values());
          localStorage.setItem(`${FUNNEL_STATE_KEY}_${siteId}`, JSON.stringify(funnelStates));
        } catch (error) {
          console.warn('🔍 Seentics: Error saving funnel state:', error);
        }
      }
      
      // Public API functions
      function trackFunnelStep(funnelId, stepNumber, stepData = {}) {
        if (!trackFunnels || !siteId) return;
        
        const funnelState = activeFunnels.get(funnelId);
        if (!funnelState) {
          console.warn(`🔍 Seentics: Funnel ${funnelId} not found`);
          return;
        }
        
        if (funnelState.steps?.[stepNumber - 1]) {
          updateFunnelProgress(funnelId, stepNumber, funnelState.steps[stepNumber - 1], stepData);
        }
      }
      
      function trackFunnelConversion(funnelId, conversionValue = 0, additionalData = {}) {
        if (!trackFunnels || !siteId) return;
        
        const funnelState = activeFunnels.get(funnelId);
        if (!funnelState) {
          console.warn(`🔍 Seentics: Funnel ${funnelId} not found`);
          return;
        }
        
        funnelState.converted = true;
        funnelState.lastActivity = new Date();
        activeFunnels.set(funnelId, funnelState);
        saveFunnelState();
        
        const conversionEvent = createFunnelEvent(funnelId, funnelState, {
          step_name: funnelState.steps[funnelState.currentStep - 1]?.name || `Step ${funnelState.currentStep}`,
          step_type: funnelState.steps[funnelState.currentStep - 1]?.type || 'page',
          conversion_value: conversionValue,
          ...additionalData
        });
        
        funnelEventQueue.push(conversionEvent);
        sendFunnelEvents();
      }
      
      // --- Helper Functions ---
      
      function matchesPageCondition(currentPath, stepPath) {
        if (currentPath === stepPath) return true;
        
        if (stepPath.includes('*')) {
          const regex = new RegExp(stepPath.replace(/\*/g, '.*'));
          return regex.test(currentPath);
        }
        
        if (stepPath.endsWith('*')) {
          return currentPath.startsWith(stepPath.slice(0, -1));
        }
        
        return false;
      }
      
      function matchesEventCondition(element, selector) {
        try {
          return !!(element.matches?.(selector) || element.closest?.(selector));
        } catch {
          return false;
        }
      }
      
      // --- Event Listeners ---
      
      function onRouteChange() {
        if (window.location.pathname === currentUrl) return;
        currentUrl = window.location.pathname;
        setTimeout(monitorPageChanges, 100);
      }
      
      // SPA navigation detection
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function (...args) {
        originalPushState.apply(history, args);
        onRouteChange();
      };
      
      history.replaceState = function (...args) {
        originalReplaceState.apply(history, args);
        onRouteChange();
      };
      
      window.addEventListener('popstate', onRouteChange);
      window.addEventListener('beforeunload', () => {
        if (funnelEventQueue.length > 0) {
          sendFunnelEvents();
        }
      });
      
      // --- Initialization ---
      function init() {
        if (!siteId) {
          console.warn('🔍 Seentics: siteId not provided');
          return;
        }
        
        initFunnelTracking();
        
        // Public API
        window.seentics = window.seentics || {};
        window.seentics.funnelTracker = {
          trackFunnelStep,
          trackFunnelConversion,
          getFunnelState: (funnelId) => activeFunnels.get(funnelId),
          getActiveFunnels: () => Array.from(activeFunnels.keys()),
          monitorPageChanges,
          triggerFunnelEvent: (funnelId, eventType, stepIndex = 0, additionalData = {}) => {
            const funnelEvent = {
              funnel_id: funnelId,
              current_step: stepIndex,
              completed_steps: [stepIndex],
              started_at: new Date().toISOString(),
              last_activity: new Date().toISOString(),
              converted: eventType === 'conversion',
              properties: {
                event_type: eventType,
                ...additionalData
              }
            };
            
            console.log('🎯 Manually triggering funnel event:', funnelEvent);
            doc.dispatchEvent(new CustomEvent('seentics:funnel-event', { detail: funnelEvent }));
            return funnelEvent;
          }
        };
      }

      // Initialize when DOM is ready
      if (doc.readyState === 'loading') {
        doc.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })(document);
  }
})();