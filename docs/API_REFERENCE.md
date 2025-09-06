
# API Reference

This document provides comprehensive API reference for all Seentics services.

## 🔗 Base URLs

- **API Gateway**: `http://localhost:8080/api/v1`
- **Users Service**: `http://localhost:3001/api/v1`
- **Analytics Service**: `http://localhost:3002/api/v1`
- **Workflows Service**: `http://localhost:3003/api/v1`

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## 📊 Users Service API

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-12-19T10:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST `/api/v1/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### POST `/api/v1/auth/refresh`
Refresh JWT token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST `/api/v1/auth/logout`
Logout user and invalidate tokens.

### User Management Endpoints

#### GET `/api/v1/user/profile`
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

#### PUT `/api/v1/user/profile`
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com"
}
```

#### DELETE `/api/v1/user/account`
Delete user account.

**Headers:** `Authorization: Bearer <token>`

### Website Management Endpoints

#### GET `/api/v1/websites`
Get all websites for current user.

**Headers:** `Authorization: Bearer <token>`

#### POST `/api/v1/websites`
Create a new website.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "My Website",
  "domain": "example.com",
  "description": "My awesome website"
}
```

#### GET `/api/v1/websites/:id`
Get website details.

**Headers:** `Authorization: Bearer <token>`

#### PUT `/api/v1/websites/:id`
Update website.

**Headers:** `Authorization: Bearer <token>`

#### DELETE `/api/v1/websites/:id`
Delete website.

**Headers:** `Authorization: Bearer <token>`

### Subscription Endpoints

#### GET `/api/v1/subscriptions`
Get user subscription status.

**Headers:** `Authorization: Bearer <token>`

#### POST `/api/v1/subscriptions/webhook`
Lemon Squeezy webhook endpoint (internal use).

## 📈 Analytics Service API

### Event Tracking Endpoints

#### POST `/api/v1/analytics/event`
Track general website events.

**Request Body:**
```json
{
  "siteId": "website_id",
  "eventType": "pageview",
  "eventData": {
    "url": "/homepage",
    "referrer": "https://google.com",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2024-12-19T10:00:00Z"
  },
  "sessionId": "session_id",
  "visitorId": "visitor_id"
}
```

#### POST `/api/v1/analytics/event/batch`
Track multiple events in batch.

**Request Body:**
```json
{
  "siteId": "website_id",
  "events": [
    {
      "eventType": "pageview",
      "eventData": {...},
      "timestamp": "2024-12-19T10:00:00Z"
    },
    {
      "eventType": "click",
      "eventData": {...},
      "timestamp": "2024-12-19T10:01:00Z"
    }
  ],
  "sessionId": "session_id",
  "visitorId": "visitor_id"
}
```

### Analytics Dashboard Endpoints

#### GET `/api/v1/analytics/dashboard/:siteId/overview`
Get dashboard overview data.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: Time period (1d, 7d, 30d, 90d)
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

#### GET `/api/v1/analytics/dashboard/:siteId/visitors`
Get visitor analytics.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/v1/analytics/dashboard/:siteId/pages`
Get page analytics.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/v1/analytics/dashboard/:siteId/sources`
Get traffic source analytics.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/v1/analytics/dashboard/:siteId/events`
Get custom event analytics.

**Headers:** `Authorization: Bearer <token>`

### Real-time Endpoints

#### GET `/api/v1/analytics/realtime/:siteId/visitors`
Get real-time visitor count.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/v1/analytics/realtime/:siteId/activity`
Get real-time activity feed.

**Headers:** `Authorization: Bearer <token>`

## 🔄 Workflows Service API

### Workflow Management Endpoints

#### GET `/api/v1/workflows`
Get all workflows for a website.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `siteId`: Website ID
- `status`: Workflow status (active, inactive, draft)
- `type`: Workflow type (trigger, scheduled)

#### POST `/api/v1/workflows`
Create a new workflow.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "siteId": "website_id",
  "name": "Welcome Popup",
  "description": "Show welcome popup to new visitors",
  "trigger": {
    "type": "pageview",
    "conditions": [
      {
        "field": "page",
        "operator": "equals",
        "value": "/"
      }
    ]
  },
  "actions": [
    {
      "type": "modal",
      "config": {
        "title": "Welcome!",
        "content": "Thanks for visiting our site!",
        "position": "center"
      }
    }
  ],
  "status": "active"
}
```

#### GET `/api/v1/workflows/:id`
Get workflow details.

**Headers:** `Authorization: Bearer <token>`

#### PUT `/api/v1/workflows/:id`
Update workflow.

**Headers:** `Authorization: Bearer <token>`

#### DELETE `/api/v1/workflows/:id`
Delete workflow.

**Headers:** `Authorization: Bearer <token>`

#### POST `/api/v1/workflows/:id/duplicate`
Duplicate workflow.

**Headers:** `Authorization: Bearer <token>`

### Workflow Execution Endpoints

#### POST `/api/v1/workflows/execute-action`
Execute a workflow action (internal use).

**Request Body:**
```json
{
  "workflowId": "workflow_id",
  "actionId": "action_id",
  "visitorData": {
    "sessionId": "session_id",
    "visitorId": "visitor_id",
    "page": "/homepage",
    "referrer": "https://google.com"
  }
}
```

#### GET `/api/v1/workflows/:id/activity`
Get workflow execution activity.

**Headers:** `Authorization: Bearer <token>`

### Workflow Templates Endpoints

#### GET `/api/v1/workflows/templates`
Get available workflow templates.

**Headers:** `Authorization: Bearer <token>`

#### POST `/api/v1/workflows/templates/:id/import`
Import workflow from template.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "siteId": "website_id",
  "customizations": {
    "name": "Custom Welcome Popup",
    "actions": [...]
  }
}
```

## 🌐 Public Endpoints

### Tracking Endpoints

#### GET `/api/v1/track`
Get active workflows for a website (called by tracker.js).

**Query Parameters:**
- `siteId`: Website ID
- `origin`: Origin domain for validation

**Response:**
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "workflow_id",
        "name": "Welcome Popup",
        "trigger": {...},
        "actions": [...]
      }
    ]
  }
}
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🚨 Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMITED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

## 🔒 Rate Limiting

- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 1000 requests per minute per user
- **Webhook endpoints**: 10 requests per minute per source

## 📝 Webhooks

### Lemon Squeezy Webhook
**Endpoint:** `POST /api/v1/webhooks/lemon-squeezy`

**Headers:**
- `X-Signature`: HMAC signature for verification

**Request Body:** Lemon Squeezy subscription event data

## 🧪 Testing

### Test Environment
- **Base URL**: `http://localhost:8080/api/v1`
- **Test User**: `test@seentics.com` / `testpassword123`
- **Test Website ID**: `test-website-id`

### Postman Collection
Import the Seentics API collection from the `docs/postman/` directory.

## 📚 Additional Resources

- [System Architecture](./SYSTEM_ARCHITECTURE_OVERVIEW.md)
- [Features Guide](./features.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Contributing Guide](../CONTRIBUTING.md)
