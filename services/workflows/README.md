# Seentics Workflows Service

A focused Node.js microservice for managing website automation workflows and workflow-specific analytics in the Seentics platform.

## Features

- **Workflow Management**: Complete CRUD operations for workflows
- **Real-time Execution**: Process workflow triggers and actions
- **Workflow Analytics**: Workflow-specific performance metrics and tracking
- **Activity Logging**: Detailed workflow execution logs
- **Performance Charts**: Monthly/daily workflow performance visualization
- **Node Analytics**: Individual node performance tracking
- **Queue System**: Scalable job processing with Redis/Bull
- **MongoDB Integration**: Robust data persistence with MongoDB
- **Security**: JWT authentication and rate limiting

## Architecture

- **Express.js**: RESTful API server
- **MongoDB + Mongoose**: Database and ODM
- **Redis + Bull**: Queue management for scalable processing
- **Winston**: Structured logging
- **Joi**: Data validation

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Configure your MongoDB and Redis credentials in `.env`
5. Start the service:
   ```bash
   npm run dev
   ```

## API Endpoints

### Workflows
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows` - Get all workflows
- `GET /api/v1/workflows/:id` - Get specific workflow
- `PUT /api/v1/workflows/:id` - Update workflow
- `DELETE /api/v1/workflows/:id` - Delete workflow
- `GET /api/v1/workflows/:id/analytics` - Get workflow analytics
- `GET /api/v1/workflows/:id/activity` - Get workflow activity log
- `GET /api/v1/workflows/:id/chart` - Get workflow performance chart
- `GET /api/v1/workflows/:id/nodes` - Get workflow node performance

### Workflow Analytics
- `POST /api/v1/analytics/track` - Track workflow event
- `GET /api/v1/analytics/workflow/:workflowId` - Get workflow analytics
- `GET /api/v1/analytics/workflow/:workflowId/activity` - Get workflow activity
- `GET /api/v1/analytics/workflow/:workflowId/chart` - Get performance chart
- `GET /api/v1/analytics/workflow/:workflowId/nodes` - Get node performance
- `GET /api/v1/analytics/workflows/summary` - Get workflow summaries

### Execution
- `POST /api/v1/execution/action` - Execute workflow action
- `GET /api/v1/execution/status/:jobId` - Get execution status
- `GET /api/v1/execution/logs/:workflowId` - Get execution logs

### Health
- `GET /health` - Health check endpoint

## Environment Variables

See `.env.example` for required environment variables.

## Data Structure

The service focuses on workflow data and workflow-specific analytics:

```javascript
{
  id: "workflow-id",
  name: "Workflow Name",
  status: "Active",
  siteId: "site-id",
  totalTriggers: 150,
  totalCompletions: 45,
  completionRate: "30.0%",
  nodes: [
    {
      id: "node-1",
      type: "custom",
      position: { x: 100, y: 100 },
      data: {
        iconName: "MousePointer",
        title: "Exit Intent",
        type: "Trigger",
        color: "hsl(var(--chart-1))",
        settings: {}
      }
    }
  ],
  edges: [
    {
      id: "edge-1",
      source: "node-1",
      target: "node-2"
    }
  ]
}
```

## Queue System

The service uses Redis and Bull for processing:

- **workflow execution**: Handles server-side action execution
- **workflow analytics**: Processes workflow-specific tracking events

## Logging

Winston is configured for structured logging:
- Development: Console output with colors
- Production: JSON format to files

## Security

- JWT authentication with configurable secret
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation with Joi

## Development

```bash
# Start in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Deployment

1. Set production environment variables
2. Configure MongoDB connection string
3. Configure Redis instance
4. Deploy to your container platform
5. Set up health check monitoring on `/health`

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use conventional commits