# Workflow Engine Microservice

This document describes the Workflow Engine microservice, which handles workflow creation, execution, and management for website automation.

## 🏗️ Architecture Overview

The Workflow Engine service is a Node.js-based microservice that provides:

- **Workflow Management**: CRUD operations for workflows
- **Execution Engine**: Real-time workflow execution
- **Node System**: Configurable workflow nodes and actions
- **Template Library**: Pre-built workflow templates
- **Analytics**: Workflow performance tracking
- **Queue Management**: Redis-based job processing

## 🔧 Technical Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Queue System**: Redis with Bull.js
- **Real-time**: WebSocket support
- **Validation**: Joi schema validation
- **Testing**: Jest and Supertest

## 📁 Project Structure

```
services/workflows/
├── src/
│   ├── config/           # Configuration management
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── nodes/           # Workflow node definitions
│   ├── actions/         # Action implementations
│   ├── queue/           # Job queue management
│   ├── utils/           # Utility functions
│   └── validation/      # Request validation schemas
├── tests/               # Test files
├── Dockerfile           # Docker configuration
├── package.json         # Dependencies
└── README.md           # Service documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- Redis 7.0+

### Installation
```bash
cd services/workflows
npm install
```

### Environment Configuration
Create a `.env` file with the following variables:

```bash
# Service Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/seentics_workflows
WORKFLOW_MONGODB_URI=mongodb://localhost:27017/seentics_workflows

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
WORKFLOW_JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters

# API Gateway Configuration
API_GATEWAY_URL=http://localhost:8080

# Queue Configuration
QUEUE_CONCURRENCY=10
QUEUE_RETRY_ATTEMPTS=3
QUEUE_RETRY_DELAY=5000
```

### Running the Service
```bash
# Development mode
npm run dev

# Production mode
npm start

