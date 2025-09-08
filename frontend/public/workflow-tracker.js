(function() {
  'use strict';

  // --- Constants ---
  const CONSTANTS = Object.freeze({
    DEFAULT_BATCH_DELAY: 5000,
    DEFAULT_REQUEST_TIMEOUT: 10000,
    DEFAULT_COOLDOWN_HOURS: 24,
    DEFAULT_TAG_CACHE_TTL: 300000, // 5 minutes
    THROTTLE_DELAYS: {
      SCROLL: 100,
      MOUSE_MOVE: 50,
      CLICK: 100,
      INACTIVITY_RESET: 16 // ~60fps for smooth experience
    },
    STORAGE_KEYS: {
      VISITOR_ID: 'seentics_visitor_id',
      RETURNING_VISITOR: 'seentics_returning_visitor',
      SESSION_COUNT: 'seentics_session_count',
      USER_TAGS: 'seentics_user_tags'
    },
    TRIGGER_TYPES: Object.freeze({
      PAGE_VIEW: 'Page View',
      TIME_SPENT: 'Time Spent',
      SCROLL_DEPTH: 'Scroll Depth',
      EXIT_INTENT: 'Exit Intent',
      ELEMENT_CLICK: 'Element Click',
      INACTIVITY: 'Inactivity',
      CUSTOM_EVENT: 'Custom Event',
      FUNNEL: 'Funnel'
    }),
    ACTION_TYPES: Object.freeze({
      SHOW_MODAL: 'Show Modal',
      SHOW_BANNER: 'Show Banner',
      INSERT_SECTION: 'Insert Section',
      REDIRECT_URL: 'Redirect URL',
      TRACK_EVENT: 'Track Event',
      WAIT: 'Wait'
    }),
    CONDITION_TYPES: Object.freeze({
      URL_PATH: 'URL Path',
      DEVICE_TYPE: 'Device Type',
      BROWSER: 'Browser',
      TRAFFIC_SOURCE: 'Traffic Source',
      NEW_VS_RETURNING: 'New vs Returning',
      AB_SPLIT: 'A/B Split',
      BRANCH_SPLIT: 'Branch Split',
      TIME_WINDOW: 'Time Window',
      QUERY_PARAM: 'Query Param',
      TAG: 'Tag',
      JOIN: 'Join',
      FREQUENCY_CAP: 'Frequency Cap'
    })
  });

  // --- Utility Functions ---
  const Utils = {
    // Safe localStorage operations with error handling
    storage: {
      get(key, defaultValue = null) {
        try {
          const value = localStorage.getItem(key);
          return value !== null ? value : defaultValue;
        } catch (e) {
          console.warn(`[Seentics] localStorage read error for key '${key}':`, e);
          return defaultValue;
        }
      },
      
      set(key, value) {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (e) {
          console.warn(`[Seentics] localStorage write error for key '${key}':`, e);
          return false;
        }
      },
      
      getJSON(key, defaultValue = null) {
        try {
          const value = this.get(key);
          return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
          console.warn(`[Seentics] JSON parse error for key '${key}':`, e);
          return defaultValue;
        }
      },
      
      setJSON(key, value) {
        try {
          return this.set(key, JSON.stringify(value));
        } catch (e) {
          console.warn(`[Seentics] JSON stringify error for key '${key}':`, e);
          return false;
        }
      }
    },

    // Session storage operations
    sessionStorage: {
      get(key, defaultValue = null) {
        try {
          const value = sessionStorage.getItem(key);
          return value !== null ? value : defaultValue;
        } catch (e) {
          console.warn(`[Seentics] sessionStorage read error for key '${key}':`, e);
          return defaultValue;
        }
      },
      
      set(key, value) {
        try {
          sessionStorage.setItem(key, value);
          return true;
        } catch (e) {
          console.warn(`[Seentics] sessionStorage write error for key '${key}':`, e);
          return false;
        }
      }
    },

    // Throttling utility
    createThrottledFunction(fn, delay) {
      let lastCall = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          return fn.apply(this, args);
        }
      };
    },

    // Debouncing utility
    createDebouncedFunction(fn, delay) {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
        return timeoutId;
      };
    },

    // Safe DOM operations
    dom: {
      createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
          if (key === 'className') {
            element.className = value;
          } else if (key === 'textContent') {
            element.textContent = value;
          } else if (key === 'innerHTML') {
            element.innerHTML = value;
          } else {
            element.setAttribute(key, value);
          }
        });
        return element;
      },

      safeQuery(selector) {
        try {
          return document.querySelector(selector);
        } catch (e) {
          console.warn(`[Seentics] Invalid selector '${selector}':`, e);
          return null;
        }
      },

      safeQueryAll(selector) {
        try {
          return document.querySelectorAll(selector);
        } catch (e) {
          console.warn(`[Seentics] Invalid selector '${selector}':`, e);
          return [];
        }
      }
    },

    // Browser detection
    getBrowser() {
      const ua = navigator.userAgent;
      if (ua.includes('Chrome') && !ua.includes('Edg')) return 'chrome';
      if (ua.includes('Firefox')) return 'firefox';
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
      if (ua.includes('Edg')) return 'edge';
      return 'other';
    },

    isMobile() {
      return /Mobi|Android/i.test(navigator.userAgent);
    },

    // Generate unique IDs
    generateId(prefix = 'id') {
      return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    },

    // Extract body content from HTML
    extractBodyContent(html) {
      if (!html || typeof html !== 'string') return '';
      
      try {
        const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
        if (bodyMatch && bodyMatch[1]) {
          return bodyMatch[1];
        }
        
        return html
          .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
          .replace(/<\/?html[^>]*>/gi, '')
          .replace(/<head[\s\S]*?<\/head>/gi, '');
      } catch (e) {
        console.warn('[Seentics] Error extracting body content:', e);
        return html;
      }
    },

    // Safe async operations with timeout
    async withTimeout(promise, timeoutMs = CONSTANTS.DEFAULT_REQUEST_TIMEOUT) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        const result = await Promise.race([
          promise,
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => {
              reject(new Error(`Operation timed out after ${timeoutMs}ms`));
            });
          })
        ]);
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    }
  };

  // --- Analytics Manager ---
  class AnalyticsManager {
    constructor(tracker) {
      this.tracker = tracker;
      this.batch = [];
      this.batchTimer = null;
      this.batchDelay = this._getBatchDelay();
    }

    _getBatchDelay() {
      const configDelay = window.SEENTICS_CONFIG?.batchDelay;
      return configDelay && Number.isFinite(configDelay) && configDelay > 0 
        ? configDelay 
        : CONSTANTS.DEFAULT_BATCH_DELAY;
    }

    addEvent(payload) {
      if (!payload || !payload.type) {
        console.warn('[Seentics] Invalid analytics payload:', payload);
        return;
      }

      // Prevent duplicate events
      const isDuplicate = this.batch.some(event => 
        event.type === payload.type && 
        event.runId === payload.runId && 
        event.nodeId === payload.nodeId
      );
      
      if (isDuplicate) {
        console.log(`[Seentics] Skipping duplicate event: ${payload.type} for node: ${payload.nodeId}`);
        return;
      }
      
      console.log(`[Seentics] Adding to batch: ${payload.type} (batch size: ${this.batch.length + 1})`);
      this.batch.push(payload);
      
      this._scheduleBatchFlush();
    }

    _scheduleBatchFlush() {
      if (this.batchTimer) return;
      
      this.batchTimer = setTimeout(() => {
        this.flushBatch();
      }, this.batchDelay);
    }

    async flushBatch() {
      if (this.batch.length === 0) {
        this._clearBatchTimer();
        return;
      }

      const batch = [...this.batch];
      this.batch = [];
      this._clearBatchTimer();

      try {
        await this._sendBatch(batch);
      } catch (error) {
        console.error('[Seentics] Batch send failed, falling back to individual events:', error);
        // Fallback to individual requests
        batch.forEach(event => this._sendIndividualEvent(event));
      }
    }

    async _sendBatch(batch) {
      const apiHost = this.tracker._getApiHost();
      const payload = {
        siteId: this.tracker.siteId,
        events: batch
      };

      const response = await Utils.withTimeout(
        fetch(`${apiHost}/api/v1/workflows/analytics/track/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        })
      );

      if (!response.ok) {
        throw new Error(`Analytics batch failed: ${response.status}`);
      }
    }

    async _sendIndividualEvent(payload) {
      try {
        const apiHost = this.tracker._getApiHost();
        await Utils.withTimeout(
          fetch(`${apiHost}/api/v1/workflows/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
          })
        );
      } catch (error) {
        console.warn('[Seentics] Failed to send individual event:', error);
      }
    }

    _clearBatchTimer() {
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }
    }

    destroy() {
      this.flushBatch();
      this._clearBatchTimer();
    }
  }

  // --- Resource Manager ---
  class ResourceManager {
    constructor() {
      this.timers = new Set();
      this.eventListeners = new Map();
      this.abortControllers = new Set();
    }

    addTimer(timerId) {
      this.timers.add(timerId);
      return timerId;
    }

    clearTimer(timerId) {
      if (this.timers.has(timerId)) {
        clearTimeout(timerId);
        this.timers.delete(timerId);
      }
    }

    addEventListener(key, cleanupFunction) {
      if (this.eventListeners.has(key)) {
        // Clean up existing listener first
        this.eventListeners.get(key)();
      }
      this.eventListeners.set(key, cleanupFunction);
    }

    removeEventListener(key) {
      if (this.eventListeners.has(key)) {
        this.eventListeners.get(key)();
        this.eventListeners.delete(key);
      }
    }

    addAbortController(controller) {
      this.abortControllers.add(controller);
      return controller;
    }

    destroy() {
      // Clear all timers
      this.timers.forEach(timerId => {
        try {
          clearTimeout(timerId);
        } catch (e) {
          console.warn('[Seentics] Error clearing timer:', e);
        }
      });
      this.timers.clear();

      // Clean up all event listeners
      this.eventListeners.forEach((cleanup, key) => {
        try {
          cleanup();
        } catch (e) {
          console.warn(`[Seentics] Error cleaning up listener '${key}':`, e);
        }
      });
      this.eventListeners.clear();

      // Abort all pending requests
      this.abortControllers.forEach(controller => {
        try {
          controller.abort();
        } catch (e) {
          console.warn('[Seentics] Error aborting request:', e);
        }
      });
      this.abortControllers.clear();
    }
  }

  // --- Main Workflow Tracker ---
  const workflowTracker = {
    // Core properties
    siteId: null,
    visitorId: null,
    identifiedUser: null,
    isReturningVisitor: false,
    activeWorkflows: [],
    isInitialized: false,

    // Managers
    analyticsManager: null,
    resourceManager: null,
    joinStates: new Map(),

    // Initialization
    init(siteId) {
      if (this.isInitialized) {
        console.warn(`[Seentics] Already initialized for site: ${this.siteId}`);
        return;
      }

      if (!siteId || typeof siteId !== 'string') {
        console.error('[Seentics] Invalid siteId provided');
        return;
      }

      try {
        this.siteId = siteId;
        this.visitorId = this._getOrCreateVisitorId();
        this.isReturningVisitor = this._checkIfReturning();
        
        // Initialize managers
        this.analyticsManager = new AnalyticsManager(this);
        this.resourceManager = new ResourceManager();

        // Set up cleanup on page unload
        window.addEventListener('beforeunload', () => this.destroy());

        if (siteId === 'preview') {
          this._initPreviewMode();
        } else {
          this._fetchWorkflows();
        }

        this.isInitialized = true;
        this._log('Successfully initialized');
      } catch (error) {
        console.error('[Seentics] Initialization failed:', error);
      }
    },

    _initPreviewMode() {
      if (window.SEENTICS_CONFIG?.debugMode) {
        console.log('[Seentics] Preview mode: Loading single workflow');
      }
      
      if (window.__SEENTICS_PREVIEW_WORKFLOW) {
        this.activeWorkflows = [window.__SEENTICS_PREVIEW_WORKFLOW];
        this._setupTriggers();
      }
    },

    _getOrCreateVisitorId() {
      let visitorId = Utils.storage.get(CONSTANTS.STORAGE_KEYS.VISITOR_ID);
      if (!visitorId) {
        visitorId = Utils.generateId('visitor');
        Utils.storage.set(CONSTANTS.STORAGE_KEYS.VISITOR_ID, visitorId);
      }
      return visitorId;
    },

    _checkIfReturning() {
      const isReturning = Utils.storage.get(CONSTANTS.STORAGE_KEYS.RETURNING_VISITOR);
      if (isReturning) {
        return true;
      }
      Utils.storage.set(CONSTANTS.STORAGE_KEYS.RETURNING_VISITOR, 'true');
      return false;
    },

    _getApiHost() {
      const config = window.SEENTICS_CONFIG;
      if (config?.apiHost) return config.apiHost;
      
      if (window.location.hostname === 'localhost') {
        return config?.devApiHost || 'http://localhost:8080';
      }
      
      return `https://${window.location.hostname}`;
    },

    // User identification
    identify(userId, attributes = {}) {
      if (!userId || typeof userId !== 'string') {
        console.warn('[Seentics] Invalid userId provided to identify()');
        return;
      }

      this.identifiedUser = {
        id: userId,
        attributes: typeof attributes === 'object' ? attributes : {}
      };
      
      this._log(`User identified: ${userId}`, attributes);
    },

    // Event processing
    processEvent(event) {
      if (!event || !event.type) {
        console.warn('[Seentics] Invalid event:', event);
        return;
      }

      switch (event.type) {
        case 'pageview':
          this._checkWorkflows(CONSTANTS.TRIGGER_TYPES.PAGE_VIEW);
          break;
        case 'custom':
          if (event.eventName) {
            this._checkWorkflows(CONSTANTS.TRIGGER_TYPES.CUSTOM_EVENT, { eventName: event.eventName });
          }
          break;
        default:
          console.warn(`[Seentics] Unknown event type: ${event.type}`);
      }
    },

    // Workflow management
    async _fetchWorkflows() {
      try {
        const apiHost = this._getApiHost();
        const controller = new AbortController();
        this.resourceManager.addAbortController(controller);

        const response = await Utils.withTimeout(
          fetch(`${apiHost}/api/v1/workflows/site/${this.siteId}/active`, {
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' }
          })
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data?.workflows) {
          this.activeWorkflows = data.workflows.filter(wf => wf.status === 'Active');
          this._log(`Loaded ${this.activeWorkflows.length} active workflows`);
          this._setupTriggers();
        }
      } catch (error) {
        console.error('[Seentics] Failed to fetch workflows:', error);
      }
    },

    _setupTriggers() {
      if (!Array.isArray(this.activeWorkflows) || this.activeWorkflows.length === 0) {
        this._log('No active workflows to set up triggers for');
        return;
      }

      this._log(`Setting up triggers for ${this.activeWorkflows.length} workflows`);
      
      // Immediate triggers
      this._checkWorkflows(CONSTANTS.TRIGGER_TYPES.PAGE_VIEW);
      
      // Deferred triggers (set up listeners but don't fire immediately)
      this._setupTimeSpentTriggers();
      this._setupScrollTriggers();
      this._setupExitIntentTriggers();
      this._setupClickTriggers();
      this._setupInactivityTriggers();
      this._setupFunnelListeners();
      
      this._log('Trigger setup completed');
    },

    _setupTimeSpentTriggers() {
      this.activeWorkflows.forEach(workflow => {
        if (workflow.status !== 'Active') return;
        
        const triggerNodes = this._getTriggerNodes(workflow, CONSTANTS.TRIGGER_TYPES.TIME_SPENT);
        triggerNodes.forEach(node => this._setupTimeSpentTrigger(workflow, node));
      });
    },

    _setupTimeSpentTrigger(workflow, triggerNode) {
      const seconds = triggerNode.data?.settings?.seconds || 0;
      const delayMs = Math.max(0, seconds * 1000);
      
      if (delayMs <= 0) {
        console.warn(`[Seentics] Invalid time spent delay for workflow '${workflow.name}'`);
        return;
      }

      const timerId = setTimeout(() => {
        this._log(`Time spent trigger fired for '${workflow.name}'`);
        this._executeWorkflowFromTrigger(workflow, triggerNode);
      }, delayMs);

      this.resourceManager.addTimer(timerId);
      
      const cleanupKey = `timeSpent_${workflow.id}_${triggerNode.id}`;
      this.resourceManager.addEventListener(cleanupKey, () => {
        this.resourceManager.clearTimer(timerId);
      });
    },

    _setupScrollTriggers() {
      const scrollTriggers = [];
      
      this.activeWorkflows.forEach(workflow => {
        if (workflow.status !== 'Active') return;
        
        const triggerNodes = this._getTriggerNodes(workflow, CONSTANTS.TRIGGER_TYPES.SCROLL_DEPTH);
        triggerNodes.forEach(node => {
          const depth = node.data?.settings?.scrollDepth || 0;
          if (depth > 0) {
            scrollTriggers.push({ workflow, node, depth, triggered: false });
          }
        });
      });

      if (scrollTriggers.length === 0) return;

      const throttledScrollHandler = Utils.createThrottledFunction(() => {
        const scrollPercent = this._calculateScrollPercent();
        
        scrollTriggers.forEach(trigger => {
          if (!trigger.triggered && scrollPercent >= trigger.depth) {
            trigger.triggered = true;
            this._log(`Scroll depth trigger fired for '${trigger.workflow.name}' at ${scrollPercent}%`);
            this._executeWorkflowFromTrigger(trigger.workflow, trigger.node);
          }
        });

        // Remove triggered handlers to improve performance
        if (scrollTriggers.every(t => t.triggered)) {
          window.removeEventListener('scroll', throttledScrollHandler);
        }
      }, CONSTANTS.THROTTLE_DELAYS.SCROLL);

      window.addEventListener('scroll', throttledScrollHandler, { passive: true });
      
      this.resourceManager.addEventListener('scrollTriggers', () => {
        window.removeEventListener('scroll', throttledScrollHandler);
      });
    },

    _calculateScrollPercent() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const documentHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollableHeight = Math.max(documentHeight - windowHeight, 1);
      
      return Math.min((scrollTop / scrollableHeight) * 100, 100);
    },

    _setupExitIntentTriggers() {
      const exitTriggers = [];
      
      this.activeWorkflows.forEach(workflow => {
        if (workflow.status !== 'Active') return;
        
        const triggerNodes = this._getTriggerNodes(workflow, CONSTANTS.TRIGGER_TYPES.EXIT_INTENT);
        triggerNodes.forEach(node => {
          exitTriggers.push({ workflow, node, triggered: false });
        });
      });

      if (exitTriggers.length === 0) return;

      let lastY = null;
      const throttledMouseMove = Utils.createThrottledFunction((e) => {
        const y = e.clientY;
        if (typeof y === 'number') {
          if (y <= 3 && (lastY === null || lastY > 3)) {
            this._triggerExitIntent(exitTriggers);
          }
          lastY = y;
        }
      }, CONSTANTS.THROTTLE_DELAYS.MOUSE_MOVE);

      const handleMouseLeave = (e) => {
        if (e.clientY <= 0) {
          this._triggerExitIntent(exitTriggers);
        }
      };

      const handleMouseOut = (e) => {
        const related = e.relatedTarget;
        if (!related || related.nodeName === 'HTML') {
          if (e.clientY <= 10) {
            this._triggerExitIntent(exitTriggers);
          }
        }
      };

      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseout', handleMouseOut);
      document.addEventListener('mousemove', throttledMouseMove, true);

      this.resourceManager.addEventListener('exitIntentTriggers', () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mouseout', handleMouseOut);
        document.removeEventListener('mousemove', throttledMouseMove, true);
      });
    },

    _triggerExitIntent(exitTriggers) {
      exitTriggers.forEach(trigger => {
        if (!trigger.triggered) {
          trigger.triggered = true;
          this._log(`Exit intent trigger fired for '${trigger.workflow.name}'`);
          this._executeWorkflowFromTrigger(trigger.workflow, trigger.node);
        }
      });
    },

    _setupClickTriggers() {
      const clickTriggers = [];
      
      this.activeWorkflows.forEach(workflow => {
        if (workflow.status !== 'Active') return;
        
        const triggerNodes = this._getTriggerNodes(workflow, CONSTANTS.TRIGGER_TYPES.ELEMENT_CLICK);
        triggerNodes.forEach(node => {
          const selector = node.data?.settings?.selector;
          if (selector) {
            clickTriggers.push({ workflow, node, selector, triggered: false });
          }
        });
      });

      if (clickTriggers.length === 0) return;

      const throttledClickHandler = Utils.createThrottledFunction((e) => {
        const target = e.target;
        if (!target) return;

        clickTriggers.forEach(trigger => {
          if (!trigger.triggered) {
            try {
              if (target.matches?.(trigger.selector) || target.closest?.(trigger.selector)) {
                trigger.triggered = true;
                this._log(`Element click trigger fired for '${trigger.workflow.name}'`);
                this._executeWorkflowFromTrigger(trigger.workflow, trigger.node);
              }
            } catch (e) {
              console.warn(`[Seentics] Invalid selector '${trigger.selector}':`, e);
            }
          }
        });
      }, CONSTANTS.THROTTLE_DELAYS.CLICK);

      document.addEventListener('click', throttledClickHandler, true);
      
      this.resourceManager.addEventListener('clickTriggers', () => {
        document.removeEventListener('click', throttledClickHandler, true);
      });
    },

    _setupInactivityTriggers() {
      this.activeWorkflows.forEach(workflow => {
        if (workflow.status !== 'Active') return;
        
        const triggerNodes = this._getTriggerNodes(workflow, CONSTANTS.TRIGGER_TYPES.INACTIVITY);
        triggerNodes.forEach(node => this._setupInactivityTrigger(workflow, node));
      });
    },

    _setupInactivityTrigger(workflow, triggerNode) {
      const thresholdMs = (triggerNode.data?.settings?.inactivitySeconds || 30) * 1000;
      let timeoutId = null;
      let isFired = false;

      const fire = () => {
        if (isFired) return;
        isFired = true;
        this._log(`Inactivity trigger fired for '${workflow.name}'`);
        this._executeWorkflowFromTrigger(workflow, triggerNode);
        cleanup();
      };

      const resetTimer = Utils.createThrottledFunction(() => {
        if (isFired) return;
        
        if (timeoutId) {
          this.resourceManager.clearTimer(timeoutId);
        }
        
        timeoutId = setTimeout(fire, thresholdMs);
        this.resourceManager.addTimer(timeoutId);
      }, CONSTANTS.THROTTLE_DELAYS.INACTIVITY_RESET);

      const activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
      
      const cleanup = () => {
        if (timeoutId) {
          this.resourceManager.clearTimer(timeoutId);
        }
        activityEvents.forEach(evt => {
          document.removeEventListener(evt, resetTimer, true);
        });
      };

      activityEvents.forEach(evt => {
        document.addEventListener(evt, resetTimer, true);
      });
      resetTimer();

      const cleanupKey = `inactivity_${workflow.id}_${triggerNode.id}`;
      this.resourceManager.addEventListener(cleanupKey, cleanup);
    },

    _setupFunnelListeners() {
      // Listen for funnel events
      document.addEventListener('seentics:funnel-event', (event) => {
        const funnelEvent = event.detail;
        if (funnelEvent) {
          this._log(`Funnel event received: ${funnelEvent.event_type} for funnel ${funnelEvent.funnel_id}`);
          this._checkWorkflows(CONSTANTS.TRIGGER_TYPES.FUNNEL, funnelEvent);
        }
      });

      // Fetch and add funnel workflows
      this._fetchFunnelWorkflows();
    },

    _getTriggerNodes(workflow, triggerType) {
      if (!workflow?.nodes || !Array.isArray(workflow.nodes)) return [];
      
      return workflow.nodes.filter(node =>
        node.data?.type === 'Trigger' && node.data?.title === triggerType
      );
    },

    _executeWorkflowFromTrigger(workflow, triggerNode) {
      const runId = Utils.generateId('run');
      this._trackWorkflowEvent(workflow, triggerNode, 'Trigger', { runId });
      this._executeWorkflow(workflow, triggerNode, { runId, completionSent: false });
    },

    // Workflow execution
    _checkWorkflows(triggerType, eventData = {}) {
      if (!triggerType) {
        console.warn('[Seentics] Invalid trigger type provided to _checkWorkflows');
        return;
      }

      this._log(`Checking workflows for trigger: ${triggerType}`, eventData);
      
      this.activeWorkflows.forEach(workflow => {
        if (workflow.status !== 'Active') {
          this._log(`Skipping inactive workflow: ${workflow.name}`);
          return;
        }

        const triggerNodes = this._getTriggerNodes(workflow, triggerType);
        this._log(`Workflow '${workflow.name}' has ${triggerNodes.length} '${triggerType}' trigger nodes`);
        
        triggerNodes.forEach(triggerNode => {
          if (this._shouldTriggerWorkflow(workflow, triggerNode, triggerType, eventData)) {
            this._executeWorkflowWithCooldown(workflow, triggerNode, triggerType);
          }
        });
      });
    },

    _shouldTriggerWorkflow(workflow, triggerNode, triggerType, eventData) {
      const settings = triggerNode.data?.settings || {};
      
      switch (triggerType) {
        case CONSTANTS.TRIGGER_TYPES.PAGE_VIEW:
          return this._checkUrlCondition(settings);
        case CONSTANTS.TRIGGER_TYPES.CUSTOM_EVENT:
          return settings.customEventName === eventData.eventName;
        case CONSTANTS.TRIGGER_TYPES.FUNNEL:
          return this._checkFunnelCondition(settings, eventData);
        default:
          return true;
      }
    },

    _executeWorkflowWithCooldown(workflow, triggerNode, triggerType) {
      // Handle funnel triggers with session-based cooldown
      if (triggerType === CONSTANTS.TRIGGER_TYPES.FUNNEL) {
        const sessionKey = `seentics_funnel_modal_shown_${workflow.id}`;
        if (Utils.sessionStorage.get(sessionKey)) {
          this._log(`Workflow '${workflow.name}' already shown this session - skipping`);
          return;
        }
        Utils.sessionStorage.set(sessionKey, 'true');
      } else {
        // Default cooldown for other triggers
        if (!this._checkCooldown(workflow, triggerType)) {
          return;
        }
      }

      this._log(`Workflow '${workflow.name}' triggered by '${triggerType}'`);
      this._executeWorkflowFromTrigger(workflow, triggerNode);
    },

    _checkCooldown(workflow, triggerType) {
      const cooldownSeconds = this._getCooldownSeconds(workflow, triggerType);
      if (cooldownSeconds <= 0) return true;

      const key = `seentics_cooldown_${workflow.id}_${triggerType}`;
      const lastTriggered = parseInt(Utils.storage.get(key, '0'), 10);
      const now = Math.floor(Date.now() / 1000);
      
      if (now - lastTriggered < cooldownSeconds) {
        this._log(
          `Workflow '${workflow.name}' blocked by cooldown (${cooldownSeconds}s). ` +
          `Last triggered: ${new Date(lastTriggered * 1000).toLocaleString()}`
        );
        return false;
      }

      Utils.storage.set(key, String(now));
      this._log(
        `Workflow '${workflow.name}' cooldown set for ${cooldownSeconds}s ` +
        `until ${new Date((now + cooldownSeconds) * 1000).toLocaleString()}`
      );
      return true;
    },

    _getCooldownSeconds(workflow, triggerType) {
      // Look for frequency cap condition in workflow
      const frequencyCapNode = workflow.nodes?.find(node =>
        node.data?.title === CONSTANTS.CONDITION_TYPES.FREQUENCY_CAP
      );
      
      if (frequencyCapNode?.data?.settings?.cooldownSeconds) {
        return frequencyCapNode.data.settings.cooldownSeconds;
      }
      
      return CONSTANTS.DEFAULT_COOLDOWN_HOURS * 3600; // 24 hours default
    },

    async _executeWorkflow(workflow, currentNode, runContext) {
      if (!currentNode) {
        this._log(`Workflow '${workflow.name}' completed`);
        this.analyticsManager.flushBatch();
        return;
      }

      const stepStartTime = Date.now();
      const nodeType = currentNode.data?.type;
      const nodeTitle = currentNode.data?.title;

      // Track step entry
      this._trackWorkflowEvent(workflow, currentNode, 'Step Entered', {
        runId: runContext?.runId,
        stepOrder: this._getStepOrder(currentNode, workflow),
        stepType: nodeType
      });

      try {
        if (nodeType === 'Condition') {
          const conditionResult = await this._evaluateCondition(currentNode, workflow, runContext);
          
          this._trackWorkflowEvent(workflow, currentNode, 'Condition Evaluated', {
            runId: runContext?.runId,
            stepOrder: this._getStepOrder(currentNode, workflow),
            stepType: nodeType,
            success: conditionResult,
            executionTime: Date.now() - stepStartTime
          });

          if (!conditionResult && nodeTitle !== CONSTANTS.CONDITION_TYPES.JOIN) {
            this._log(`Workflow '${workflow.name}' stopped at condition '${nodeTitle}'`);
            this.analyticsManager.flushBatch();
            return;
          }

          // Handle join condition specially
          if (nodeTitle === CONSTANTS.CONDITION_TYPES.JOIN) {
            const shouldContinue = await this._handleJoinCondition(
              workflow, currentNode, runContext
            );
            if (!shouldContinue) return;
          }
        }

        if (nodeType === 'Action') {
          await this._executeAction(currentNode, workflow, runContext);
          
          if (nodeTitle !== CONSTANTS.ACTION_TYPES.WAIT && !currentNode.data?.isServerAction) {
            if (runContext && !runContext.completionSent) {
              runContext.completionSent = true;
              this._trackWorkflowEvent(workflow, currentNode, 'Action Executed', {
                runId: runContext.runId,
                sourceNodeId: currentNode.id,
                stepOrder: this._getStepOrder(currentNode, workflow),
                stepType: nodeType,
                success: true,
                executionTime: Date.now() - stepStartTime
              });
            }
          }
        }

        // Track step completion
        this._trackWorkflowEvent(workflow, currentNode, 'Step Completed', {
          runId: runContext?.runId,
          stepOrder: this._getStepOrder(currentNode, workflow),
          stepType: nodeType,
          success: true,
          executionTime: Date.now() - stepStartTime
        });

        // Execute next nodes
        await this._executeNextNodes(workflow, currentNode, runContext);

      } catch (error) {
        console.error(`[Seentics] Error executing workflow step:`, error);
        
        this._trackWorkflowEvent(workflow, currentNode, 'Step Failed', {
          runId: runContext?.runId,
          stepOrder: this._getStepOrder(currentNode, workflow),
          stepType: nodeType,
          success: false,
          executionTime: Date.now() - stepStartTime,
          detail: error.message
        });
      }
    },

    async _executeNextNodes(workflow, currentNode, runContext) {
      const outgoingEdges = workflow.edges?.filter(edge => edge.source === currentNode.id) || [];
      const nextNodes = outgoingEdges
        .map(edge => workflow.nodes?.find(node => node.id === edge.target))
        .filter(Boolean);

      if (nextNodes.length === 0) return;

      // Handle branch split specially
      if (currentNode.data?.title === CONSTANTS.CONDITION_TYPES.BRANCH_SPLIT) {
        const chosenNode = this._selectBranchSplitPath(currentNode, nextNodes, outgoingEdges);
        if (chosenNode) {
          await this._executeWorkflow(workflow, chosenNode, runContext);
        }
        return;
      }

      // Add delay for server actions
      if (currentNode.data?.isServerAction) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Execute all next nodes in parallel
      await Promise.all(
        nextNodes.map(node => this._executeWorkflow(workflow, node, runContext))
      );
    },

    _selectBranchSplitPath(branchNode, nextNodes, outgoingEdges) {
      const settings = branchNode.data?.settings || {};
      const variantsCount = parseInt(settings.variantsCount || 2, 10);
      
      const weights = [
        Math.max(0, Math.min(100, parseInt(settings.variantAPercent || 50, 10))),
        Math.max(0, Math.min(100, parseInt(settings.variantBPercent || 50, 10)))
      ];
      
      if (variantsCount === 3) {
        weights.push(Math.max(0, Math.min(100, parseInt(settings.variantCPercent || 0, 10))));
      }

      // Normalize weights and select
      const total = Math.max(1, weights.reduce((sum, w) => sum + w, 0));
      let random = Math.random() * total;
      let selectedIndex = 0;

      for (let i = 0; i < weights.length; i++) {
        if (random < weights[i]) {
          selectedIndex = i;
          break;
        }
        random -= weights[i];
      }

      // Try to find edge with matching label
      const variantCodes = ['A', 'B', 'C'];
      const chosenCode = variantCodes[Math.min(selectedIndex, variantCodes.length - 1)];
      const labeledEdge = outgoingEdges.find(edge => {
        const edgeLabel = (edge.label || edge.data?.label || '').toString().toLowerCase().trim();
        return edgeLabel === chosenCode.toLowerCase();
      });

      if (labeledEdge) {
        return nextNodes.find(node => node.id === labeledEdge.target);
      }

      // Fallback to index-based selection
      return nextNodes[Math.min(selectedIndex, nextNodes.length - 1)];
    },

    async _handleJoinCondition(workflow, joinNode, runContext) {
      const runId = runContext?.runId || Utils.generateId('run');
      const joinKey = `${workflow.id}_${joinNode.id}_${runId}`;
      
      if (!this.joinStates.has(joinKey)) {
        const inboundCount = workflow.edges?.filter(e => e.target === joinNode.id).length || 0;
        this.joinStates.set(joinKey, {
          count: 0,
          inboundCount,
          timer: null,
          locked: false
        });
      }

      const joinState = this.joinStates.get(joinKey);
      joinState.count++;

      if (joinState.count < joinState.inboundCount) {
        // Set up timeout if configured and not already set
        if (!joinState.timer && !joinState.locked) {
          joinState.locked = true;
          const timeoutSeconds = parseInt(joinNode.data?.settings?.joinTimeoutSeconds || 0, 10);
          
          if (timeoutSeconds > 0) {
            const timerId = setTimeout(() => {
              this._log(`Join timeout reached; continuing without all branches (${joinState.count}/${joinState.inboundCount})`);
              this.joinStates.delete(joinKey);
              this._executeWorkflow(workflow, joinNode, runContext);
            }, timeoutSeconds * 1000);
            
            joinState.timer = timerId;
            this.resourceManager.addTimer(timerId);
          }
        }
        
        this._log(`Join waiting: ${joinState.count}/${joinState.inboundCount}`);
        return false; // Don't continue yet
      }

      // All branches have arrived
      if (joinState.timer) {
        this.resourceManager.clearTimer(joinState.timer);
      }
      this.joinStates.delete(joinKey);
      return true; // Continue execution
    },

    // Condition evaluation
    async _evaluateCondition(conditionNode, workflow, runContext) {
      const conditionData = conditionNode.data;
      const settings = conditionData?.settings || {};
      const conditionType = conditionData?.title;

      if (!conditionType) {
        console.warn('[Seentics] Condition node missing title');
        return false;
      }

      try {
        switch (conditionType) {
          case CONSTANTS.CONDITION_TYPES.URL_PATH:
            return this._checkUrlCondition(settings);
          
          case CONSTANTS.CONDITION_TYPES.DEVICE_TYPE:
            return this._checkDeviceTypeCondition(settings);
          
          case CONSTANTS.CONDITION_TYPES.BROWSER:
            return this._checkBrowserCondition(settings);
          
          case CONSTANTS.CONDITION_TYPES.TRAFFIC_SOURCE:
            return this._checkTrafficSourceCondition(settings);
          
          case CONSTANTS.CONDITION_TYPES.NEW_VS_RETURNING:
            return this._checkVisitorTypeCondition(settings);
          
          case CONSTANTS.CONDITION_TYPES.AB_SPLIT:
            return this._checkABSplitCondition(settings);
          
          case CONSTANTS.CONDITION_TYPES.BRANCH_SPLIT:
            return true; // Branch split always continues, selection happens in execution
          
          case CONSTANTS.CONDITION_TYPES.TIME_WINDOW:
            return this._checkTimeWindowCondition(settings);
          
          case CONSTANTS.CONDITION_TYPES.QUERY_PARAM:
            return this._checkQueryParamCondition(settings);
          
          case CONSTANTS.CONDITION_TYPES.TAG:
            return await this._checkTagCondition(settings);
          
          case CONSTANTS.CONDITION_TYPES.JOIN:
            return true; // Join handling is done separately
          
          default:
            console.warn(`[Seentics] Unknown condition type: ${conditionType}`);
            return true;
        }
      } catch (error) {
        console.error(`[Seentics] Error evaluating condition '${conditionType}':`, error);
        return false;
      }
    },

    _checkUrlCondition(settings) {
      if (!settings?.url) return true;

      let currentUrl = window.location.href;
      let path = window.location.pathname;

      // Preview mode override
      if (this.siteId === 'preview' && window.__SEENTICS_PREVIEW_PATH) {
        try {
          path = window.__SEENTICS_PREVIEW_PATH;
          currentUrl = window.location.origin + path;
        } catch (e) {
          console.warn('[Seentics] Error applying preview path override:', e);
        }
      }

      const targetUrl = settings.url;
      const matchType = settings.urlMatchType || 'contains';

      switch (matchType) {
        case 'exact':
          return currentUrl === targetUrl || path === targetUrl;
        case 'contains':
          return currentUrl.includes(targetUrl);
        case 'startsWith':
          return path.startsWith(targetUrl);
        case 'endsWith':
          return path.endsWith(targetUrl);
        default:
          return currentUrl.includes(targetUrl);
      }
    },

    _checkDeviceTypeCondition(settings) {
      if (!settings?.deviceType) return false;
      
      const isMobile = Utils.isMobile();
      return (settings.deviceType === 'Mobile') === isMobile;
    },

    _checkBrowserCondition(settings) {
      if (!settings?.browser) return false;
      
      return Utils.getBrowser() === settings.browser;
    },

    _checkTrafficSourceCondition(settings) {
      const referrer = document.referrer;
      const referrerUrl = settings?.referrerUrl;
      
      if (!referrerUrl) {
        return !referrer; // Direct traffic
      }
      
      if (!referrer) return false;
      
      const matchType = settings.referrerMatchType || 'contains';
      
      switch (matchType) {
        case 'exact':
          return referrer === referrerUrl;
        case 'contains':
          return referrer.includes(referrerUrl);
        case 'startsWith':
          return referrer.startsWith(referrerUrl);
        case 'endsWith':
          return referrer.endsWith(referrerUrl);
        default:
          return referrer.includes(referrerUrl);
      }
    },

    _checkVisitorTypeCondition(settings) {
      if (!settings?.visitorType) return false;
      
      const isReturning = this.isReturningVisitor;
      return settings.visitorType === (isReturning ? 'returning' : 'new');
    },

    _checkABSplitCondition(settings) {
      const percentage = Math.max(0, Math.min(100, parseInt(settings?.variantAPercent || 50, 10)));
      return Math.random() * 100 < percentage;
    },

    _checkTimeWindowCondition(settings) {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      
      // Check hour range
      const startHour = parseInt(settings?.startHour || 0, 10);
      const endHour = parseInt(settings?.endHour || 23, 10);
      
      let hourInRange = false;
      if (startHour <= endHour) {
        hourInRange = hour >= startHour && hour <= endHour;
      } else {
        // Spans midnight
        hourInRange = hour >= startHour || hour <= endHour;
      }
      
      // Check days of week
      const allowedDays = settings?.daysOfWeek;
      const dayInRange = !Array.isArray(allowedDays) || 
                        allowedDays.length === 0 || 
                        allowedDays.includes(dayOfWeek);
      
      return hourInRange && dayInRange;
    },

    _checkQueryParamCondition(settings) {
      const paramName = settings?.queryParam;
      if (!paramName) return false;
      
      const params = new URLSearchParams(window.location.search);
      const paramValue = params.get(paramName);
      const matchType = settings?.queryMatchType || 'exists';
      const targetValue = settings?.queryValue || '';
      
      switch (matchType) {
        case 'exists':
          return params.has(paramName);
        case 'exact':
          return paramValue === targetValue;
        case 'contains':
          return paramValue?.includes(targetValue) || false;
        case 'startsWith':
          return paramValue?.startsWith(targetValue) || false;
        case 'endsWith':
          return paramValue?.endsWith(targetValue) || false;
        default:
          return false;
      }
    },

    async _checkTagCondition(settings) {
      const tagName = settings?.tagName;
      if (!tagName) return false;

      try {
        // Check session cache first
        const cacheKey = `seentics_tag_${this.siteId}_${this.visitorId}_${tagName}`;
        const cached = Utils.sessionStorage.get(cacheKey);
        
        if (cached) {
          try {
            const { value, timestamp } = JSON.parse(cached);
            const now = Date.now();
            if (now - timestamp < CONSTANTS.DEFAULT_TAG_CACHE_TTL) {
              return value === 'true';
            }
          } catch (e) {
            // Invalid cache, continue to API call
          }
        }

        // Fetch from API
        const apiHost = this._getApiHost();
        const url = `${apiHost}/api/v1/visitor/${this.siteId}/${this.visitorId}/has-tag?tag=${encodeURIComponent(tagName)}`;
        
        const controller = new AbortController();
        this.resourceManager.addAbortController(controller);

        const response = await Utils.withTimeout(
          fetch(url, {
            credentials: 'include',
            signal: controller.signal
          })
        );

        if (!response.ok) {
          throw new Error(`Tag check failed: ${response.status}`);
        }

        const result = await response.json();
        const hasTag = !!result?.hasTag;

        // Cache the result
        try {
          Utils.sessionStorage.set(cacheKey, JSON.stringify({
            value: hasTag ? 'true' : 'false',
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn('[Seentics] Failed to cache tag result:', e);
        }

        return hasTag;
      } catch (error) {
        console.warn(`[Seentics] Tag condition evaluation failed for '${tagName}':`, error);
        return false;
      }
    },

    _checkFunnelCondition(settings, eventData) {
      if (!eventData?.funnel_id || !eventData?.event_type) return false;

      // Check funnel ID match
      if (settings.funnelId && settings.funnelId !== eventData.funnel_id) {
        return false;
      }

      // Check event type match
      if (settings.eventType && settings.eventType !== eventData.event_type) {
        return false;
      }

      // Check step index
      if (settings.stepIndex !== undefined && settings.stepIndex !== null) {
        if (eventData.step_index !== undefined && eventData.step_index !== settings.stepIndex) {
          return false;
        }
      }

      // Check time threshold
      if (settings.timeThreshold && settings.timeThreshold > 0) {
        if (eventData.time_spent && eventData.time_spent < settings.timeThreshold * 60) {
          return false;
        }
      }

      // Check user segment
      if (settings.userSegment && settings.userSegment.trim()) {
        const segments = settings.userSegment.split(',').map(s => s.trim());
        const userTags = this._getUserTags();
        
        const hasMatchingSegment = segments.some(segment =>
          userTags.includes(segment) ||
          (segment === 'new-visitors' && !this.isReturningVisitor) ||
          (segment === 'returning-visitors' && this.isReturningVisitor)
        );
        
        if (!hasMatchingSegment) return false;
      }

      // Check value range
      if (eventData.value !== undefined) {
        if (settings.minValue && eventData.value < settings.minValue) return false;
        if (settings.maxValue && eventData.value > settings.maxValue) return false;
      }

      return true;
    },

    _getUserTags() {
      return Utils.storage.getJSON(CONSTANTS.STORAGE_KEYS.USER_TAGS, []);
    },

    // Action execution
    async _executeAction(actionNode, workflow, runContext) {
      const actionData = actionNode.data;
      const settings = actionData?.settings || {};
      const actionType = actionData?.title;

      if (!actionType) {
        console.warn('[Seentics] Action node missing title');
        return;
      }

      if (actionData.isServerAction) {
        this._executeServerAction(actionNode, workflow.id);
        return;
      }

      this._log(`Executing action: ${actionType}`, settings);

      try {
        switch (actionType) {
          case CONSTANTS.ACTION_TYPES.SHOW_MODAL:
            this._showModal(settings);
            break;
          
          case CONSTANTS.ACTION_TYPES.SHOW_BANNER:
            this._showBanner(settings);
            break;
          
          case CONSTANTS.ACTION_TYPES.INSERT_SECTION:
            this._insertSection(settings);
            break;
          
          case CONSTANTS.ACTION_TYPES.REDIRECT_URL:
            this._redirectUrl(settings);
            break;
          
          case CONSTANTS.ACTION_TYPES.TRACK_EVENT:
            this._trackCustomEvent(settings);
            break;
          
          case CONSTANTS.ACTION_TYPES.WAIT:
            await this._waitAction(settings);
            break;
          
          default:
            console.warn(`[Seentics] Unknown action type: ${actionType}`);
        }
      } catch (error) {
        console.error(`[Seentics] Error executing action '${actionType}':`, error);
      }
    },

    _executeServerAction(actionNode, workflowId) {
      const payload = {
        workflowId,
        nodeId: actionNode.id,
        siteId: this.siteId,
        domain: window.location.hostname,
        visitorId: this.visitorId,
        identifiedUser: this.identifiedUser,
        localStorageData: this._getLocalStorageData(actionNode.data?.settings)
      };

      try {
        const apiHost = this._getApiHost();
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        
        const success = navigator.sendBeacon(`${apiHost}/api/v1/workflows/execution/action`, blob);
        
        if (!success) {
          // Fallback to fetch
          fetch(`${apiHost}/api/v1/workflows/execution/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
          }).catch(error => {
            console.warn('[Seentics] Server action fallback failed:', error);
          });
        }
      } catch (error) {
        console.error('[Seentics] Server action execution failed:', error);
      }
    },

    _getLocalStorageData(settings) {
      const localStorageData = {};
      
      if (settings?.localStorageData && Array.isArray(settings.localStorageData)) {
        settings.localStorageData.forEach(item => {
          if (item.localStorageKey && item.payloadKey) {
            const value = Utils.storage.get(item.localStorageKey);
            if (value !== null) {
              localStorageData[item.payloadKey] = value;
            }
          }
        });
      }
      
      return localStorageData;
    },

    // UI Actions
    _showModal(settings) {
      if (!settings.modalTitle && !settings.modalContent && !settings.customHtml) {
        console.warn('[Seentics] Modal has no content to display');
        return;
      }

      const modalId = Utils.generateId('seentics-modal');
      const overlay = this._createOverlay();

      if (settings.displayMode === 'custom' && settings.customHtml) {
        this._showCustomModal(overlay, settings, modalId);
      } else {
        this._showDefaultModal(overlay, settings, modalId);
      }

      document.body.appendChild(overlay);
      this._ensureStylesLoaded();
    },

    _createOverlay() {
      const overlay = Utils.dom.createElement('div', { className: 'seentics-overlay' });
      
      const cleanup = () => {
        try {
          document.body.removeChild(overlay);
        } catch (e) {
          console.warn('[Seentics] Error removing overlay:', e);
        }
      };

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          cleanup();
          window.removeEventListener('keydown', handleEscape);
        }
      };

      const handleClickOutside = (e) => {
        if (e.target === overlay) {
          cleanup();
        }
      };

      window.addEventListener('keydown', handleEscape);
      overlay.addEventListener('click', handleClickOutside);

      return overlay;
    },

    _showCustomModal(overlay, settings, modalId) {
      overlay.style.background = 'transparent';

      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      iframe.style.cssText = 'width:100vw;height:100vh;border:0;background:transparent;';

      const bodyHtml = Utils.extractBodyContent(settings.customHtml);
      const css = settings.customCss || '';
      const js = settings.customJs || '';
      
      const srcdoc = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>${css}</style>
        </head>
        <body>${bodyHtml}
          <script>(function(){try{${js}}catch(e){console.error(e)}})()</script>
        </body>
        </html>`;
      
      iframe.srcdoc = srcdoc;
      overlay.appendChild(iframe);

      // Floating close button
      const closeButton = Utils.dom.createElement('button', {
        className: 'seentics-close-button',
        innerHTML: '&times;'
      });
      closeButton.style.cssText = 'position:fixed;top:12px;right:12px;z-index:1000000;';
      closeButton.onclick = () => overlay.click();
      overlay.appendChild(closeButton);
    },

    _showDefaultModal(overlay, settings, modalId) {
      const modal = Utils.dom.createElement('div', {
        className: 'seentics-modal',
        'data-seentics-id': modalId
      });

      if (settings.modalTitle) {
        const title = Utils.dom.createElement('h2', {
          className: 'seentics-modal-title',
          textContent: settings.modalTitle
        });
        modal.appendChild(title);
      }

      if (settings.modalContent) {
        const content = Utils.dom.createElement('p', {
          className: 'seentics-modal-content',
          textContent: settings.modalContent
        });
        modal.appendChild(content);
      }

      const closeButton = Utils.dom.createElement('button', {
        className: 'seentics-close-button',
        innerHTML: '&times;'
      });
      closeButton.onclick = () => overlay.click();
      modal.appendChild(closeButton);

      overlay.appendChild(modal);
    },

    _showBanner(settings) {
      if (!settings.bannerContent && !settings.customHtml) {
        console.warn('[Seentics] Banner has no content to display');
        return;
      }

      const bannerId = Utils.generateId('seentics-banner');
      const banner = Utils.dom.createElement('div', {
        className: `seentics-banner seentics-banner-${settings.bannerPosition || 'top'}`,
        'data-seentics-id': bannerId
      });

      this._ensureStylesLoaded();

      if (settings.displayMode === 'custom' && settings.customHtml) {
        this._showCustomBanner(banner, settings);
      } else {
        this._showDefaultBanner(banner, settings);
      }

      document.body.appendChild(banner);
    },

    _showCustomBanner(banner, settings) {
      banner.style.cssText = 'background:transparent;box-shadow:none;padding:0;display:block;gap:0;';

      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      iframe.style.cssText = 'width:100%;border:0;display:block;height:1px;';

      const bodyHtml = Utils.extractBodyContent(settings.customHtml);
      const css = settings.customCss || '';
      const js = settings.customJs || '';
      
      const srcdoc = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>${css}</style>
        </head>
        <body>${bodyHtml}
          <script>(function(){try{${js}}catch(e){console.error(e)}})()</script>
        </body>
        </html>`;
      
      iframe.srcdoc = srcdoc;

      // Auto-resize iframe to content
      const resizeToContent = () => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            const height = Math.max(
              doc.body?.scrollHeight || 0,
              doc.documentElement?.scrollHeight || 0
            );
            if (height > 0) iframe.style.height = height + 'px';
          }
        } catch (e) {
          // Cross-origin restrictions
        }
      };

      iframe.onload = resizeToContent;
      banner.appendChild(iframe);

      // Floating close button
      const closeButton = Utils.dom.createElement('button', {
        className: 'seentics-close-button',
        innerHTML: '&times;'
      });
      const isBottom = settings.bannerPosition === 'bottom';
      closeButton.style.cssText = `position:absolute;right:12px;${isBottom ? 'bottom:12px;' : 'top:12px;'}`;
      closeButton.onclick = () => this._closeBanner(banner, settings);
      banner.appendChild(closeButton);
    },

    _showDefaultBanner(banner, settings) {
      if (settings.bannerContent) {
        const content = Utils.dom.createElement('p', {
          textContent: settings.bannerContent
        });
        banner.appendChild(content);
      }

      if (settings.bannerCtaText && settings.bannerCtaUrl) {
        const ctaButton = Utils.dom.createElement('a', {
          className: 'seentics-banner-cta',
          textContent: settings.bannerCtaText,
          href: settings.bannerCtaUrl
        });
        banner.appendChild(ctaButton);
      }

      const closeButton = Utils.dom.createElement('button', {
        className: 'seentics-close-button',
        innerHTML: '&times;'
      });
      closeButton.onclick = () => this._closeBanner(banner, settings);
      banner.appendChild(closeButton);
    },

    _closeBanner(banner, settings) {
      try {
        banner.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
        banner.style.opacity = '0';
        const isBottom = settings.bannerPosition === 'bottom';
        banner.style.transform = isBottom ? 'translateY(100%)' : 'translateY(-100%)';
        
        setTimeout(() => {
          try {
            document.body.removeChild(banner);
          } catch (e) {
            console.warn('[Seentics] Error removing banner:', e);
          }
        }, 250);
      } catch (e) {
        console.warn('[Seentics] Error closing banner:', e);
      }
    },

    _insertSection(settings) {
      if (!settings.selector) {
        console.warn('[Seentics] Insert section missing selector');
        return;
      }

      const targetElement = Utils.dom.safeQuery(settings.selector);
      if (!targetElement) {
        console.warn(`[Seentics] Target element '${settings.selector}' not found`);
        return;
      }

      const sectionId = Utils.generateId('seentics-section');
      const wrapper = Utils.dom.createElement('div', {
        'data-seentics-id': sectionId
      });
      
      if (settings.customHtml) {
        wrapper.innerHTML = Utils.extractBodyContent(settings.customHtml);
      }

      if (settings.customCss) {
        this._injectScopedStyles(settings.customCss, sectionId);
      }

      // Insert based on position
      switch (settings.insertPosition) {
        case 'before':
          targetElement.parentNode.insertBefore(wrapper, targetElement);
          break;
        case 'after':
          targetElement.parentNode.insertBefore(wrapper, targetElement.nextSibling);
          break;
        case 'prepend':
          targetElement.prepend(wrapper);
          break;
        case 'append':
        default:
          targetElement.appendChild(wrapper);
          break;
      }

      if (settings.customJs) {
        this._executeCustomJs(settings.customJs, wrapper);
      }
    },

    _redirectUrl(settings) {
      if (!settings.redirectUrl) {
        console.warn('[Seentics] Redirect URL not specified');
        return;
      }

      try {
        this._log(`Redirecting to: ${settings.redirectUrl}`);
        window.location.href = settings.redirectUrl;
      } catch (error) {
        console.error('[Seentics] Redirect failed:', error);
      }
    },

    _trackCustomEvent(settings) {
      if (!settings.eventName) {
        console.warn('[Seentics] Track event missing event name');
        return;
      }

      try {
        if (window.seentics?.track) {
          window.seentics.track(settings.eventName);
        } else {
          console.warn('[Seentics] Main tracker not available for custom event');
        }
      } catch (error) {
        console.error('[Seentics] Failed to track custom event:', error);
      }
    },

    async _waitAction(settings) {
      const waitSeconds = Math.max(0, settings.waitSeconds || 0);
      if (waitSeconds > 0) {
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
      }
    },

    // Utility methods for UI actions
    _ensureStylesLoaded() {
      if (document.getElementById('seentics-tracker-styles')) return;

      const link = document.createElement('link');
      link.id = 'seentics-tracker-styles';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = window.SEENTICS_CONFIG?.trackerStylesUrl || '/tracker-styles.css';

      link.onload = () => console.log('[Seentics] Tracker styles loaded');
      link.onerror = (error) => console.error('[Seentics] Failed to load tracker styles:', error);

      document.head.appendChild(link);
    },

    _injectScopedStyles(css, scopeId) {
      const styleId = `seentics-style-${scopeId}`;
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;

      // Basic CSS scoping
      let scopedCss = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*\{)/g, `[data-seentics-id="${scopeId}"] $1$2`);
      const bodySelector = new RegExp(`\\[data-seentics-id="${scopeId}"\\]\\s*body`, 'g');
      scopedCss = scopedCss.replace(bodySelector, `[data-seentics-id="${scopeId}"]`);

      style.innerHTML = scopedCss;
      document.head.appendChild(style);
    },

    _executeCustomJs(js, element) {
      try {
        const scopedDocument = new Proxy(document, {
          get(target, prop) {
            switch (prop) {
              case 'getElementById':
                return (id) => element.querySelector(`#${CSS.escape ? CSS.escape(id) : id}`);
              case 'querySelector':
                return (sel) => element.querySelector(sel);
              case 'querySelectorAll':
                return (sel) => element.querySelectorAll(sel);
              default:
                return target[prop];
            }
          }
        });

        new Function('document', 'element', js)(scopedDocument, element);
      } catch (error) {
        console.error('[Seentics] Error executing custom JavaScript:', error);
      }
    },

    // Analytics and tracking
    _trackWorkflowEvent(workflow, node, eventType, options = {}) {
      if (!this.analyticsManager) {
        console.warn('[Seentics] Analytics manager not initialized');
        return;
      }

      try {
        const payload = {
          siteId: this.siteId,
          workflowId: workflow.id || workflow._id || 'unknown',
          visitorId: this.visitorId,
          type: eventType,
          nodeId: node?.id,
          nodeTitle: node?.data?.title,
          nodeType: node?.data?.type,
          branchSourceNodeId: options.sourceNodeId,
          stepOrder: options.stepOrder,
          timestamp: new Date().toISOString()
        };

        this.analyticsManager.addEvent(payload);
      } catch (error) {
        console.error('[Seentics] Error tracking workflow event:', error);
      }
    },

    _getStepOrder(node, workflow) {
      if (!node || !workflow?.nodes || !workflow?.edges) return 0;

      try {
        const visited = new Set();
        const queue = [];

        // Start with trigger nodes
        const triggerNodes = workflow.nodes.filter(n => n.data?.type === 'Trigger');
        triggerNodes.forEach(trigger => queue.push({ node: trigger, order: 1 }));

        while (queue.length > 0) {
          const { node: currentNode, order } = queue.shift();
          if (visited.has(currentNode.id)) continue;

          visited.add(currentNode.id);

          if (currentNode.id === node.id) {
            return order;
          }

          // Add next nodes to queue
          const nextEdges = workflow.edges.filter(e => e.source === currentNode.id);
          nextEdges.forEach(edge => {
            const nextNode = workflow.nodes.find(n => n.id === edge.target);
            if (nextNode && !visited.has(nextNode.id)) {
              queue.push({ node: nextNode, order: order + 1 });
            }
          });
        }

        return 0;
      } catch (error) {
        console.warn('[Seentics] Error calculating step order:', error);
        return 0;
      }
    },

    // Logging
    _log(message, details) {
      // Preview mode logging
      if (this.siteId === 'preview' && window.logToPreviewer) {
        const logMessage = details ? `${message} | ${JSON.stringify(details)}` : message;
        window.logToPreviewer(logMessage);
      }

      // Console logging (can be disabled in production)
      if (window.SEENTICS_CONFIG?.debugMode !== false) {
        console.log(`[Seentics Workflow]: ${message}`, details || '');
      }
    },

    // Cleanup and destruction
    destroy() {
      if (!this.isInitialized) {
        console.warn('[Seentics] Attempted to destroy uninitialized tracker');
        return;
      }

      try {
        // Flush any remaining analytics
        if (this.analyticsManager) {
          this.analyticsManager.destroy();
        }

        // Clean up resources
        if (this.resourceManager) {
          this.resourceManager.destroy();
        }

        // Clear join states
        this.joinStates.clear();

        // Reset state
        this.isInitialized = false;
        this.activeWorkflows = [];
        this.analyticsManager = null;
        this.resourceManager = null;

        this._log('Workflow tracker destroyed and cleaned up');
      } catch (error) {
        console.error('[Seentics] Error during cleanup:', error);
      }
    }
  };

  // Global exposure and initialization
  window.seentics = window.seentics || {};
  window.seentics.workflowTracker = workflowTracker;

  // Global configuration with sensible defaults
  window.SEENTICS_CONFIG = window.SEENTICS_CONFIG || {
    apiHost: window.SEENTICS_CONFIG?.apiHost || 
      (window.location.hostname === 'localhost' ? 
        (window.SEENTICS_CONFIG?.devApiHost || 'http://localhost:8080') : 
        `https://${window.location.hostname}`),
    batchSize: 10,
    batchDelay: 1000,
    requestTimeout: 10000,
    tagCacheTTL: 5 * 60 * 1000,
    debugMode: window.location.hostname === 'localhost' || 
               new URLSearchParams(window.location.search).has('seentics_debug')
  };

  // Global utility functions
  window.triggerFunnelEvent = (funnelId, eventType, stepIndex = 0, additionalData = {}) => {
    if (!funnelId || !eventType) {
      console.warn('[Seentics] Invalid funnel event parameters');
      return null;
    }

    const funnelEvent = {
      funnel_id: funnelId,
      event_type: eventType,
      step_index: stepIndex,
      timestamp: new Date().toISOString(),
      website_id: workflowTracker.siteId || 'unknown',
      ...additionalData
    };

    console.log('[Seentics] Triggering funnel event:', funnelEvent);

    document.dispatchEvent(new CustomEvent('seentics:funnel-event', {
      detail: funnelEvent
    }));

    return funnelEvent;
  };

  window.destroySeenticsWorkflowTracker = () => {
    if (window.seentics?.workflowTracker) {
      window.seentics.workflowTracker.destroy();
    }
  };

  // Auto-initialize if siteId is provided
  if (window.SEENTICS_SITE_ID) {
    try {
      workflowTracker.init(window.SEENTICS_SITE_ID);
    } catch (error) {
      console.error('[Seentics] Auto-initialization failed:', error);
    }
  }

})();