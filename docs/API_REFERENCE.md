
# Seentics API Reference

Complete API documentation for the Seentics analytics and automation platform.

## 🔗 Base URLs

All API requests go through the API Gateway:

- **Production**: `https://your-domain.com/api/v1`
- **Development**: `http://localhost:8080/api/v1`

### Service Endpoints (Direct Access)
- **Users Service**: `http://localhost:3001/api/v1`
- **Analytics Service**: `http://localhost:3002/api/v1`
- **Workflows Service**: `http://localhost:3003/api/v1`

## 🔐 Authentication

### JWT Token Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### API Key Authentication (Public Endpoints)
Some tracking endpoints support API key authentication:

```http
X-API-Key: <your-api-key>
```

## 🚀 Quick Start

### 1. Register a User
```bash
curl -X POST http://localhost:8080/api/v1/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

### 2. Login and Get Token
```bash
curl -X POST http://localhost:8080/api/v1/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 3. Create a Website
```bash
curl -X POST http://localhost:8080/api/v1/user/websites \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website",
    "url": "https://mywebsite.com"
  }'
```

## 👤 Authentication API

### Register User
**POST** `/api/v1/user/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-12-19T10:00:00Z"
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token"
    }
  }
}
```

### Login User
**POST** `/api/v1/user/auth/login`

Authenticate user and receive JWT tokens.

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
      "name": "John Doe"
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token"
    }
  }
}
```

### Google OAuth
**POST** `/api/v1/user/auth/google`

Authenticate with Google OAuth.

**Request Body:**
```json
{
  "token": "google_oauth_token"
}
```

### Get Current User
**GET** `/api/v1/user/auth/me`

Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "plan": "free",
      "createdAt": "2024-12-19T10:00:00Z"
    }
  }
}
```

## 🌐 Website Management API

### Get User Websites
**GET** `/api/v1/user/websites`

Get all websites for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "websites": [
      {
        "id": "website_id",
        "name": "My Website",
        "url": "https://mywebsite.com",
        "siteId": "site_id",
        "isActive": true,
        "isVerified": false,
        "createdAt": "2024-12-19T10:00:00Z"
      }
    ]
  }
}
```

### Create Website
**POST** `/api/v1/user/websites`

Create a new website for tracking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "My Website",
  "url": "https://mywebsite.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Website created successfully",
  "data": {
    "website": {
      "id": "website_id",
      "name": "My Website",
      "url": "https://mywebsite.com",
      "siteId": "generated_site_id",
      "verificationToken": "verification_token",
      "isActive": true,
      "createdAt": "2024-12-19T10:00:00Z"
    }
  }
}
```

### Update Website
**PUT** `/api/v1/user/websites/:id`

Update website information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Website Name",
  "url": "https://updated-website.com"
}
```

### Delete Website
**DELETE** `/api/v1/user/websites/:id`

Delete a website and all associated data.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Website deleted successfully"
}
```

## 📊 Analytics API

### Track Single Event
**POST** `/api/v1/analytics/event` (Public)

Track a single analytics event.

**Request Body:**
```json
{
  "websiteId": "website_id",
  "visitorId": "unique_visitor_id",
  "eventType": "pageview",
  "eventName": "page_view",
  "pageUrl": "https://mywebsite.com/page",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "properties": {
    "custom_property": "value"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "eventId": "event_id",
  "processedAt": 1640000000
}
```

### Track Batch Events
**POST** `/api/v1/analytics/event/batch` (Public)

Track multiple events in a single request.

**Request Body:**
```json
{
  "siteId": "site_id",
  "events": [
    {
      "visitorId": "visitor_1",
      "eventType": "pageview",
      "eventName": "page_view",
      "pageUrl": "https://mywebsite.com/home"
    },
    {
      "visitorId": "visitor_2",
      "eventType": "click",
      "eventName": "button_click",
      "properties": {
        "button_name": "signup"
      }
    }
  ]
}
```

### Get Dashboard Data
**GET** `/api/v1/analytics/dashboard/:websiteId`