# With PM2
pm2 start ecosystem.config.js
```

## 📊 Data Models

### Workflow Model
```javascript
const workflowSchema = new mongoose.Schema({
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['trigger', 'scheduled', 'manual'],
    default: 'trigger'
  },
  version: {
    type: Number,
    default: 1
  },
  trigger: {
    type: {
      type: String,
      enum: ['pageview', 'click', 'scroll', 'exit_intent', 'custom', 'time'],
      required: true
    },
    conditions: [{
      field: String,
      operator: {
        type: String,
        enum: ['equals', 'contains', 'greater_than', 'less_than', 'regex', 'in']
      },
      value: mongoose.Schema.Types.Mixed,
      logicalOperator: {
        type: String,
        enum: ['AND', 'OR'],
        default: 'AND'
      }
    }],
    delay: {
      type: Number,
      default: 0,
      min: 0
    },
    frequency: {
      type: String,
      enum: ['once', 'always', 'daily', 'weekly', 'monthly'],
      default: 'once'
    },
    maxExecutions: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  nodes: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['trigger', 'condition', 'action', 'delay', 'split', 'merge'],
      required: true
    },
    position: {
      x: Number,
      y: Number
    },
    config: mongoose.Schema.Types.Mixed,
    connections: [String]
  }],
  actions: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['modal', 'email', 'webhook', 'redirect', 'custom', 'notification'],
      required: true
    },
    config: mongoose.Schema.Types.Mixed,
    conditions: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }],
    delay: {
      type: Number,
      default: 0
    }
  }],
  analytics: {
    totalExecutions: {
      type: Number,
      default: 0
    },
    successfulExecutions: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastExecuted: Date,
    averageExecutionTime: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Workflow Execution Model
```javascript
const workflowExecutionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  visitorId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed', 'canceled'],
    default: 'running'
  },
  triggerData: mongoose.Schema.Types.Mixed,
  executionPath: [String],
  results: [{
    nodeId: String,
    status: {
      type: String,
      enum: ['success', 'failed', 'skipped']
    },
    output: mongoose.Schema.Types.Mixed,
    executionTime: Number,
    error: String
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  totalExecutionTime: Number
});
```

## 🔄 Workflow Execution Engine

### Execution Flow
```javascript
class WorkflowExecutor {
  constructor(workflow, visitorData) {
    this.workflow = workflow;
    this.visitorData = visitorData;
    this.executionContext = new Map();
    this.executionPath = [];
  }

  async execute() {
    try {
      // Check if workflow should execute
      if (!this.shouldExecute()) {
        return { status: 'skipped', reason: 'conditions_not_met' };
      }

      // Execute trigger node
      const triggerResult = await this.executeNode(this.workflow.trigger);
      if (!triggerResult.success) {
        return { status: 'failed', reason: 'trigger_failed' };
      }

      // Execute workflow nodes
      const nodeResults = await this.executeNodes();
      
      // Execute actions
      const actionResults = await this.executeActions();

      return {
        status: 'completed',
        triggerResult,
        nodeResults,
        actionResults,
        executionPath: this.executionPath
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        executionPath: this.executionPath
      };
    }
  }

  async executeNode(node) {
    const startTime = Date.now();
    
    try {
      const nodeHandler = this.getNodeHandler(node.type);
      const result = await nodeHandler.execute(node, this.executionContext);
      
      this.executionPath.push(node.id);
      
      return {
        nodeId: node.id,
        status: 'success',
        output: result,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        nodeId: node.id,
        status: 'failed',
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }
}
```

### Node System
```javascript
// Base Node Class
class BaseNode {
  constructor(config) {
    this.config = config;
  }

  async execute(context) {
    throw new Error('execute method must be implemented');
  }

  validate() {
    return true;
  }
}

// Trigger Node
class TriggerNode extends BaseNode {
  async execute(context) {
    const { triggerType, conditions } = this.config;
    
    switch (triggerType) {
      case 'pageview':
        return this.handlePageview(context);
      case 'click':
        return this.handleClick(context);
      case 'scroll':
        return this.handleScroll(context);
      case 'exit_intent':
        return this.handleExitIntent(context);
      case 'custom':
        return this.handleCustomEvent(context);
      default:
        throw new Error(`Unknown trigger type: ${triggerType}`);
    }
  }

  async handlePageview(context) {
    const { page, referrer } = context;
    
    // Check conditions
    for (const condition of this.config.conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    
    return true;
  }

  evaluateCondition(condition, context) {
    const { field, operator, value } = condition;
    const fieldValue = this.getFieldValue(field, context);
    
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'contains':
        return fieldValue.includes(value);
      case 'greater_than':
        return fieldValue > value;
      case 'less_than':
        return fieldValue < value;
      case 'regex':
        return new RegExp(value).test(fieldValue);
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      default:
        return false;
    }
  }
}
```

## 🎯 Action System

### Action Types
```javascript
// Modal Action
class ModalAction extends BaseAction {
  async execute(context) {
    const { title, content, position, style } = this.config;
    
    return {
      type: 'modal',
      data: {
        title,
        content,
        position: position || 'center',
        style: style || 'default'
      }
    };
  }
}

// Email Action
class EmailAction extends BaseAction {
  async execute(context) {
    const { to, subject, template, variables } = this.config;
    
    // Queue email job
    await this.queue.add('send-email', {
      to,
      subject,
      template,
      variables,
      context
    });
    
    return {
      type: 'email',
      status: 'queued',
      jobId: this.queue.jobs.length
    };
  }
}

// Webhook Action
class WebhookAction extends BaseAction {
  async execute(context) {
    const { url, method, headers, body, timeout } = this.config;
    
    try {
      const response = await fetch(url, {
        method: method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(this.interpolateBody(body, context)),
        timeout: timeout || 10000
      });
      
      return {
        type: 'webhook',
        status: 'success',
        response: {
          status: response.status,
          statusText: response.statusText
        }
      };
    } catch (error) {
      return {
        type: 'webhook',
        status: 'failed',
        error: error.message
      };
    }
  }
}
```

## 📊 Queue Management

### Redis Queue Setup
```javascript
const Queue = require('bull');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

// Create queues
const workflowQueue = new Queue('workflow-execution', {
  redis: {
    host: redis.options.host,
    port: redis.options.port,
    password: redis.options.password
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

const actionQueue = new Queue('action-execution', {
  redis: {
    host: redis.options.host,
    port: redis.options.port,
    password: redis.options.password
  }
});

// Process workflow jobs
workflowQueue.process(async (job) => {
  const { workflowId, visitorData } = job.data;
  
  try {
    const workflow = await Workflow.findById(workflowId);
    const executor = new WorkflowExecutor(workflow, visitorData);
    const result = await executor.execute();
    
    // Update execution record
    await WorkflowExecution.findByIdAndUpdate(job.data.executionId, {
      status: result.status,
      results: result.results,
      completedAt: new Date(),
      totalExecutionTime: result.totalExecutionTime
    });
    
    return result;
  } catch (error) {
    throw error;
  }
});

// Process action jobs
actionQueue.process(async (job) => {
  const { actionType, config, context } = job.data;
  
  try {
    const actionHandler = getActionHandler(actionType);
    const result = await actionHandler.execute(config, context);
    
    return result;
  } catch (error) {
    throw error;
  }
});
```

## 🌐 API Endpoints

### Workflow Management
```javascript
// GET /api/v1/workflows
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { siteId, status, type, page = 1, limit = 20 } = req.query;
    
    const filter = { siteId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const workflows = await Workflow.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Workflow.countDocuments(filter);
    
    res.json({
      success: true,
      data: workflows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// POST /api/v1/workflows
router.post('/', authenticateToken, validateWorkflow, async (req, res) => {
  try {
    const workflowData = {
      ...req.body,
      siteId: req.body.siteId
    };
    
    const workflow = await Workflow.create(workflowData);
    
    res.status(201).json({
      success: true,
      data: { workflow }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});
```

### Workflow Execution
```javascript
// POST /api/v1/workflows/execute
router.post('/execute', async (req, res) => {
  try {
    const { workflowId, visitorData } = req.body;
    
    // Add to execution queue
    const job = await workflowQueue.add({
      workflowId,
      visitorData,
      executionId: generateId()
    });
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: 'queued'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// GET /api/v1/workflows/:id/activity
router.get('/:id/activity', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const executions = await WorkflowExecution.find({ workflowId: id })
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await WorkflowExecution.countDocuments({ workflowId: id });
    
    res.json({
      success: true,
      data: executions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});
```

## 📋 Workflow Templates

### Template System
```javascript
const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['ecommerce', 'lead_generation', 'onboarding', 'retention', 'conversion'],
    required: true
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnail: String,
  workflow: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  usage: {
    downloads: {
      type: Number,
      default: 0
    },
    ratings: [{
      userId: mongoose.Schema.Types.ObjectId,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    averageRating: {
      type: Number,
      default: 0
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Popular Templates
```javascript
// Welcome Popup Template
const welcomePopupTemplate = {
  name: 'Welcome Popup',
  description: 'Show a welcome popup to new visitors',
  category: 'onboarding',
  tags: ['popup', 'welcome', 'onboarding'],
  difficulty: 'beginner',
  workflow: {
    trigger: {
      type: 'pageview',
      conditions: [
        {
          field: 'page',
          operator: 'equals',
          value: '/'
        }
      ],
      delay: 2000
    },
    actions: [
      {
        type: 'modal',
        config: {
          title: 'Welcome to Our Site!',
          content: 'Thanks for visiting. Get 10% off your first order!',
          position: 'center',
          style: 'welcome'
        }
      }
    ]
  }
};

// Cart Abandonment Template
const cartAbandonmentTemplate = {
  name: 'Cart Abandonment Recovery',
  description: 'Recover abandoned carts with email sequences',
  category: 'ecommerce',
  tags: ['cart', 'abandonment', 'email', 'recovery'],
  difficulty: 'intermediate',
  workflow: {
    trigger: {
      type: 'custom',
      conditions: [
        {
          field: 'event',
          operator: 'equals',
          value: 'cart_abandoned'
        }
      ]
    },
    actions: [
      {
        type: 'delay',
        config: {
          duration: 3600000 // 1 hour
        }
      },
      {
        type: 'email',
        config: {
          template: 'cart_abandonment_1',
          subject: 'Your cart is waiting for you!',
          variables: {
            customerName: '{{customer.name}}',
            cartItems: '{{cart.items}}'
          }
        }
      }
    ]
  }
};
```

## 🧪 Testing

### Unit Tests
```javascript
describe('Workflow Execution', () => {
  it('should execute workflow with valid trigger', async () => {
    const workflow = createTestWorkflow();
    const visitorData = {
      page: '/',
      referrer: 'https://google.com'
    };
    
    const executor = new WorkflowExecutor(workflow, visitorData);
    const result = await executor.execute();
    
    expect(result.status).toBe('completed');
    expect(result.executionPath).toContain('trigger-1');
  });
  
  it('should skip workflow when conditions not met', async () => {
    const workflow = createTestWorkflow();
    const visitorData = {
      page: '/about',
      referrer: 'https://google.com'
    };
    
    const executor = new WorkflowExecutor(workflow, visitorData);
    const result = await executor.execute();
    
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('conditions_not_met');
  });
});
```

### Integration Tests
```javascript
describe('Workflow API', () => {
  let authToken;
  let siteId;
  
  beforeEach(async () => {
    const user = await createTestUser();
    const site = await createTestSite(user._id);
    authToken = generateTestToken(user);
    siteId = site._id;
  });
  
  it('should create workflow for authenticated user', async () => {
    const workflowData = {
      name: 'Test Workflow',
      siteId: siteId.toString(),
      trigger: {
        type: 'pageview',
        conditions: []
      },
      actions: []
    };
    
    const response = await request(app)
      .post('/api/v1/workflows')
      .set('Authorization', `Bearer ${authToken}`)
      .send(workflowData)
      .expect(201);
    
    expect(response.body.data.workflow.siteId).toBe(siteId.toString());
    expect(response.body.data.workflow.name).toBe(workflowData.name);
  });
});
```

## 📊 Monitoring & Analytics

### Performance Metrics
```javascript
// Workflow Performance Tracking
const trackWorkflowPerformance = async (workflowId, executionTime, success) => {
  try {
    const workflow = await Workflow.findById(workflowId);
    
    if (workflow) {
      const analytics = workflow.analytics;
      analytics.totalExecutions += 1;
      
      if (success) {
        analytics.successfulExecutions += 1;
      }
      
      analytics.conversionRate = (analytics.successfulExecutions / analytics.totalExecutions) * 100;
      analytics.lastExecuted = new Date();
      
      // Update average execution time
      const totalTime = analytics.averageExecutionTime * (analytics.totalExecutions - 1) + executionTime;
      analytics.averageExecutionTime = totalTime / analytics.totalExecutions;
      
      await workflow.save();
    }
  } catch (error) {
    console.error('Error tracking workflow performance:', error);
  }
};
```

### Health Monitoring
```javascript
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    // Check Redis connection
    await redis.ping();
    
    // Check queue status
    const workflowQueueStatus = await workflowQueue.getJobCounts();
    const actionQueueStatus = await actionQueue.getJobCounts();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      redis: 'connected',
      queues: {
        workflow: workflowQueueStatus,
        action: actionQueueStatus
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

## 🚀 Deployment

### Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

### Environment Variables
```bash
# Production environment
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/seentics_workflows
REDIS_URL=redis://redis:6379
JWT_SECRET=production-secret-key
API_GATEWAY_URL=http://api-gateway:8080
```

## 📚 Additional Resources

- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [System Architecture](./SYSTEM_ARCHITECTURE_OVERVIEW.md)
- [Contributing Guide](../CONTRIBUTING.md)
