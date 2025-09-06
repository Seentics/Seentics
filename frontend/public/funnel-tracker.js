(function () {
  // --- Seentics Funnel Tracker v1.0.0 ---
  // SIZE: ~6KB (optimized for funnel tracking only)
  // PERFORMANCE: Lightweight funnel tracking with batching
  // FEATURES: Page-based, event-based, and custom event funnel tracking
  
  // --- Main Funnel Tracker ---
  if (document.currentScript) {
    (function (document) {
      // Configuration
      const SCRIPT_VERSION = '1.0.0';
      const scriptTag = document.currentScript;
      const siteId = scriptTag.getAttribute('data-site-id');
      const apiHost = window.SEENTICS_CONFIG?.apiHost || 
        (window.location.hostname === 'localhost' ? 
          (window.SEENTICS_CONFIG?.devApiHost || 'http://localhost:8080') : 
          `https://${window.location.hostname}`);
      const FUNNEL_API_ENDPOINT = `${apiHost}/api/v1/funnels/track`;
      
      // Feature flags
      const trackFunnels = (scriptTag.getAttribute('data-track-funnels') || '').toLowerCase() !== 'false'; // Default ON
      
      const VISITOR_ID_KEY = 'seentics_visitor_id';
      const SESSION_ID_KEY = 'seentics_session_id';
      const FUNNEL_STATE_KEY = 'seentics_funnel_state';

      // State
      let visitorId = getOrCreateId(VISITOR_ID_KEY, 30 * 24 * 60 * 60 * 1000); // 30 days
      let sessionId = getOrCreateId(SESSION_ID_KEY, 30 * 60 * 1000); // 30 minutes
      
      // Funnel tracking state
      let activeFunnels = new Map(); // funnelId -> funnelState
      let funnelEventQueue = []; // Queue for batching funnel events
      let funnelEventTimer = null;

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

      // --- Funnel Tracking Functions ---
      
      // Initialize funnel tracking for a website
      async function initFunnelTracking() {
        if (!trackFunnels || !siteId) return;
        
        // Load funnel definitions from API
        await loadFunnelDefinitions();
        
        // Start monitoring for funnel events
        startFunnelMonitoring();
        
        // Funnel tracking initialized
      }
      
      // Load funnel definitions from API
      async function loadFunnelDefinitions() {
        try {
          // First try to load from localStorage for quick startup
          const savedFunnels = localStorage.getItem(`${FUNNEL_STATE_KEY}_${siteId}`);
          if (savedFunnels) {
            try {
              const funnels = JSON.parse(savedFunnels);
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
              // Loaded funnels from cache
            } catch (error) {
              console.warn('🔍 Seentics Funnel Tracker: Error loading cached funnels:', error);
            }
          }

          // Fetch fresh funnel definitions from API
          const response = await fetch(`${apiHost}/api/v1/funnels/active?website_id=${siteId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            keepalive: true
          });

          if (response.ok) {
            const data = await response.json();
            const funnels = data.funnels || data || [];
            
            // Clear existing funnels and reload
            activeFunnels.clear();
            
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

            // Cache the funnel definitions
            localStorage.setItem(`${FUNNEL_STATE_KEY}_${siteId}`, JSON.stringify(funnels));
            
            // Loaded funnels from API
          } else {
            console.warn('🔍 Seentics Funnel Tracker: Failed to fetch funnel definitions:', response.status);
          }
        } catch (error) {
          console.warn('🔍 Seentics Funnel Tracker: Error loading funnel definitions:', error);
        }
      }
      
      // Start monitoring for funnel events
      function startFunnelMonitoring() {
        // Monitor page changes for page-based funnel steps
        monitorPageChanges();
        
        // Monitor clicks for event-based funnel steps
        monitorClickEvents();
        
        // Monitor custom events for custom funnel steps
        monitorCustomEvents();
      }
      
      // Monitor page changes for page-based funnel steps
      function monitorPageChanges() {
        const currentPath = window.location.pathname;
        // Checking page against funnels
        
        activeFunnels.forEach((funnelState, funnelId) => {
          if (funnelState.steps) {
            let foundMatch = false;
            
            funnelState.steps.forEach((step, index) => {
              if (step.type === 'page' && step.condition && step.condition.page) {
                const stepPath = step.condition.page;
                
                // Check if current page matches funnel step
                if (matchesPageCondition(currentPath, stepPath)) {
                  // Update funnel progress
                  updateFunnelProgress(funnelId, index + 1, step);
                  foundMatch = true;
                }
              }
            });
            
            // Check for dropoff: if user has started funnel but current page doesn't match any step
            if (!foundMatch && funnelState.currentStep > 0) {
              // Dropoff detected
              
              // Create dropoff event with proper structure
              const dropoffEvent = {
                funnel_id: funnelId,
                website_id: siteId,
                visitor_id: visitorId,
                session_id: sessionId,
                current_step: funnelState.currentStep,
                completed_steps: funnelState.completedSteps,
                started_at: funnelState.startedAt,
                last_activity: new Date(),
                converted: false,
                properties: {
                  step_name: funnelState.steps[funnelState.currentStep - 1]?.name || 'Unknown',
                  step_type: funnelState.steps[funnelState.currentStep - 1]?.type || 'page',
                  dropoff_reason: "navigated_to_unexpected_page"
                }
              };
              
              // Add directly to queue instead of using queueFunnelEvent
              funnelEventQueue.push(dropoffEvent);
              
              // Send events immediately
              sendFunnelEvents();
            }
          }
        });
      }
      
      // Monitor click events for event-based funnel steps
      function monitorClickEvents() {
        document.addEventListener('click', (e) => {
          const element = e.target;
          
          activeFunnels.forEach((funnelState, funnelId) => {
            if (funnelState.steps) {
              funnelState.steps.forEach((step, index) => {
                if (step.type === 'event' && step.condition && step.condition.event) {
                  const eventSelector = step.condition.event;
                  
                  // Check if clicked element matches funnel step condition
                  if (matchesEventCondition(element, eventSelector)) {
                    // Update funnel progress
                    updateFunnelProgress(funnelId, index + 1, step);
                  }
                }
              });
            }
          });
        });
      }
      
      // Monitor custom events for custom funnel steps
      function monitorCustomEvents() {
        // Listen for custom events from the main tracker
        document.addEventListener('seentics:custom-event', (event) => {
          const { eventName, data } = event.detail;
          checkCustomEventForFunnels(eventName, data);
        });
      }
      
      // Check if custom event matches any funnel steps
      function checkCustomEventForFunnels(eventName, data = {}) {
        activeFunnels.forEach((funnelState, funnelId) => {
          if (funnelState.steps) {
            funnelState.steps.forEach((step, index) => {
              if (step.type === 'custom' && step.condition && step.condition.custom) {
                const customEventName = step.condition.custom;
                
                // Check if custom event name matches funnel step condition
                if (eventName === customEventName) {
                  // Update funnel progress
                  updateFunnelProgress(funnelId, index + 1, step, data);
                }
              }
            });
          }
        });
      }
      
      // Update funnel progress
      function updateFunnelProgress(funnelId, stepNumber, step, additionalData = {}) {
        const funnelState = activeFunnels.get(funnelId);
        if (!funnelState) return;
        
        // Only progress forward, not backward
        if (stepNumber <= funnelState.currentStep) return;
        
        // Update funnel state
        funnelState.currentStep = stepNumber;
        funnelState.completedSteps.push(stepNumber - 1);
        
        // Set started time if this is the first step
        if (stepNumber === 1 && !funnelState.startedAt) {
          funnelState.startedAt = new Date().toISOString();
        }
        
        funnelState.lastActivity = new Date();
        
        // Save updated state
        activeFunnels.set(funnelId, funnelState);
        saveFunnelState();
        
        // Queue funnel event
        queueFunnelEvent(funnelId, funnelState, stepNumber, additionalData);
        
        // Funnel progressed
      }
      
      // Queue funnel event for batching
      function queueFunnelEvent(funnelId, funnelState, step, additionalData) {
        const funnelEvent = {
          funnel_id: funnelId,
          website_id: siteId,
          visitor_id: visitorId,
          session_id: sessionId,
          current_step: funnelState.currentStep,
          completed_steps: funnelState.completedSteps,
          started_at: funnelState.startedAt,
          last_activity: funnelState.lastActivity,
          converted: funnelState.converted,
          properties: {
            step_name: funnelState.steps[step - 1]?.name || `Step ${step}`,
            step_type: funnelState.steps[step - 1]?.type || 'page',
            ...additionalData
          }
        };
        
        funnelEventQueue.push(funnelEvent);
        
        // Clear existing timer and set new one
        if (funnelEventTimer) {
          clearTimeout(funnelEventTimer);
        }
        
        funnelEventTimer = setTimeout(() => {
          sendFunnelEvents();
        }, 1000); // Send after 1 second of inactivity
      }
      
      // Send after 1 second of inactivity
      async function sendFunnelEvents() {
        if (funnelEventQueue.length === 0) return;
        
        const eventsToSend = [...funnelEventQueue];
        funnelEventQueue = [];
        
        try {
          // Sending funnel events
          // Send each funnel event
          for (const event of eventsToSend) {
            if (navigator.sendBeacon) {
              const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
              const success = navigator.sendBeacon(FUNNEL_API_ENDPOINT, blob);
              if (!success) {
                console.warn('🔍 Seentics Funnel Tracker: Failed to send funnel event via sendBeacon');
              }
            } else {
              // Fallback to fetch
              await fetch(FUNNEL_API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event),
                keepalive: true
              });
            }
            
            // Emit custom event for workflow tracker
            try {
              document.dispatchEvent(new CustomEvent('seentics:funnel-event', {
                detail: event
              }));
            } catch (error) {
              console.warn('🔍 Seentics Funnel Tracker: Failed to emit funnel event for workflow tracker:', error);
            }
          }
          
          // Funnel events sent
          
        } catch (error) {
          console.error('🔍 Seentics Funnel Tracker: Error sending funnel events:', error);
          
          // Re-queue failed events
          funnelEventQueue.unshift(...eventsToSend);
        }
      }
      
      // Save funnel state to localStorage
      function saveFunnelState() {
        try {
          const funnelStates = Array.from(activeFunnels.values());
          localStorage.setItem(`${FUNNEL_STATE_KEY}_${siteId}`, JSON.stringify(funnelStates));
        } catch (error) {
          console.warn('🔍 Seentics Funnel Tracker: Error saving funnel state:', error);
        }
      }
      
      // Public API for manual funnel tracking
      function trackFunnelStep(funnelId, stepNumber, stepData = {}) {
        if (!trackFunnels || !siteId) return;
        
        const funnelState = activeFunnels.get(funnelId);
        if (!funnelState) {
          console.warn(`🔍 Seentics Funnel Tracker: Funnel ${funnelId} not found`);
          return;
        }
        
        if (funnelState.steps && funnelState.steps[stepNumber - 1]) {
          updateFunnelProgress(funnelId, stepNumber, funnelState.steps[stepNumber - 1], stepData);
        }
      }
      
      // Public API for funnel conversion
      function trackFunnelConversion(funnelId, conversionValue = 0, additionalData = {}) {
        if (!trackFunnels || !siteId) return;
        
        const funnelState = activeFunnels.get(funnelId);
        if (!funnelState) {
          console.warn(`🔍 Seentics Funnel Tracker: Funnel ${funnelId} not found`);
          return;
        }
        
        // Mark as converted
        funnelState.converted = true;
        funnelState.lastActivity = new Date();
        
        // Save state
        activeFunnels.set(funnelId, funnelState);
        saveFunnelState();
        
        // Queue conversion event
        const conversionEvent = {
          funnel_id: funnelId,
          website_id: siteId,
          visitor_id: visitorId,
          session_id: sessionId,
          current_step: funnelState.currentStep,
          completed_steps: funnelState.completedSteps,
          started_at: funnelState.startedAt,
          last_activity: funnelState.lastActivity,
          converted: true,
          properties: {
            step_name: funnelState.steps[funnelState.currentStep - 1]?.name || `Step ${funnelState.currentStep}`,
            step_type: funnelState.steps[funnelState.currentStep - 1]?.type || 'page',
            conversion_value: conversionValue,
            ...additionalData
          }
        };
        
        funnelEventQueue.push(conversionEvent);
        sendFunnelEvents();
        
        // Funnel converted
      }
      
      // --- Helper Functions ---
      
      // Check if page matches condition
      function matchesPageCondition(currentPath, stepPath) {
        // Exact match
        if (currentPath === stepPath) return true;
        
        // Wildcard match
        if (stepPath.includes('*')) {
          const regex = new RegExp(stepPath.replace(/\*/g, '.*'));
          return regex.test(currentPath);
        }
        
        // Starts with match
        if (stepPath.endsWith('*')) {
          return currentPath.startsWith(stepPath.slice(0, -1));
        }
        
        return false;
      }
      
      // Check if element matches event condition
      function matchesEventCondition(element, selector) {
        try {
          return element.matches(selector);
        } catch (error) {
          return false;
        }
      }
      
      // --- Event Listeners ---
      
      // SPA navigation detection via History API
      let currentUrl = window.location.pathname;
      function onRouteChange() {
        if (window.location.pathname === currentUrl) return;
        currentUrl = window.location.pathname;
        setTimeout(monitorPageChanges, 100);
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
      
      // Before unload - send any pending funnel events
      window.addEventListener('beforeunload', () => {
        if (funnelEventQueue.length > 0) {
          sendFunnelEvents();
        }
      });
      
      // --- Initialization ---
      function init() {
        if (!siteId) {
          console.warn('🔍 Seentics Funnel Tracker: siteId not provided');
          return;
        }
        
        // Initialize funnel tracking
        initFunnelTracking();
        
        // Public API
        window.seentics = window.seentics || {};
        window.seentics.funnelTracker = {
          // Funnel tracking API
          trackFunnelStep: trackFunnelStep,
          trackFunnelConversion: trackFunnelConversion,
          // Funnel state access
          getFunnelState: (funnelId) => activeFunnels.get(funnelId),
          getActiveFunnels: () => Array.from(activeFunnels.keys()),
          // Debug functions
          monitorPageChanges: monitorPageChanges,
          // Manual event triggering
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
            
            // Dispatch custom event
            document.dispatchEvent(new CustomEvent('seentics:funnel-event', {
              detail: funnelEvent
            }));
            
            return funnelEvent;
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