Get comprehensive dashboard analytics.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `period` (optional): Predefined period (7d, 30d, 90d)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPageviews": 15420,
      "uniqueVisitors": 8350,
      "averageSessionDuration": 180,
      "bounceRate": 0.35
    },
    "topPages": [
      {
        "url": "/home",
        "pageviews": 5420,
        "uniquePageviews": 3200
      }
    ],
    "trafficSources": [
      {
        "source": "google",
        "visitors": 3200,
        "percentage": 38.3
      }
    ]
  }
}
```

### Get Top Pages
**GET** `/api/v1/analytics/top-pages/:websiteId`

Get most visited pages with metrics.

**Headers:** `Authorization: Bearer <token>`

### Get Hourly Statistics
**GET** `/api/v1/analytics/hourly-stats/:websiteId`

Get hourly breakdown of website traffic.

**Headers:** `Authorization: Bearer <token>`

### Get Funnel Analytics
**GET** `/api/v1/analytics/funnel-analytics/:websiteId`

Get conversion funnel performance data.

**Headers:** `Authorization: Bearer <token>`

## 🔄 Workflow API

### Get Active Workflows
**GET** `/api/v1/workflows/active` (Public)

Get active workflows for a website (used by tracking scripts).

**Query Parameters:**
- `website_id`: Website ID to get workflows for

**Response:**
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "workflow_id",
        "name": "Exit Intent Modal",
        "triggers": [
          {
            "type": "exit_intent",
            "conditions": []
          }
        ],
        "actions": [
          {
            "type": "show_modal",
            "config": {
              "title": "Wait! Don't leave yet",
              "content": "Get 10% off your first order"
            }
          }
        ]
      }
    ]
  }
}
```

### Execute Workflow Action
**POST** `/api/v1/workflows/execution/action` (Public)

Execute a workflow action (triggered by tracking scripts).

**Request Body:**
```json
{
  "workflowId": "workflow_id",
  "actionId": "action_id",
  "visitorId": "visitor_id",
  "websiteId": "website_id",
  "context": {
    "pageUrl": "https://mywebsite.com/page",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Get User Workflows
**GET** `/api/v1/workflows`

Get all workflows for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

### Create Workflow
**POST** `/api/v1/workflows`

Create a new workflow.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Exit Intent Modal",
  "websiteId": "website_id",
  "triggers": [
    {
      "type": "exit_intent",
      "conditions": [
        {
          "type": "url_contains",
          "value": "/product"
        }
      ]
    }
  ],
  "actions": [
    {
      "type": "show_modal",
      "config": {
        "title": "Special Offer!",
        "content": "Get 10% off before you leave",
        "buttonText": "Get Discount"
      }
    }
  ]
}
```

### Get Workflow Analytics
**GET** `/api/v1/workflows/:id/analytics`

Get performance analytics for a specific workflow.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTriggers": 1250,
      "totalCompletions": 890,
      "conversionRate": 0.712
    },
    "nodeStats": {
      "trigger_1": {
        "executions": 1250,
        "successRate": 1.0
      },
      "action_1": {
        "executions": 890,
        "successRate": 0.95
      }
    }
  }
}
```

## 🎯 Funnel API

### Get Active Funnels
**GET** `/api/v1/funnels/active` (Public)

Get active conversion funnels for a website.

**Query Parameters:**
- `website_id`: Website ID to get funnels for

### Track Funnel Event
**POST** `/api/v1/funnels/track` (Public)

Track a funnel conversion event.

**Request Body:**
```json
{
  "websiteId": "website_id",
  "visitorId": "visitor_id",
  "funnelId": "funnel_id",
  "stepId": "step_id",
  "eventType": "step_completed",
  "properties": {
    "value": 99.99,
    "currency": "USD"
  }
}
```

## 🔒 Error Responses

### Authentication Errors
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### Validation Errors
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

### Rate Limiting
```json
{
  "success": false,
  "error": "Rate Limit Exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

## 📝 Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## 🔧 SDK Examples

### JavaScript/Node.js
```javascript
const SeenticsAPI = {
  baseURL: 'http://localhost:8080/api/v1',
  token: null,
  
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/user/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    this.token = data.data.tokens.access_token;
    return data;
  },
  
  async trackEvent(websiteId, visitorId, eventData) {
    return fetch(`${this.baseURL}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteId,
        visitorId,
        ...eventData
      })
    });
  },
  
  async getDashboard(websiteId) {
    const response = await fetch(`${this.baseURL}/analytics/dashboard/${websiteId}`, {
      headers: { 
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
```

### Python
```python
import requests

class SeenticsAPI:
    def __init__(self, base_url='http://localhost:8080/api/v1'):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f'{self.base_url}/user/auth/login', json={
            'email': email,
            'password': password
        })
        data = response.json()
        self.token = data['data']['tokens']['access_token']
        return data
    
    def track_event(self, website_id, visitor_id, event_data):
        return requests.post(f'{self.base_url}/analytics/event', json={
            'websiteId': website_id,
            'visitorId': visitor_id,
            **event_data
        })
    
    def get_dashboard(self, website_id):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(f'{self.base_url}/analytics/dashboard/{website_id}', headers=headers)
        return response.json()
```

---

**Need help?** Check out our [GitHub repository](https://github.com/seentics/seentics) or [open an issue](https://github.com/seentics/seentics/issues).

---

## 🔄 Additional Authentication Endpoints

### Refresh Token
**POST** `/api/v1/user/auth/refresh`
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
