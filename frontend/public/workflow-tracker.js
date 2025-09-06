
(function () {
  // --- Seentics Workflow Tracker Module ---
  const workflowTracker = {
    _generateRunId() {
      return `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    },

    _getApiHost() {
      return window.SEENTICS_CONFIG?.apiHost || 
    (window.location.hostname === 'localhost' ? 
      (window.SEENTICS_CONFIG?.devApiHost || 'http://localhost:8080') : 
      `https://${window.location.hostname}`);
    },

    _addToAnalyticsBatch(payload) {
      // Check for duplicate events to prevent duplicates in batch
      const isDuplicate = this._analyticsBatch.some(event => 
        event.type === payload.type && 
        event.runId === payload.runId && 
        event.nodeId === payload.nodeId
      );
      
      if (isDuplicate) {
        console.log(`[Seentics] Skipping duplicate event:`, payload.type, `for node:`, payload.nodeId);
        return;
      }
      
      console.log(`[Seentics] Adding to batch:`, payload.type, `(batch size: ${this._analyticsBatch.length + 1})`);
      this._analyticsBatch.push(payload);
      
      // Start batch timer if not already running
      if (!this._analyticsBatchTimer) {
        console.log(`[Seentics] Starting batch timer (5 seconds)`);
        this._analyticsBatchTimer = setTimeout(() => {
          console.log(`[Seentics] Batch timer expired, flushing ${this._analyticsBatch.length} events`);
          this._flushAnalyticsBatch();
        }, 5000); // Increased to 5 seconds for better batching
      }
    },

    // New method to flush batch immediately when workflow completes
    _flushWorkflowBatch() {
      if (this._analyticsBatch.length > 0) {
        console.log(`[Seentics] Flushing workflow batch immediately: ${this._analyticsBatch.length} events`);
        // Clear the timer since we're flushing immediately
        if (this._analyticsBatchTimer) {
          clearTimeout(this._analyticsBatchTimer);
          this._analyticsBatchTimer = null;
        }
        this._flushAnalyticsBatch();
      } else {
        console.log(`[Seentics] No events in batch to flush`);
      }
    },

    async _flushAnalyticsBatch() {
      if (this._analyticsBatch.length === 0) {
        this._analyticsBatchTimer = null;
        return;
      }

      const batch = [...this._analyticsBatch];
      console.log(`[Seentics] Flushing analytics batch: ${batch.length} events to /track/batch`);
      this._analyticsBatch = [];
      this._analyticsBatchTimer = null;

      // Add request timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const apiHost = this._getApiHost();
        const response = await fetch(`${apiHost}/api/v1/workflows/analytics/track/batch`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            siteId: this.siteId,
            events: batch 
          }),
          keepalive: true,
        });
        
        if (!response.ok) {
          throw new Error(`Analytics batch failed: ${response.status}`);
        }
        
        clearTimeout(timeoutId);
        console.log(`[Seentics] Batch sent successfully: ${batch.length} events`);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`[Seentics] Error flushing analytics batch:`, error);
        // Fallback to individual requests if batch fails
        console.log(`[Seentics] Falling back to individual requests for ${batch.length} events`);
        batch.forEach(event => this._sendIndividualEvent(event));
      }
    },

    async _sendIndividualEvent(payload) {
      try {
        const apiHost = this._getApiHost();
        await fetch(`${apiHost}/api/v1/workflows/analytics/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      } catch (error) {
        this._log('Error sending individual event:', error);
      }
    },
    _extractBodyHtml(html) {
      try {
        const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
        if (bodyMatch && bodyMatch[1]) return bodyMatch[1];
        return html.replace(/<!DOCTYPE[\s\S]*?>/gi, '')
                   .replace(/<\/?html[^>]*>/gi, '')
                   .replace(/<head[\s\S]*?<\/head>/gi, '');
      } catch { return html; }
    },
    _trackWorkflowEvent(workflow, node, type, opts = {}) {
      try {
        const apiHost = this._getApiHost();
        const payload = {
          siteId: this.siteId,
          workflowId: workflow.id || workflow._id || 'unknown',
          visitorId: this.visitorId,
          type,
          nodeId: node?.id,
          nodeTitle: node?.data?.title,
          nodeType: node?.data?.type,
          branchSourceNodeId: opts.sourceNodeId,
          detail: opts.detail,
          runId: opts.runId,
          stepOrder: opts.stepOrder,
          executionTime: opts.executionTime,
          success: opts.success,
          timestamp: new Date().toISOString()
        };
        
        // Add to batch queue instead of immediate fetch
        this._addToAnalyticsBatch(payload);
      } catch (e) {
        this._log('Error tracking workflow event:', e);
      }
    },

    // Helper to get step order in workflow
    _getStepOrder(node, workflow) {
      if (!node || !workflow.nodes) return 0;
      
      // Find the node's position in the workflow execution order
      const visited = new Set();
      const queue = [];
      
      // Start with trigger nodes
      const triggerNodes = workflow.nodes.filter(n => n.data.type === 'Trigger');
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
    },
    _joinState: {},
    _analyticsBatch: [],
    _analyticsBatchTimer: null,
    _eventListeners: new Map(),
    _activeTimers: new Set(),
    siteId: null,
    activeWorkflows: [],
    visitorId: null,
    isReturningVisitor: false,
    sessionTag: `seentics_session_count`,
    returningVisitorKey: 'seentics_returning_visitor',
    identifiedUser: null,
    
    // --- Initialization ---
    init(siteId) {
      try {
        // Prevent multiple initializations
        if (this.siteId) {
          console.log(`[Seentics] Workflow tracker already initialized for site: ${this.siteId}`);
          return;
        }
        
        this.siteId = siteId;
        this.visitorId = this._getVisitorId();
        this.isReturningVisitor = this._checkIfReturning();
        
        // Set up page unload cleanup
        window.addEventListener('beforeunload', () => {
          this.destroy();
        });
        
        if (this.siteId === 'preview') {
            if (window.SEENTICS_CONFIG?.debugMode) {
                console.log('Seentics Preview Mode: Loading single workflow.');
            }
            if (window.__SEENTICS_PREVIEW_WORKFLOW) {
                this.activeWorkflows = [window.__SEENTICS_PREVIEW_WORKFLOW];
                this._setupTriggers();
            }
        } else {
            this._fetchWorkflows();
        }
        this._log('Initialized');
      } catch (error) {
        this._log('Error during initialization:', error);
      }
    },

    // --- User Identification ---
    identify(userId, attributes) {
        this.identifiedUser = { id: userId, attributes: attributes || {} };
        this._log(`User identified: ${userId}`, attributes);
    },

    // --- Core Event Processing ---
    processEvent(event) {
      // This is called by the main tracker.js for 'pageview' and 'custom' events
      if (event.type === 'pageview') {
        this._checkWorkflows('Page View');
        // Removed Time Spent check - it's handled by _setupTimeSpentTriggers during initialization
      } else if (event.type === 'custom' && event.eventName) {
         this._checkWorkflows('Custom Event', { eventName: event.eventName });
      }
    },
    
    // --- Trigger Setup ---
    _setupTriggers() {
        this._log(`Setting up triggers for ${this.activeWorkflows.length} workflows`);
        this._checkWorkflows('Page View');
        // Set up Time Spent triggers (but don't trigger them immediately)
        this._setupTimeSpentTriggers();
        // Set up Scroll Depth triggers (but don't trigger them immediately)
        this._setupScrollTriggers();
        this._checkWorkflows('Exit Intent');
        this._checkWorkflows('Element Click');
        this._checkWorkflows('Inactivity');
        // Set up funnel event listening
        this._setupFunnelListener();
        this._log('Trigger setup completed');
    },
    
    // New method to set up Time Spent triggers without triggering them
    _setupTimeSpentTriggers() {
        this.activeWorkflows.forEach(workflow => {
            if (workflow.status !== 'Active') return;
            
            const triggerNodes = workflow.nodes.filter(node => 
                node.data.type === 'Trigger' && node.data.title === 'Time Spent'
            );
            
            triggerNodes.forEach(triggerNode => {
                this._setupTimeSpentTrigger(workflow, triggerNode);
            });
        });
    },
    
    // New method to set up Scroll Depth triggers without triggering them
    _setupScrollTriggers() {
        this.activeWorkflows.forEach(workflow => {
            if (workflow.status !== 'Active') return;
            
            const triggerNodes = workflow.nodes.filter(node => 
                node.data.type === 'Trigger' && node.data.title === 'Scroll Depth'
            );
            
            this._log(`Setting up ${triggerNodes.length} scroll triggers for workflow: ${workflow.name}`);
            
            triggerNodes.forEach(triggerNode => {
                this._log(`Setting up scroll trigger for ${workflow.name} with depth: ${triggerNode.data.settings.scrollDepth}%`);
                this._setupScrollTrigger(workflow, triggerNode);
            });
        });
    },
    
    // --- Funnel Event Handling ---
    _setupFunnelListener() {
      // Listen for funnel events from the analytics tracker
      if (window.seenticsTracker && window.seenticsTracker.onFunnelEvent) {
        window.seenticsTracker.onFunnelEvent = (funnelEvent) => {
          this._log(`Funnel event received: ${funnelEvent.event_type} for funnel ${funnelEvent.funnel_id}`);
          this._checkWorkflows('Funnel', funnelEvent);
        };
      }
      
      // Also listen for custom funnel events
      document.addEventListener('seentics:funnel-event', (event) => {
        const funnelEvent = event.detail;
        this._log(`Custom funnel event received: ${funnelEvent.event_type} for funnel ${funnelEvent.funnel_id}`);
        this._log(`Active workflows count: ${this.activeWorkflows.length}`);
        this._log(`Active workflows:`, this.activeWorkflows.map(w => ({ id: w.id, name: w.name, status: w.status })));
        this._checkWorkflows('Funnel', funnelEvent);
      });

      // Fetch workflows with funnel triggers
      this._fetchFunnelWorkflows();
    },

    // Fetch workflows that have funnel triggers (now embedded in workflow definitions)
    async _fetchFunnelWorkflows() {
      try {
        const apiHost = this._getApiHost();
        
        // Fetch all active workflows for the site
        const workflowResponse = await fetch(`${apiHost}/api/v1/workflows/site/${this.siteId}/active`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (workflowResponse.ok) {
          const workflows = await workflowResponse.json();
          
          // Filter to only include workflows that have funnel trigger nodes
          const funnelWorkflows = workflows.filter(workflow => 
            workflow.nodes && workflow.nodes.some(node => 
              node.data.type === 'Trigger' && node.data.title === 'Funnel'
            )
          );
          
          // Add to active workflows if not already present
          for (const workflow of funnelWorkflows) {
            if (!this.activeWorkflows.find(w => w.id === workflow.id)) {
              this.activeWorkflows.push(workflow);
              this._log(`Added funnel workflow: ${workflow.name}`);
            }
          }
        }
      } catch (error) {
        this._log('Error fetching funnel workflows:', error);
      }
    },

    // Check if funnel trigger conditions are met
    _checkFunnelCondition(settings, eventData) {
      if (!eventData.funnel_id || !eventData.event_type) {
        return false;
      }

      // Check if funnel ID matches
      if (settings.funnelId && settings.funnelId !== eventData.funnel_id) {
        return false;
      }

      // Check if event type matches
      if (settings.eventType && settings.eventType !== eventData.event_type) {
        return false;
      }

      // Check if step index matches
      if (settings.stepIndex !== undefined && settings.stepIndex !== null) {
        if (eventData.step_index !== undefined && eventData.step_index !== settings.stepIndex) {
          return false;
        }
      }

      // Check time threshold (if set)
      if (settings.timeThreshold && settings.timeThreshold > 0) {
        if (eventData.time_spent && eventData.time_spent < settings.timeThreshold * 60) {
          return false;
        }
      }

      // Check user segment (if set)
      if (settings.userSegment && settings.userSegment.trim()) {
        const segments = settings.userSegment.split(',').map(s => s.trim());
        const userTags = this._getUserTags();
        const hasMatchingSegment = segments.some(segment => 
          userTags.includes(segment) || 
          (segment === 'new-visitors' && !this.isReturningVisitor) ||
          (segment === 'returning-visitors' && this.isReturningVisitor)
        );
        if (!hasMatchingSegment) {
          return false;
        }
      }

      // Check value range (if set)
      if (eventData.value !== undefined) {
        if (settings.minValue && eventData.value < settings.minValue) {
          return false;
        }
        if (settings.maxValue && eventData.value > settings.maxValue) {
          return false;
        }
      }

      return true;
    },

    // Get user tags from localStorage or other sources
    _getUserTags() {
      try {
        return JSON.parse(localStorage.getItem('seentics_user_tags') || '[]');
      } catch {
        return [];
      }
    },

    // --- Workflow Evaluation ---
    _checkWorkflows(triggerType, eventData = {}) {
      this._log(`Checking workflows for trigger type: ${triggerType}`, eventData);
      this.activeWorkflows.forEach(workflow => {
        if(workflow.status !== 'Active') {
          this._log(`Skipping inactive workflow: ${workflow.name}`);
          return;
        }

        const triggerNodes = workflow.nodes.filter(node => node.data.type === 'Trigger');
        this._log(`Workflow ${workflow.name} has ${triggerNodes.length} trigger nodes`);
        triggerNodes.forEach(triggerNode => {
          this._log(`Checking trigger node: ${triggerNode.data.title} vs ${triggerType}`);
          if (triggerNode.data.title === triggerType) {
            let matches = false;
            switch(triggerType) {
                case 'Page View':
                    matches = this._checkUrlCondition(triggerNode.data.settings);
                    break;
                case 'Time Spent':
                    this._setupTimeSpentTrigger(workflow, triggerNode);
                    return; // setup is separate, not an immediate match
                case 'Inactivity':
                    this._setupInactivityTrigger(workflow, triggerNode);
                    return;
                case 'Scroll Depth':
                    // Scroll triggers are now handled by _setupScrollTriggers()
                    return;
                case 'Exit Intent':
                    this._setupExitIntentTrigger(workflow, triggerNode);
                    return;
                case 'Element Click':
                    this._setupClickTrigger(workflow, triggerNode);
                    return;
                case 'Custom Event':
                    matches = triggerNode.data.settings.customEventName === eventData.eventName;
                    break;
                case 'Funnel':
                    // Funnel triggers are now handled client-side
                    matches = this._checkFunnelCondition(triggerNode.data.settings, eventData);
                    break;
                default:
                    matches = true;
            }
            if (matches) {
              // For funnel triggers, show modal only once per session (until browser is closed)
              if (triggerType === 'Funnel') {
                const sessionKey = `seentics_funnel_modal_shown_${workflow.id}`;
                if (sessionStorage.getItem(sessionKey)) {
                  this._log(`Workflow '${workflow.name}' modal already shown in this session - skipping`);
                  return;
                }
                sessionStorage.setItem(sessionKey, 'true');
                this._log(`Workflow '${workflow.name}' modal marked as shown for this session`);
              } else {
                // Default cooldown for other trigger types (24 hours) to prevent spam
                const defaultCooldown = 24 * 60 * 60; // 24 hours
                
                // Frequency cap (cooldown) gate: look for a downstream Frequency Cap condition directly next
                const nextEdge = workflow.edges.find(e => e.source === triggerNode.id);
                const nextNode = nextEdge ? workflow.nodes.find(n => n.id === nextEdge.target) : null;
                
                let cooldownSeconds = defaultCooldown;
                if (nextNode && nextNode.data?.title === 'Frequency Cap') {
                  cooldownSeconds = nextNode.data.settings?.cooldownSeconds || defaultCooldown;
                }
                
                if (cooldownSeconds > 0) {
                  const key = `seentics_cooldown_${workflow.id}_${triggerType}`;
                  const last = parseInt(localStorage.getItem(key) || '0', 10);
                  const now = Math.floor(Date.now() / 1000);
                  if (now - last < cooldownSeconds) {
                    this._log(`Workflow '${workflow.name}' blocked by cooldown (${cooldownSeconds}s). Last triggered: ${new Date(last * 1000).toLocaleString()}`);
                    return;
                  }
                  localStorage.setItem(key, String(now));
                  this._log(`Workflow '${workflow.name}' cooldown set for ${cooldownSeconds}s until ${new Date((now + cooldownSeconds) * 1000).toLocaleString()}`);
                }
              }
              this._log(`Workflow '${workflow.name}' triggered by '${triggerType}'`);
              const runId = this._generateRunId();
              // Track trigger event with runId
              this._trackWorkflowEvent(workflow, triggerNode, 'Trigger', { runId });
              this._executeWorkflow(workflow, triggerNode, { runId, completionSent: false });
            }
          }
        });
      });
    },

    async _executeWorkflow(workflow, currentNode, runContext) {
      if (!currentNode) {
        this._log(`Workflow '${workflow.name}' completed.`);
        // Flush all collected analytics events for this workflow in a single API call
        this._flushWorkflowBatch();
        return;
      }
      
      const stepStartTime = Date.now();
      const isCondition = currentNode.data.type === 'Condition';
      const isAction = currentNode.data.type === 'Action';

      // Track step entry
      this._trackWorkflowEvent(workflow, currentNode, 'Step Entered', {
        runId: runContext?.runId,
        stepOrder: this._getStepOrder(currentNode, workflow),
        stepType: currentNode.data.type
      });

      if (isCondition) {
        const conditionMet = await this._evaluateCondition(currentNode.data);
        this._log(`Condition '${currentNode.data.title}' evaluated: ${conditionMet}`);
        
        // Track condition evaluation result
        this._trackWorkflowEvent(workflow, currentNode, 'Condition Evaluated', {
          runId: runContext?.runId,
          stepOrder: this._getStepOrder(currentNode, workflow),
          stepType: currentNode.data.type,
          success: conditionMet,
          executionTime: Date.now() - stepStartTime
        });
        
        if (!conditionMet) {
          this._log(`Workflow '${workflow.name}' stopped at condition.`);
          // Flush batch when workflow stops at condition
          this._flushWorkflowBatch();
          return;
        }
        // Join: wait for all inbound branches in a run
        if (currentNode.data.title === 'Join') {
          const runId = runContext?.runId || this._generateRunId();
          const key = `${workflow.id}_${currentNode.id}_${runId}`;
          const inboundCount = workflow.edges.filter(e => e.target === currentNode.id).length;
          
          // Initialize join state atomically to prevent race conditions
          if (!this._joinState[key]) {
            this._joinState[key] = { 
              count: 0, 
              timer: null, 
              locked: false,
              inboundCount 
            };
          }
          
          const joinState = this._joinState[key];
          
          // Use atomic increment to prevent race conditions
          joinState.count += 1;
          
          if (joinState.count < joinState.inboundCount) {
            // Start timeout once on first arrival if configured
            if (!joinState.timer && !joinState.locked) {
              joinState.locked = true; // Prevent multiple timer setups
              const timeoutSec = parseInt(currentNode.data.settings?.joinTimeoutSeconds || 0, 10);
              if (timeoutSec > 0) {
                joinState.timer = setTimeout(() => {
                  this._log(`Join timeout reached; continuing without all branches (${joinState.count}/${joinState.inboundCount}).`);
                  delete this._joinState[key];
                  // Continue flow from this join node after timeout
                  this._executeWorkflow(workflow, currentNode, runContext);
                }, timeoutSec * 1000);
              }
            }
            this._log(`Join waiting: ${joinState.count}/${joinState.inboundCount}`);
            return; // Wait for other branches
          } else {
            if (joinState.timer) { 
              try { clearTimeout(joinState.timer); } catch {} 
            }
            delete this._joinState[key];
          }
        }
      }

      if (isAction) {
        this._log(`Executing action: ${currentNode.data.title}`);
        // Handle Wait action as a timed delay between nodes, not as an immediate UI/server action
        if (currentNode.data.title === 'Wait') {
          const delayMs = Math.max(0, (currentNode.data.settings?.waitSeconds || 0) * 1000);
          if (delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
          // Do not count Wait as a completion event
        } else {
          // Execute action (client or server) with full node context
          this._executeAction(currentNode, workflow.id);
          // Track a single completion per run for client-side actions only (server actions are tracked by backend)
          if (!currentNode.data.isServerAction && runContext && !runContext.completionSent) {
            runContext.completionSent = true;
            this._trackWorkflowEvent(workflow, currentNode, 'Action Executed', { 
              runId: runContext.runId, 
              sourceNodeId: currentNode.id,
              stepOrder: this._getStepOrder(currentNode, workflow),
              stepType: currentNode.data.type,
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
        stepType: currentNode.data.type,
        success: true,
        executionTime: Date.now() - stepStartTime
      });
      
      // Find and execute next node(s)
      // Prefer outgoing edges whose target nodes actually exist
      const outgoing = workflow.edges.filter(edge => edge.source === currentNode.id);
      const validTargets = outgoing
        .map(edge => workflow.nodes.find(node => node.id === edge.target))
        .filter(Boolean);
      if (validTargets.length === 0 && outgoing.length > 0) {
        this._log(`No valid next node found from '${currentNode.data?.title}'. Check edges/targets.`);
      }

      // Add a small delay for server-side actions to feel more natural and prevent race conditions.
      if (currentNode.data.isServerAction) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Special handling: Branch Split selects exactly one branch by ratios (A/B/C), else default to first
      if (currentNode.data.title === 'Branch Split' && validTargets.length > 0) {
        const variantsCount = parseInt(currentNode.data.settings?.variantsCount || 2, 10);
        const a = Math.max(0, Math.min(100, parseInt(currentNode.data.settings?.variantAPercent ?? 50, 10)));
        const b = Math.max(0, Math.min(100, parseInt(currentNode.data.settings?.variantBPercent ?? 50, 10)));
        const c = variantsCount === 3 ? Math.max(0, Math.min(100, parseInt(currentNode.data.settings?.variantCPercent ?? 0, 10))) : 0;
        const weights = variantsCount === 3 ? [a, b, c] : [a, b];
        // Normalize and pick
        const total = Math.max(1, weights.reduce((s, v) => s + v, 0));
        let r = Math.random() * total;
        let pickIndex = 0;
        for (let i = 0; i < weights.length; i++) {
          if (r < weights[i]) { pickIndex = i; break; }
          r -= weights[i];
        }
        // Label-based routing: try to find an outgoing edge labeled with the chosen variant
        const variantCodes = ['A', 'B', 'C'];
        const chosenCode = variantCodes[Math.min(pickIndex, variantCodes.length - 1)];
        const labelCandidates = [
          chosenCode,
          (pickIndex === 0 ? currentNode.data.settings?.variantALabel : pickIndex === 1 ? currentNode.data.settings?.variantBLabel : currentNode.data.settings?.variantCLabel)
        ].filter(Boolean).map((s) => String(s).toLowerCase().trim());

        const outgoingEdges = workflow.edges.filter(edge => edge.source === currentNode.id);
        const labeledEdge = outgoingEdges.find(edge => {
          const edgeLabel = (edge.label || (edge.data && edge.data.label) || '').toString().toLowerCase().trim();
          const targetExists = workflow.nodes.some(n => n.id === edge.target);
          return targetExists && edgeLabel && labelCandidates.includes(edgeLabel);
        });

        let chosen;
        if (labeledEdge) {
          chosen = workflow.nodes.find(n => n.id === labeledEdge.target);
        }
        // Fallback: Clamp to available targets (map A->0, B->1, C->2)
        if (!chosen) {
          chosen = validTargets[Math.min(pickIndex, validTargets.length - 1)];
        }
        await this._executeWorkflow(workflow, chosen, runContext);
        return;
      }

      // Default behavior: fan-out to all valid targets in parallel
      await Promise.all(validTargets.map(next => this._executeWorkflow(workflow, next, runContext)));
    },

    async _evaluateCondition(conditionData) {
        // Add null checks to prevent TypeError
        if (!conditionData || !conditionData.settings) {
            this._log('Warning: Invalid condition data received:', conditionData);
            return false;
        }

        switch (conditionData.title) {
            case 'URL Path':
                return this._checkUrlCondition(conditionData.settings);
            case 'Device Type':
                // Add safety check for deviceType property
                if (!conditionData.settings.deviceType) {
                    this._log('Warning: Device Type condition missing deviceType setting');
                    return false;
                }
                return (conditionData.settings.deviceType === 'Mobile') === this._isMobile();
            case 'Browser':
                // Add safety check for browser property
                if (!conditionData.settings.browser) {
                    this._log('Warning: Browser condition missing browser setting');
                    return false;
                }
                return this._getBrowser() === conditionData.settings.browser;
            case 'Traffic Source':
                // Add safety check for referrer property
                if (!conditionData.settings.referrer) {
                    this._log('Warning: Traffic Source condition missing referrer setting');
                    return false;
                }
                return this._checkReferrerCondition(conditionData.settings);
            case 'New vs Returning':
                // Add safety check for visitorType property
                if (!conditionData.settings.visitorType) {
                    this._log('Warning: New vs Returning condition missing visitorType setting');
                    return false;
                }
                return conditionData.settings.visitorType === (this.isReturningVisitor ? 'returning' : 'new');
            case 'A/B Split': {
                const pct = Math.max(0, Math.min(100, parseInt(conditionData.settings?.variantAPercent || 50, 10)));
                const bucket = Math.random() * 100;
                return bucket < pct; // true => Variant A path; false => Variant B (assume alternate path wired)
            }
            case 'Branch Split': {
                const a = Math.max(0, Math.min(100, parseInt(conditionData.settings?.variantAPercent ?? 50, 10)));
                const b = Math.max(0, Math.min(100, parseInt(conditionData.settings?.variantBPercent ?? 50, 10)));
                const cEnabled = (parseInt(conditionData.settings?.variantsCount || 2, 10) === 3);
                const c = cEnabled ? Math.max(0, Math.min(100, parseInt(conditionData.settings?.variantCPercent ?? 0, 10))) : 0;
                const total = Math.max(1, a + b + c);
                const r = Math.random() * total;
                // Choose branch by range; then runner fan-out will follow all edges, so we return true to allow progression
                // We annotate chosen label into runContext is not trivial here; downstream branching is by edges.
                return true;
            }
            case 'Time Window': {
                const now = new Date();
                const hour = now.getHours();
                const start = (conditionData.settings?.startHour ?? 0);
                const end = (conditionData.settings?.endHour ?? 23);
                let hourOk = false;
                if (start <= end) hourOk = hour >= start && hour <= end; else hourOk = hour >= start || hour <= end;
                const days = conditionData.settings?.daysOfWeek;
                const dayOk = Array.isArray(days) && days.length > 0 ? days.includes(now.getDay()) : true;
                return hourOk && dayOk;
            }
            case 'Query Param': {
                const name = conditionData.settings?.queryParam;
                if (!name) return false;
                const params = new URLSearchParams(window.location.search);
                const val = params.get(name);
                const type = conditionData.settings?.queryMatchType || 'exists';
                const target = conditionData.settings?.queryValue || '';
                if (type === 'exists') return params.has(name);
                if (val == null) return false;
                switch (type) {
                    case 'exact': return val === target;
                    case 'contains': return val.includes(target);
                    case 'startsWith': return val.startsWith(target);
                    case 'endsWith': return val.endsWith(target);
                    default: return false;
                }
            }
            
            case 'Tag': {
                try {
                    const tag = conditionData.settings?.tagName;
                    if (!tag) return false;
                    
                    // Session cache with TTL
                    const cacheKey = `seentics_tag_${this.siteId}_${this.visitorId}_${tag}`;
                    const cached = sessionStorage.getItem(cacheKey);
                    if (cached) {
                        try {
                            const { value, timestamp } = JSON.parse(cached);
                            const now = Date.now();
                            const ttl = 5 * 60 * 1000; // 5 minutes TTL
                            if (now - timestamp < ttl) {
                                return value === 'true';
                            }
                        } catch (e) {
                            // Invalid cache, continue to API call
                        }
                    }
                    
                    const apiHost = this._getApiHost();
                    const url = `${apiHost}/api/v1/visitor/${this.siteId}/${this.visitorId}/has-tag?tag=${encodeURIComponent(tag)}`;
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                    
                    const ok = await fetch(url, { 
                        credentials: 'include',
                        signal: controller.signal
                    })
                      .then(r => {
                          clearTimeout(timeoutId);
                          if (!r.ok) throw new Error(`Tag check failed: ${r.status}`);
                          return r.json();
                      })
                      .then(json => !!json?.hasTag)
                      .catch((error) => {
                          clearTimeout(timeoutId);
                          this._log('Tag check error:', error);
                          return false;
                      });
                    
                    // Cache the result with timestamp
                    try { 
                        sessionStorage.setItem(cacheKey, JSON.stringify({
                            value: ok ? 'true' : 'false',
                            timestamp: Date.now()
                        })); 
                    } catch (e) {
                        // Storage quota exceeded or other error
                        this._log('Failed to cache tag result:', e);
                    }
                    
                    return ok;
                } catch (error) { 
                    this._log('Tag condition evaluation error:', error);
                    return false; 
                }
            }
            // 'Tag' condition previously evaluated server-side; now it calls the visitor API.
            default:
                this._log(`Warning: Unknown condition type '${conditionData.title}' - defaulting to true`);
                return true;
        }
    },

    // --- Action Execution ---
    _executeAction(node, workflowId) {
      const actionData = node?.data || {};
      if (actionData.isServerAction) {
          this._executeServerActionNode(node, workflowId);
          return;
      }
      
      // Ensure settings exist with defaults
      const settings = actionData.settings || {};
      
      // Debug logging for troubleshooting
      this._log(`Executing action: ${actionData.title}`, { 
        hasSettings: !!settings, 
        settingsKeys: Object.keys(settings),
        nodeData: actionData 
      });
      
      switch (actionData.title) {
        case 'Show Modal': this._showModal(settings); break;
        case 'Show Banner': this._showBanner(settings); break;
        case 'Insert Section': this._insertSection(settings); break;
        case 'Redirect URL': 
          this._log(`Executing Redirect URL action to: ${settings.redirectUrl}`);
          if (settings.redirectUrl) {
            this._log(`Redirecting to: ${settings.redirectUrl}`);
            window.location.href = settings.redirectUrl; 
          } else {
            this._log('Warning: Redirect URL not specified');
          }
          break;
        case 'Track Event': 
          if (settings.eventName) {
            window.seentics.track(settings.eventName); 
          } else {
            this._log('Warning: Event name not specified');
          }
          break;
      }
    },

    // Execute server action (redirects to _executeServerActionNode)
    _executeServerAction(actionData) {
        // This is a compatibility method that redirects to the actual implementation
        this._executeServerActionNode(actionData, actionData.workflowId);
    },

    _executeServerActionNode(node, workflowId) {
        this._log(`Sending server action request for '${node.data?.title}'`);
        const apiHost = this._getApiHost();
        const payload = {
            workflowId: workflowId,
            nodeId: node.id,
            siteId: this.siteId,
            domain: window.location.hostname,
            visitorId: this.visitorId,
            identifiedUser: this.identifiedUser,
            localStorageData: {}
        };
        
        if (node.data?.settings?.localStorageData) {
            node.data.settings.localStorageData.forEach(item => {
                try {
                    const value = localStorage.getItem(item.localStorageKey);
                    if (value !== null) {
                        payload.localStorageData[item.payloadKey] = value;
                    }
                } catch (error) {
                    this._log('Error reading localStorage:', error);
                }
            });
        }
        
        try {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            const success = navigator.sendBeacon(`${apiHost}/api/v1/workflows/execution/action`, blob);
            
            if (!success) {
                // Fallback to fetch if sendBeacon fails
                this._log('sendBeacon failed, falling back to fetch');
                fetch(`${apiHost}/api/v1/workflows/execution/action`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(error => {
                    this._log('Fallback fetch also failed:', error);
                });
            }
        } catch (error) {
            this._log('Error executing server action:', error);
        }
    },
    
    // --- UI Actions Implementation ---
    _injectStyles(css, scopeId) {
        const styleId = `seentics-style-${scopeId}`;
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        // Basic scoping by adding the scopeId as a class to selectors
        let scopedCss = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|s*\{)/g, `[data-seentics-id="${scopeId}"] $1 `);
        // Map body selector to the modal wrapper itself
        const bodySelector = new RegExp(`\\[data-seentics-id=\"${scopeId}\"\\]\\s*body`, 'g');
        scopedCss = scopedCss.replace(bodySelector, `[data-seentics-id="${scopeId}"]`);
        style.innerHTML = scopedCss;
        document.head.appendChild(style);
    },

    _injectDefaultModalCSS() {
        // Check if tracker styles are already loaded
        if (document.getElementById('seentics-tracker-styles')) return;
        
        // Load the existing tracker-styles.css file
        const link = document.createElement('link');
        link.id = 'seentics-tracker-styles';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        // Allow override via global config for cross-domain embedding
        const configuredHref = (window.SEENTICS_CONFIG && window.SEENTICS_CONFIG.trackerStylesUrl) ? window.SEENTICS_CONFIG.trackerStylesUrl : '/tracker-styles.css';
        link.href = configuredHref;
        
        link.onload = () => {
            console.log('[Seentics] Tracker styles loaded successfully');
        };
        
        link.onerror = (error) => {
            console.error('[Seentics] Failed to load tracker styles:', error);
        };
        
        document.head.appendChild(link);
    },

    _executeJs(js, element) {
        try {
            const scopedDoc = new Proxy(document, {
                get(target, prop) {
                    if (prop === 'getElementById') {
                        return (id) => element.querySelector(`#${(window.CSS && CSS.escape) ? CSS.escape(id) : id}`);
                    }
                    if (prop === 'querySelector') {
                        return (sel) => element.querySelector(sel);
                    }
                    if (prop === 'querySelectorAll') {
                        return (sel) => element.querySelectorAll(sel);
                    }
                    return target[prop];
                }
            });
            new Function('document', 'element', js)(scopedDoc, element);
        } catch (e) {
            if (window.SEENTICS_CONFIG?.debugMode) {
                console.error("Seentics: Error executing custom JS.", e);
            }
            this._log('Error executing custom JS:', e);
        }
    },

    _showModal(settings) {
        // Ensure settings exists with defaults
        settings = settings || {};
        
        // Set default displayMode if not specified
        if (!settings.displayMode) {
            settings.displayMode = 'default';
        }
        
        // Validate required settings
        if (!settings.modalTitle && !settings.modalContent && !settings.customHtml) {
            this._log('Warning: Modal has no content to display', settings);
            return;
        }
        
        const modalId = `seentics-modal-${Date.now()}`;
        const overlay = this._createElement('div', { className: 'seentics-overlay' });

        // Custom mode via iframe for full isolation and correct CSS/JS behavior
        if (settings.displayMode === 'custom' && settings.customHtml) {
            // Make overlay transparent so custom background shows through
            overlay.style.background = 'transparent';

            const iframe = document.createElement('iframe');
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
            iframe.style.width = '100vw';
            iframe.style.height = '100vh';
            iframe.style.border = '0';
            iframe.style.background = 'transparent';

            const bodyHtml = this._extractBodyHtml(settings.customHtml);
            const css = settings.customCss || '';
            const js = settings.customJs || '';
            const srcdoc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>${bodyHtml}<script>(function(){try{${js}}catch(e){console.error(e)}})()<\/script></body></html>`;
            iframe.srcdoc = srcdoc;

            overlay.appendChild(iframe);

            const cleanup = () => { try { document.body.removeChild(overlay); } catch {} };
            const escHandler = (e) => { if (e.key === 'Escape') cleanup(); };
            window.addEventListener('keydown', escHandler);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(); });

            // Close button floating over iframe
            const closeButton = this._createElement('button', { className: 'seentics-close-button', innerHTML: '&times;' });
            closeButton.style.position = 'fixed';
            closeButton.style.top = '12px';
            closeButton.style.right = '12px';
            closeButton.onclick = cleanup;
            overlay.appendChild(closeButton);

            document.body.appendChild(overlay);
            return;
        }

        // Default template modal
        const modal = this._createElement('div', { className: 'seentics-modal', 'data-seentics-id': modalId });
        const title = this._createElement('h2', { className: 'seentics-modal-title', textContent: settings.modalTitle });
        const content = this._createElement('p', { className: 'seentics-modal-content', textContent: settings.modalContent });
        modal.append(title, content);

        // Inject default modal CSS if not already injected
        this._injectDefaultModalCSS();

        const closeButton = this._createElement('button', { className: 'seentics-close-button', innerHTML: '&times;' });
        const cleanup = () => {
          try { document.body.removeChild(overlay); } catch {}
          window.removeEventListener('keydown', escHandler);
        };
        const escHandler = (e) => { if (e.key === 'Escape') cleanup(); };
        window.addEventListener('keydown', escHandler);
        closeButton.onclick = cleanup;
        modal.appendChild(closeButton);
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(); });
    },

    _showBanner(settings) {
        // Ensure settings exists with defaults
        settings = settings || {};
        
        // Set default displayMode if not specified
        if (!settings.displayMode) {
            settings.displayMode = 'default';
        }
        
        // Validate required settings
        if (!settings.bannerContent && !settings.customHtml) {
            this._log('Warning: Banner has no content to display', settings);
            return;
        }
        
        const bannerId = `seentics-banner-${Date.now()}`;
        const banner = this._createElement('div', { className: `seentics-banner seentics-banner-${settings.bannerPosition || 'top'}`, 'data-seentics-id': bannerId });
        
        // Ensure default tracker styles are available for banners (same as modals)
        this._injectDefaultModalCSS();
        
        if (settings.displayMode === 'custom' && settings.customHtml) {
             // Render custom banner inside an iframe for full CSS/JS isolation (fixes keyframes/scoping issues)
             banner.style.background = 'transparent';
             banner.style.boxShadow = 'none';
             // Remove default padding/gap and flex so iframe is true edge-to-edge
             banner.style.padding = '0';
             banner.style.display = 'block';
             banner.style.gap = '0';

             const iframe = document.createElement('iframe');
             iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
             iframe.style.width = '100%';
             iframe.style.border = '0';
             iframe.style.display = 'block';
             // Initial small height; will be resized to content
             iframe.style.height = '1px';

             const bodyHtml = this._extractBodyHtml(settings.customHtml);
             const css = settings.customCss || '';
             const js = settings.customJs || '';
             const srcdoc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body>${bodyHtml}<script>(function(){try{${js}}catch(e){console.error(e)}})()<\/script></body></html>`;
             iframe.srcdoc = srcdoc;

             const resizeToContent = () => {
                 try {
                     const doc = iframe.contentDocument || iframe.contentWindow?.document;
                     if (!doc) return;
                     const height = Math.max(
                         doc.body?.scrollHeight || 0,
                         doc.documentElement?.scrollHeight || 0
                     );
                     if (height) iframe.style.height = height + 'px';
                 } catch {}
             };

             iframe.onload = () => {
                 resizeToContent();
                 try {
                     const doc = iframe.contentDocument || iframe.contentWindow?.document;
                     if (!doc) return;
                     const ro = new (window.ResizeObserver || function(cb){ return { observe(){}, disconnect(){} }; })(() => resizeToContent());
                     ro.observe(doc.documentElement);
                     ro.observe(doc.body);
                 } catch {}
             };

             banner.appendChild(iframe);
        } else {
             const content = this._createElement('p', { textContent: settings.bannerContent });
             banner.appendChild(content);

             if (settings.bannerCtaText && settings.bannerCtaUrl) {
                const ctaButton = this._createElement('a', { className: 'seentics-banner-cta', textContent: settings.bannerCtaText, href: settings.bannerCtaUrl });
                banner.appendChild(ctaButton);
            }
        }
        
        const closeButton = this._createElement('button', { className: 'seentics-close-button', innerHTML: '&times;' });
        // For custom iframe banners, float the close button so it doesn't consume horizontal space
        if (settings.displayMode === 'custom' && settings.customHtml) {
            closeButton.style.position = 'absolute';
            closeButton.style.right = '12px';
            if ((settings.bannerPosition || 'top') === 'bottom') {
                closeButton.style.bottom = '12px';
            } else {
                closeButton.style.top = '12px';
            }
        }
        closeButton.onclick = () => { 
          try { 
            banner.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
            banner.style.opacity = '0';
            banner.style.transform = settings.bannerPosition === 'bottom' ? 'translateY(100%)' : 'translateY(-100%)';
            setTimeout(() => { try { document.body.removeChild(banner); } catch {} }, 250);
          } catch {}
        };
        banner.appendChild(closeButton);

        document.body.appendChild(banner);

        // For iframe-based custom banners, JS is injected via srcdoc; no need to execute here
    },

    _insertSection(settings) {
        // Ensure settings exists with defaults
        settings = settings || {};
        
        if (!settings.selector) {
            this._log('Insert Section failed: no selector specified.');
            return;
        }
        
        const targetElement = document.querySelector(settings.selector);
        if (!targetElement) {
            this._log(`Insert Section failed: target element '${settings.selector}' not found.`);
            return;
        }

        const sectionId = `seentics-section-${Date.now()}`;
        const wrapper = this._createElement('div', { 'data-seentics-id': sectionId });
        wrapper.innerHTML = this._extractBodyHtml(settings.customHtml || '');

        if (settings.customCss) {
            this._injectStyles(settings.customCss, sectionId);
        }

        switch (settings.insertPosition) {
            case 'before': targetElement.parentNode.insertBefore(wrapper, targetElement); break;
            case 'after': targetElement.parentNode.insertBefore(wrapper, targetElement.nextSibling); break;
            case 'prepend': targetElement.prepend(wrapper); break;
            case 'append': targetElement.append(wrapper); break;
            default: targetElement.append(wrapper);
        }

        if (settings.customJs) {
            this._executeJs(settings.customJs, wrapper);
        }
    },

    // --- Trigger Setup Helpers ---
    _setupTimeSpentTrigger(workflow, triggerNode) {
        const delayMs = Math.max(0, (triggerNode.data.settings.seconds || 0) * 1000);
        if (delayMs <= 0) return;
        
        const timerId = setTimeout(() => {
            this._log(`Time Spent trigger for '${workflow.name}' fired.`);
            // Track trigger event for time-based trigger
            const runId = this._generateRunId();
            this._trackWorkflowEvent(workflow, triggerNode, 'Trigger', { runId });
            this._executeWorkflow(workflow, triggerNode, { runId, completionSent: false });
        }, delayMs);
        
        this._activeTimers.add(timerId);
        
        // Store cleanup function for later removal
        const cleanupKey = `timeSpent_${workflow.id}_${triggerNode.id}`;
        this._eventListeners.set(cleanupKey, () => {
            clearTimeout(timerId);
            this._activeTimers.delete(timerId);
        });
    },

    _setupInactivityTrigger(workflow, triggerNode) {
        const thresholdMs = (triggerNode.data.settings?.inactivitySeconds || 30) * 1000;
        let timeoutId = null;
        let isFired = false;
        
        const fire = () => {
            if (isFired) return;
            isFired = true;
            this._log(`Inactivity trigger for '${workflow.name}' fired.`);
            const runId = this._generateRunId();
            this._trackWorkflowEvent(workflow, triggerNode, 'Trigger', { runId });
            this._executeWorkflow(workflow, triggerNode, { runId, completionSent: false });
            cleanup();
        };
        
        const resetTimer = () => {
            if (isFired) return;
            if (timeoutId) {
                clearTimeout(timeoutId);
                this._activeTimers.delete(timeoutId);
            }
            timeoutId = setTimeout(fire, thresholdMs);
            this._activeTimers.add(timeoutId);
        };
        
        const activityEvents = ['mousemove','keydown','scroll','click','touchstart'];
        
        const cleanup = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                this._activeTimers.delete(timeoutId);
            }
            activityEvents.forEach(evt => document.removeEventListener(evt, resetTimer, true));
            window.removeEventListener('beforeunload', cleanup);
        };
        
        // Store cleanup function for later removal
        const cleanupKey = `inactivity_${workflow.id}_${triggerNode.id}`;
        this._eventListeners.set(cleanupKey, cleanup);
        
        activityEvents.forEach(evt => document.addEventListener(evt, resetTimer, true));
        resetTimer();
        window.addEventListener('beforeunload', cleanup);
    },

    _setupScrollTrigger(workflow, triggerNode) {
        this._log(`Setting up scroll trigger for workflow: ${workflow.name}, depth: ${triggerNode.data.settings.scrollDepth}%`);
        
        let triggered = false;
        let lastScrollTime = 0;
        const throttleDelay = 100; // Throttle to 100ms for better performance
        
        const scrollHandler = () => {
            this._log(`Scroll event detected for ${workflow.name}`);
            
            if (triggered) {
                this._log(`Scroll trigger already fired for ${workflow.name}, removing listener`);
                window.removeEventListener('scroll', scrollHandler);
                return;
            }
            
            const now = Date.now();
            if (now - lastScrollTime < throttleDelay) {
                this._log(`Scroll event throttled for ${workflow.name}`);
                return;
            }
            lastScrollTime = now;
            
            // Simplified scroll calculation that works better
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const documentHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            const windowHeight = window.innerHeight;
            const scrollableHeight = Math.max(documentHeight - windowHeight, 1);
            const scrollPercent = Math.min((scrollTop / scrollableHeight) * 100, 100);
            
            // Fallback: if no scrollable content, use viewport-based calculation
            let finalScrollPercent = scrollPercent;
            if (scrollableHeight <= 1 || scrollPercent === 0) {
                // Use viewport-based calculation as fallback
                const viewportScrollPercent = (scrollTop / windowHeight) * 100;
                finalScrollPercent = Math.min(viewportScrollPercent, 100);
            }
            const requiredDepth = triggerNode.data.settings.scrollDepth || 0;
            
            this._log(`Scroll event: ${finalScrollPercent.toFixed(1)}% (required: ${requiredDepth}%) - scrollTop: ${scrollTop}, docHeight: ${documentHeight}, winHeight: ${windowHeight}, scrollable: ${scrollableHeight}`);
            
            if (finalScrollPercent >= requiredDepth) {
                triggered = true;
                this._log(`Scroll Depth trigger for '${workflow.name}' fired.`);
                // Track trigger event for scroll trigger
                const runId = this._generateRunId();
                this._trackWorkflowEvent(workflow, triggerNode, 'Trigger', { runId });
                this._executeWorkflow(workflow, triggerNode, { runId, completionSent: false });
                window.removeEventListener('scroll', scrollHandler);
            }
        };
        
        // Store cleanup function for later removal
        const cleanupKey = `scroll_${workflow.id}_${triggerNode.id}`;
        this._eventListeners.set(cleanupKey, () => {
            window.removeEventListener('scroll', scrollHandler);
        });
        
        window.addEventListener('scroll', scrollHandler, { passive: true });
        this._log(`Scroll event listener added for workflow: ${workflow.name}`);
        
        // Test the scroll event listener immediately
        setTimeout(() => {
            this._log(`Testing scroll event listener for ${workflow.name}...`);
            window.dispatchEvent(new Event('scroll'));
        }, 100);
        
        // Add a simple test scroll listener to verify events are working
        const testScrollListener = () => {
            this._log(`TEST: Scroll event detected! scrollY: ${window.scrollY}`);
        };
        window.addEventListener('scroll', testScrollListener, { passive: true });
        
        // Store test listener for cleanup
        this._eventListeners.set(`test_scroll_${workflow.id}`, () => {
            window.removeEventListener('scroll', testScrollListener);
        });
    },

    _setupExitIntentTrigger(workflow, triggerNode) {
        let triggered = false;
        let lastMouseMoveTime = 0;
        const throttleDelay = 50; // Throttle mouse move events for better performance
        
        const fire = () => {
            if (triggered) return;
            triggered = true;
            this._log(`Exit Intent trigger for '${workflow.name}' fired.`);
            const runId = this._generateRunId();
            this._trackWorkflowEvent(workflow, triggerNode, 'Trigger', { runId });
            this._executeWorkflow(workflow, triggerNode, { runId, completionSent: false });
            cleanup();
        };

        const onMouseLeave = (e) => {
            if (triggered) return;
            // Leaving the document towards the top
            if (typeof e.clientY === 'number' && e.clientY <= 0) {
                fire();
            }
        };

        const onMouseOut = (e) => {
            if (triggered) return;
            const related = e.relatedTarget;
            const leftDocument = !related || (related && related.nodeName === 'HTML');
            if (leftDocument && typeof e.clientY === 'number' && e.clientY <= 10) {
                fire();
            }
        };

        let lastY = null;
        const onMouseMove = (e) => {
            if (triggered) return;
            
            const now = Date.now();
            if (now - lastMouseMoveTime < throttleDelay) return;
            lastMouseMoveTime = now;
            
            const y = e.clientY;
            if (typeof y === 'number') {
                if (y <= 3 && (lastY == null || lastY > 3)) {
                    fire();
                }
                lastY = y;
            }
        };

        const cleanup = () => {
            document.removeEventListener('mouseleave', onMouseLeave);
            document.removeEventListener('mouseout', onMouseOut);
            document.removeEventListener('mousemove', onMouseMove, true);
        };
        
        // Store cleanup function for later removal
        const cleanupKey = `exitIntent_${workflow.id}_${triggerNode.id}`;
        this._eventListeners.set(cleanupKey, cleanup);

        document.addEventListener('mouseleave', onMouseLeave);
        document.addEventListener('mouseout', onMouseOut);
        // Fallback for browsers that don't reliably emit mouseleave/mouseout at the top edge
        document.addEventListener('mousemove', onMouseMove, true);
    },
    
    _setupClickTrigger(workflow, triggerNode) {
        let triggered = false;
        let lastClickTime = 0;
        const throttleDelay = 100; // Prevent rapid-fire clicks
        
        const clickHandler = (e) => {
            if (triggered) {
                document.removeEventListener('click', clickHandler, true);
                return;
            }
            
            const now = Date.now();
            if (now - lastClickTime < throttleDelay) return;
            lastClickTime = now;
            
            const sel = triggerNode.data.settings.selector;
            const target = e.target;
            if (target && (target.matches?.(sel) || target.closest?.(sel))) {
                triggered = true;
                this._log(`Element Click trigger for '${workflow.name}' fired.`);
                // Track trigger event for click trigger
                const runId = this._generateRunId();
                this._trackWorkflowEvent(workflow, triggerNode, 'Trigger', { runId });
                this._executeWorkflow(workflow, triggerNode, { runId, completionSent: false });
                document.removeEventListener('click', clickHandler, true);
            }
        };
        
        // Store cleanup function for later removal
        const cleanupKey = `click_${workflow.id}_${triggerNode.id}`;
        this._eventListeners.set(cleanupKey, () => {
            document.removeEventListener('click', clickHandler, true);
        });
        
        document.addEventListener('click', clickHandler, true);
    },
    
    // --- Condition Helpers ---
    _checkUrlCondition(settings) {
        if (!settings || !settings.url) return true; // No URL specified means it matches any page
        let currentUrl = window.location.href;
        let path = window.location.pathname;
        // In preview mode, allow overriding the path via a global for testing URL conditions
        try {
            if (this.siteId === 'preview') {
                const overridePath = window.__SEENTICS_PREVIEW_PATH;
                if (typeof overridePath === 'string' && overridePath.length > 0) {
                    path = overridePath;
                    // Construct a fake URL using the same origin for contains/exact checks
                    currentUrl = window.location.origin + overridePath;
                }
            }
        } catch {}
        const targetUrl = settings.url;

        switch (settings.urlMatchType) {
            case 'exact': return currentUrl === targetUrl || path === targetUrl;
            case 'contains': return currentUrl.includes(targetUrl);
            case 'startsWith': return path.startsWith(targetUrl);
            case 'endsWith': return path.endsWith(targetUrl);
            default: return currentUrl.includes(targetUrl);
        }
    },

    _checkReferrerCondition(settings) {
        const referrer = document.referrer;
        if (!settings.referrerUrl) {
            return !referrer; // Match if "direct" traffic
        }
        if (!referrer) return false;
        
        switch (settings.referrerMatchType) {
            case 'exact': return referrer === settings.referrerUrl;
            case 'contains': return referrer.includes(settings.referrerUrl);
            case 'startsWith': return referrer.startsWith(settings.referrerUrl);
            case 'endsWith': return referrer.endsWith(settings.referrerUrl);
            default: return referrer.includes(settings.referrerUrl);
        }
    },

    _getBrowser() {
        const ua = navigator.userAgent;
        if (ua.indexOf("Chrome") > -1) return "chrome";
        if (ua.indexOf("Firefox") > -1) return "firefox";
        if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) return "safari";
        if (ua.indexOf("Edg") > -1) return "edge";
        return "other";
    },

    _isMobile() {
        return /Mobi|Android/i.test(navigator.userAgent);
    },

    _checkIfReturning() {
        const isReturning = localStorage.getItem(this.returningVisitorKey);
        if (isReturning) {
            return true;
        }
        localStorage.setItem(this.returningVisitorKey, 'true');
        return false;
    },
    
    _getVisitorId() {
      // In a real app, this would be more robust.
      let visitorId = localStorage.getItem('seentics_visitor_id');
      if (!visitorId) {
        visitorId = 'visitor_' + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('seentics_visitor_id', visitorId);
      }
      return visitorId;
    },
    

    // --- Backend Communication ---
    _fetchWorkflows() {
      const apiHost = this._getApiHost();
      
      // Add request timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      fetch(`${apiHost}/api/v1/workflows/site/${this.siteId}/active`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          clearTimeout(timeoutId);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
            if (data && data.workflows) {
              this.activeWorkflows = data.workflows.filter(wf => wf.status === 'Active');
              this._log(`Loaded ${this.activeWorkflows.length} active workflows.`);
              this._log(`Workflow names: ${this.activeWorkflows.map(w => w.name).join(', ')}`);
              this._setupTriggers();
            }
        })
        .catch(err => {
          clearTimeout(timeoutId);
          if (err.name === 'AbortError') {
            this._log('Workflow fetch timed out after 10 seconds');
          } else {
            this._log('Error fetching workflows:', err);
          }
        });
    },

    // --- Cleanup and Destruction ---
    destroy() {
        this._cleanupEventListeners();
        this._clearAllTimers();
        this._flushAnalyticsBatch();
        this._clearJoinStates();
        this._log('Workflow tracker destroyed and cleaned up');
    },

    _cleanupEventListeners() {
        this._eventListeners.forEach((cleanup, key) => {
            try {
                cleanup();
            } catch (error) {
                this._log(`Error cleaning up event listener ${key}:`, error);
            }
        });
        this._eventListeners.clear();
    },

    _clearAllTimers() {
        this._activeTimers.forEach(timerId => {
            try {
                clearTimeout(timerId);
            } catch (error) {
                this._log('Error clearing timer:', error);
            }
        });
        this._activeTimers.clear();
        
        if (this._analyticsBatchTimer) {
            clearTimeout(this._analyticsBatchTimer);
            this._analyticsBatchTimer = null;
        }
    },

    _clearJoinStates() {
        Object.keys(this._joinState).forEach(key => {
            const state = this._joinState[key];
            if (state.timer) {
                try {
                    clearTimeout(state.timer);
                } catch (error) {
                    this._log('Error clearing join timer:', error);
                }
            }
        });
        this._joinState = {};
    },

    // --- Helpers ---
    _createElement(tag, properties = {}) {
        const el = document.createElement(tag);
        for (const [key, value] of Object.entries(properties)) {
            if (key === 'className') el.className = value;
            else if (key === 'textContent') el.textContent = value;
            else if (key === 'innerHTML') el.innerHTML = value;
            else el.setAttribute(key, value);
        }
        return el;
    },

    _log(message, details) {
        if (this.siteId === 'preview' && window.logToPreviewer) {
            const logMessage = details ? `${message} | ${JSON.stringify(details)}` : message;
            window.logToPreviewer(logMessage);
        }
        // Enable console logging for debugging
        console.log(`[Seentics Workflow]: ${message}`, details || '');
    },
  };

  // Expose the module to the global window object
  window.seentics = window.seentics || {};
  window.seentics.workflowTracker = workflowTracker;

  // Add global function to manually trigger funnel events for testing
  window.triggerFunnelEvent = (funnelId, eventType, stepIndex = 0, additionalData = {}) => {
    const funnelEvent = {
      funnel_id: funnelId,
      event_type: eventType,
      step_index: stepIndex,
      timestamp: new Date().toISOString(),
      website_id: window.seentics?.workflowTracker?.siteId || 'unknown',
      ...additionalData
    };
    
    console.log('🎯 Manually triggering funnel event:', funnelEvent);
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('seentics:funnel-event', {
      detail: funnelEvent
    }));
    
    return funnelEvent;
  };
  
  // Add global configuration object
  window.SEENTICS_CONFIG = window.SEENTICS_CONFIG || {
          apiHost: window.SEENTICS_CONFIG?.apiHost || 
        (window.location.hostname === 'localhost' ? 
          (window.SEENTICS_CONFIG?.devApiHost || 'http://localhost:8080') : 
          `https://${window.location.hostname}`),
    batchSize: 10,
    batchDelay: 1000,
    requestTimeout: 10000,
    tagCacheTTL: 5 * 60 * 1000
  };
  
  // Add global destroy method for cleanup
  window.destroySeenticsWorkflowTracker = () => {
    if (window.seentics.workflowTracker) {
      window.seentics.workflowTracker.destroy();
    }
  };
})();
