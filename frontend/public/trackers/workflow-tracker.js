(function() {
  'use strict';

  // --- MVP Constants ---
  const TRIGGERS = {
    PAGE_VIEW: 'Page View',
    ELEMENT_CLICK: 'Element Click', 
    FUNNEL: 'Funnel',
    TIME_SPENT: 'Time Spent',
    EXIT_INTENT: 'Exit Intent'
  };

  const ACTIONS = {
    SHOW_MODAL: 'Show Modal',
    SHOW_BANNER: 'Show Banner', 
    SHOW_NOTIFICATION: 'Show Notification',
    TRACK_EVENT: 'Track Event',
    WEBHOOK: 'Webhook',
    REDIRECT_URL: 'Redirect URL'
  };

  const CONDITIONS = {
    URL_PATH: 'URL Path',
    TRAFFIC_SOURCE: 'Traffic Source',
    NEW_VS_RETURNING: 'New vs Returning',
    DEVICE: 'Device Type'
  };

  const FREQUENCY_TYPES = {
    EVERY_TRIGGER: 'every_trigger',
    ONCE_PER_SESSION: 'once_per_session', 
    ONCE_EVER: 'once_ever'
  };

  // --- Simple Utilities ---
  const storage = {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value)
  };

  const sessionStorage = {
    get: (key) => window.sessionStorage.getItem(key),
    set: (key, value) => window.sessionStorage.setItem(key, value)
  };

  const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/iPad|Android(?=.*Mobile)|PlayBook|Silk/i.test(userAgent)) return 'Tablet';
    if (/Mobi|Android/i.test(userAgent)) return 'Mobile';
    return 'Desktop';
  };
  const throttle = (fn, delay) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn(...args);
      }
    };
  };

  // --- Analytics Manager ---
  class AnalyticsManager {
    constructor(apiHost, siteId) {
      this.apiHost = apiHost;
      this.siteId = siteId;
      this.batch = [];
      this.batchTimer = null;
    }

    addEvent(payload) {
      this.batch.push(payload);
      this._scheduleBatch();
    }

    _scheduleBatch() {
      if (this.batchTimer) return;
      this.batchTimer = setTimeout(() => this._sendBatch(), 2000);
    }

    async _sendBatch() {
      if (this.batch.length === 0) return;
      
      const events = [...this.batch];
      this.batch = [];
      this.batchTimer = null;

      try {
        await fetch(`${this.apiHost}/api/v1/workflows/analytics/track/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId: this.siteId, events }),
          keepalive: true
        });
      } catch (error) {
        console.warn('[Seentics] Analytics batch failed:', error);
      }
    }

    destroy() {
      this._sendBatch();
    }
  }

  // --- Main Workflow Tracker ---
  const workflowTracker = {
    siteId: null,
    visitorId: null,
    isReturningVisitor: false,
    activeWorkflows: [],
    analytics: null,
    timers: new Set(),
    listeners: new Map(),

    init(siteId) {
      if (!siteId) return console.error('[Seentics] Invalid siteId');
      
      this.siteId = siteId;
      this.visitorId = this._getVisitorId();
      this.isReturningVisitor = this._checkReturning();
      this.analytics = new AnalyticsManager(this._getApiHost(), siteId);
      
      if (siteId === 'preview' && window.__SEENTICS_PREVIEW_WORKFLOW) {
        this.activeWorkflows = [window.__SEENTICS_PREVIEW_WORKFLOW];
        this._setupTriggers();
      } else {
        this._fetchWorkflows();
      }
    },

    _getVisitorId() {
      let id = storage.get('seentics_visitor_id');
      if (!id) {
        id = generateId();
        storage.set('seentics_visitor_id', id);
      }
      return id;
    },

    _checkReturning() {
      const returning = storage.get('seentics_returning');
      if (returning) return true;
      storage.set('seentics_returning', 'true');
      return false;
    },

    _getApiHost() {
      const config = window.SEENTICS_CONFIG;
      if (config?.apiHost) return config.apiHost;
      return window.location.hostname === 'localhost' ? 'http://localhost:8080' : `https://${window.location.hostname}`;
    },

    async _fetchWorkflows() {
      try {
        const response = await fetch(`${this._getApiHost()}/api/v1/workflows/site/${this.siteId}/active`);
        const data = await response.json();
        this.activeWorkflows = data?.workflows?.filter(w => w.status === 'Active') || [];
        this._setupTriggers();
      } catch (error) {
        console.error('[Seentics] Failed to fetch workflows:', error);
      }
    },

    _setupTriggers() {
      // Page view trigger - initial page load
      this._checkTrigger(TRIGGERS.PAGE_VIEW);
      
      // Setup page navigation detection for SPA routing
      this._setupPageNavigation();
      
      // Time spent triggers
      this.activeWorkflows.forEach(workflow => {
        const timeNodes = this._getNodes(workflow, TRIGGERS.TIME_SPENT);
        timeNodes.forEach(node => {
          const seconds = node.data?.settings?.seconds || 0;
          if (seconds > 0) {
            const timer = setTimeout(() => this._executeWorkflow(workflow, node), seconds * 1000);
            this.timers.add(timer);
          }
        });
      });
      
      // Exit intent trigger
      const exitHandler = throttle((e) => {
        if (e.clientY <= 5) this._checkTrigger(TRIGGERS.EXIT_INTENT);
      }, 100);
      document.addEventListener('mousemove', exitHandler);
      this.listeners.set('exit', () => document.removeEventListener('mousemove', exitHandler));
      
      // Click triggers
      const clickHandler = throttle((e) => {
        this.activeWorkflows.forEach(workflow => {
          const clickNodes = this._getNodes(workflow, TRIGGERS.ELEMENT_CLICK);
          clickNodes.forEach(node => {
            const selector = node.data?.settings?.selector;
            if (selector && e.target.matches?.(selector)) {
              this._executeWorkflow(workflow, node);
            }
          });
        });
      }, 100);
      document.addEventListener('click', clickHandler);
      this.listeners.set('click', () => document.removeEventListener('click', clickHandler));
      
      // Funnel events
      document.addEventListener('seentics:funnel-event', (e) => {
        this._checkTrigger(TRIGGERS.FUNNEL, e.detail);
      });
    },

    _setupPageNavigation() {
      let currentUrl = window.location.pathname;
      
      const onRouteChange = () => {
        const newUrl = window.location.pathname;
        if (newUrl !== currentUrl) {
          currentUrl = newUrl;
          // Trigger page view workflows on navigation
          this._checkTrigger(TRIGGERS.PAGE_VIEW);
        }
      };

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

      window.addEventListener('popstate', onRouteChange);
    },

    _getNodes(workflow, type) {
      return workflow.nodes?.filter(n => n.data?.type === 'Trigger' && n.data?.title === type) || [];
    },

    _checkTrigger(triggerType, eventData = {}) {
      this.activeWorkflows.forEach(workflow => {
        const nodes = this._getNodes(workflow, triggerType);
        nodes.forEach(node => {
          if (this._shouldTrigger(node, triggerType, eventData)) {
            this._executeWorkflow(workflow, node);
          }
        });
      });
    },

    _shouldTrigger(node, triggerType, eventData) {
      const settings = node.data?.settings || {};
      
      if (triggerType === TRIGGERS.FUNNEL) {
        return settings.funnelId === eventData.funnel_id && settings.eventType === eventData.event_type;
      }
      
      return true;
    },

    async _executeWorkflow(workflow, currentNode) {
      const runId = generateId();
      this._trackEvent(workflow, currentNode, 'workflow_trigger', { 
        runId,
        triggerType: currentNode.data?.title,
        nodeType: 'trigger'
      });
      
      let node = currentNode;
      while (node) {
        if (node.data?.type === 'Condition') {
          const conditionResult = this._evaluateCondition(node);
          this._trackEvent(workflow, node, 'condition_evaluated', {
            runId,
            conditionType: node.data?.title,
            nodeType: 'condition',
            result: conditionResult ? 'passed' : 'failed'
          });
          
          if (!conditionResult) {
            this._trackEvent(workflow, node, 'workflow_stopped', {
              runId,
              reason: 'condition_failed',
              nodeType: 'condition'
            });
            break;
          }
        } else if (node.data?.type === 'Action') {
          const frequencyAllowed = this._checkActionFrequency(node, workflow);
          
          if (frequencyAllowed) {
            this._trackEvent(workflow, node, 'action_started', {
              runId,
              actionType: node.data?.title,
              nodeType: 'action',
              frequency: node.data?.settings?.frequency || 'every_trigger'
            });
            
            try {
              await this._executeAction(node, workflow);
              this._recordActionExecution(node, workflow);
              
              this._trackEvent(workflow, node, 'action_completed', {
                runId,
                actionType: node.data?.title,
                nodeType: 'action',
                status: 'success'
              });
            } catch (error) {
              this._trackEvent(workflow, node, 'action_failed', {
                runId,
                actionType: node.data?.title,
                nodeType: 'action',
                status: 'error',
                error: error.message
              });
            }
          } else {
            this._trackEvent(workflow, node, 'action_skipped', {
              runId,
              actionType: node.data?.title,
              nodeType: 'action',
              reason: 'frequency_limit',
              frequency: node.data?.settings?.frequency
            });
          }
        }
        
        node = this._getNextNode(workflow, node);
      }
      
      this._trackEvent(workflow, null, 'workflow_completed', {
        runId,
        totalNodes: workflow.nodes?.length || 0
      });
    },

    _checkActionFrequency(actionNode, workflow) {
      const frequency = actionNode.data?.settings?.frequency || FREQUENCY_TYPES.EVERY_TRIGGER;
      
      if (frequency === FREQUENCY_TYPES.EVERY_TRIGGER) {
        return true;
      }
      
      const actionKey = `${workflow.id}_${actionNode.id}`;
      
      if (frequency === FREQUENCY_TYPES.ONCE_PER_SESSION) {
        const sessionKey = `seentics_session_action_${actionKey}`;
        return !sessionStorage.get(sessionKey);
      }
      
      if (frequency === FREQUENCY_TYPES.ONCE_EVER) {
        const permanentKey = `seentics_permanent_action_${actionKey}`;
        return !storage.get(permanentKey);
      }
      
      return true;
    },

    _recordActionExecution(actionNode, workflow) {
      const frequency = actionNode.data?.settings?.frequency || FREQUENCY_TYPES.EVERY_TRIGGER;
      
      if (frequency === FREQUENCY_TYPES.EVERY_TRIGGER) {
        return;
      }
      
      const actionKey = `${workflow.id}_${actionNode.id}`;
      
      if (frequency === FREQUENCY_TYPES.ONCE_PER_SESSION) {
        const sessionKey = `seentics_session_action_${actionKey}`;
        sessionStorage.set(sessionKey, 'executed');
      }
      
      if (frequency === FREQUENCY_TYPES.ONCE_EVER) {
        const permanentKey = `seentics_permanent_action_${actionKey}`;
        storage.set(permanentKey, 'executed');
      }
    },

    _evaluateCondition(node) {
      const type = node.data?.title;
      const settings = node.data?.settings || {};
      
      switch (type) {
        case CONDITIONS.URL_PATH:
          return window.location.pathname.includes(settings.url || '');
        case CONDITIONS.TRAFFIC_SOURCE:
          return document.referrer.includes(settings.referrerUrl || '');
        case CONDITIONS.NEW_VS_RETURNING:
          return settings.visitorType === (this.isReturningVisitor ? 'returning' : 'new');
        case CONDITIONS.DEVICE:
          return this._evaluateDeviceCondition(settings);
        default:
          return true;
      }
    },

    _evaluateDeviceCondition(settings) {
      const currentDevice = getDeviceType();
      
      // Check basic device type match
      if (settings.deviceType && settings.deviceType !== 'Any' && settings.deviceType !== currentDevice) {
        return false;
      }
      
      // Check screen size constraints if specified
      if (settings.minScreenWidth && window.screen.width < settings.minScreenWidth) {
        return false;
      }
      if (settings.maxScreenWidth && window.screen.width > settings.maxScreenWidth) {
        return false;
      }
      
      // Check touch support if specified
      if (settings.touchSupport) {
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (settings.touchSupport === 'touch' && !hasTouchSupport) {
          return false;
        }
        if (settings.touchSupport === 'no-touch' && hasTouchSupport) {
          return false;
        }
      }
      
      return true;
    },

    async _executeAction(node, workflow) {
      const type = node.data?.title;
      const settings = node.data?.settings || {};
      
      if (node.data?.isServerAction) {
        this._executeServerAction(node, workflow.id);
        return;
      }
      
      switch (type) {
        case ACTIONS.SHOW_MODAL:
          this._showModal(settings);
          break;
        case ACTIONS.SHOW_BANNER:
          this._showBanner(settings);
          break;
        case ACTIONS.SHOW_NOTIFICATION:
          this._showNotification(settings);
          break;
        case ACTIONS.REDIRECT_URL:
          if (settings.redirectUrl) window.location.href = settings.redirectUrl;
          break;
        case ACTIONS.TRACK_EVENT:
          if (settings.eventName && window.seentics?.track) {
            window.seentics.track(settings.eventName);
          }
          break;
      }
    },

    _executeServerAction(node, workflowId) {
      const payload = {
        workflowId,
        nodeId: node.id,
        siteId: this.siteId,
        visitorId: this.visitorId
      };
      
      fetch(`${this._getApiHost()}/api/v1/workflows/execution/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(error => console.warn('[Seentics] Server action failed:', error));
    },

    _getNextNode(workflow, currentNode) {
      const edge = workflow.edges?.find(e => e.source === currentNode.id);
      return edge ? workflow.nodes?.find(n => n.id === edge.target) : null;
    },

    _showModal(settings) {
      if (!settings.modalTitle && !settings.modalContent) return;
      
      const overlay = document.createElement('div');
      overlay.className = 'seentics-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;';
      
      const modal = document.createElement('div');
      modal.className = 'seentics-modal';
      modal.style.cssText = 'background:white;padding:20px;border-radius:8px;max-width:500px;position:relative;';
      
      if (settings.modalTitle) {
        const title = document.createElement('h2');
        title.textContent = settings.modalTitle;
        title.style.cssText = 'margin:0 0 10px 0;';
        modal.appendChild(title);
      }
      
      if (settings.modalContent) {
        const content = document.createElement('p');
        content.textContent = settings.modalContent;
        modal.appendChild(content);
      }
      
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.style.cssText = 'position:absolute;top:10px;right:15px;border:none;background:none;font-size:20px;cursor:pointer;';
      closeBtn.onclick = () => document.body.removeChild(overlay);
      modal.appendChild(closeBtn);
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      overlay.onclick = (e) => {
        if (e.target === overlay) document.body.removeChild(overlay);
      };
    },

    _showBanner(settings) {
      if (!settings.bannerContent) return;
      
      const banner = document.createElement('div');
      banner.className = 'seentics-banner';
      const position = settings.bannerPosition === 'bottom' ? 'bottom:0;' : 'top:0;';
      banner.style.cssText = `position:fixed;left:0;width:100%;${position}background:#333;color:white;padding:10px;z-index:999998;display:flex;align-items:center;justify-content:space-between;`;
      
      const content = document.createElement('span');
      content.textContent = settings.bannerContent;
      banner.appendChild(content);
      
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.style.cssText = 'border:none;background:none;color:white;font-size:18px;cursor:pointer;';
      closeBtn.onclick = () => document.body.removeChild(banner);
      banner.appendChild(closeBtn);
      
      document.body.appendChild(banner);
    },

    _showNotification(settings) {
      if (!settings.message) return;
      
      const notification = document.createElement('div');
      notification.className = 'seentics-notification';
      
      // Position settings
      const position = settings.position || 'top-right';
      let positionStyle = '';
      
      switch (position) {
        case 'top-left':
          positionStyle = 'top:20px;left:20px;';
          break;
        case 'top-right':
          positionStyle = 'top:20px;right:20px;';
          break;
        case 'top-center':
          positionStyle = 'top:20px;left:50%;transform:translateX(-50%);';
          break;
        case 'bottom-left':
          positionStyle = 'bottom:20px;left:20px;';
          break;
        case 'bottom-right':
          positionStyle = 'bottom:20px;right:20px;';
          break;
        case 'bottom-center':
          positionStyle = 'bottom:20px;left:50%;transform:translateX(-50%);';
          break;
        default:
          positionStyle = 'top:20px;right:20px;';
      }
      
      // Notification type styling
      const type = settings.type || 'info';
      let typeStyle = '';
      
      switch (type) {
        case 'success':
          typeStyle = 'background:#10b981;color:white;';
          break;
        case 'error':
          typeStyle = 'background:#ef4444;color:white;';
          break;
        case 'warning':
          typeStyle = 'background:#f59e0b;color:white;';
          break;
        case 'info':
        default:
          typeStyle = 'background:#3b82f6;color:white;';
      }
      
      notification.style.cssText = `
        position:fixed;
        ${positionStyle}
        ${typeStyle}
        padding:12px 16px;
        border-radius:8px;
        box-shadow:0 4px 12px rgba(0,0,0,0.15);
        z-index:999999;
        max-width:350px;
        min-width:250px;
        font-family:system-ui,-apple-system,sans-serif;
        font-size:14px;
        line-height:1.4;
        display:flex;
        align-items:center;
        justify-content:space-between;
        animation:seenticsSlideIn 0.3s ease-out;
      `;
      
      // Add animation keyframes if not already present
      if (!document.querySelector('#seentics-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'seentics-notification-styles';
        style.textContent = `
          @keyframes seenticsSlideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) ${position.includes('center') ? 'translateX(-50%)' : ''};
            }
            to {
              opacity: 1;
              transform: translateY(0) ${position.includes('center') ? 'translateX(-50%)' : ''};
            }
          }
          @keyframes seenticsSlideOut {
            from {
              opacity: 1;
              transform: translateY(0) ${position.includes('center') ? 'translateX(-50%)' : ''};
            }
            to {
              opacity: 0;
              transform: translateY(-10px) ${position.includes('center') ? 'translateX(-50%)' : ''};
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Message content
      const content = document.createElement('span');
      content.textContent = settings.message;
      content.style.cssText = 'flex:1;margin-right:8px;';
      notification.appendChild(content);
      
      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.style.cssText = 'border:none;background:none;color:inherit;font-size:18px;cursor:pointer;padding:0;margin-left:8px;opacity:0.8;';
      closeBtn.onclick = () => this._removeNotification(notification);
      notification.appendChild(closeBtn);
      
      document.body.appendChild(notification);
      
      // Auto-dismiss after duration (default 5 seconds)
      const duration = settings.duration || 5000;
      if (duration > 0) {
        setTimeout(() => this._removeNotification(notification), duration);
      }
    },

    _removeNotification(notification) {
      if (!notification || !notification.parentNode) return;
      
      notification.style.animation = 'seenticsSlideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    },

    _trackEvent(workflow, node, eventType, options = {}) {
      const payload = {
        website_id: this.siteId,
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        event_type: 'workflow_analytics',
        workflow_id: workflow.id,
        workflow_name: workflow.name || 'Unnamed Workflow',
        node_id: node?.id || null,
        node_title: node?.data?.title || null,
        analytics_event_type: eventType,
        timestamp: new Date().toISOString(),
        ...options
      };
      
      // Send workflow analytics only to workflow service
      this.analytics.addEvent(payload);
    },

    destroy() {
      this.timers.forEach(timer => clearTimeout(timer));
      this.timers.clear();
      
      this.listeners.forEach(cleanup => cleanup());
      this.listeners.clear();
      
      if (this.analytics) this.analytics.destroy();
    }
  };

  // Global exposure
  window.seentics = window.seentics || {};
  window.seentics.workflowTracker = workflowTracker;

  // Auto-initialize
  if (window.SEENTICS_SITE_ID) {
    workflowTracker.init(window.SEENTICS_SITE_ID);
  }

  // Global funnel trigger
  window.triggerFunnelEvent = (funnelId, eventType, stepIndex = 0, data = {}) => {
    document.dispatchEvent(new CustomEvent('seentics:funnel-event', {
      detail: { funnel_id: funnelId, event_type: eventType, step_index: stepIndex, ...data }
    }));
  };

})();