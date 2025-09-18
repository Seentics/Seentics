# Seentics - Intelligent Website Automation Platform

[![License: AGPL](https://img.shields.io/badge/License-AGPL-yellow.svg)](https://opensource.org/licenses/AGPL-3.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Contributors](https://img.shields.io/badge/Contributors-0-brightgreen.svg)](https://github.com/seentics/seentics/graphs/contributors)

Seentics is an open-source, microservices-based platform for creating intelligent, automated workflows that respond to user behavior in real-time. It combines a visual workflow builder, high-performance analytics, and scalable automation capabilities.

## 🌟 **MVP Features**

### 🎯 **Simple Workflow Builder**
- **Drag-and-Drop Interface**: Intuitive node-based workflow creation
- **Essential Triggers**: Page views, element clicks, funnel events, time spent, exit intent
- **Basic Conditions**: URL path, traffic source, new vs returning visitors, device type
- **Core Actions**: Show modals, show banners, track events, webhooks, URL redirects
- **Real-time Preview**: See workflow structure as you build

### 📊 **Basic Analytics**
- **Event Tracking**: Simple page views and custom event tracking
- **Workflow Analytics**: Basic workflow performance metrics
- **Visitor Tracking**: Anonymous visitor identification and session tracking

### ⚡ **Essential Automation**
- **Instant Actions**: Fast response to user behavior triggers
- **Client-Side Actions**: Modals, banners, redirects
- **Server-Side Actions**: Webhooks, event tracking
- **Simple Execution**: Streamlined workflow processing

## 🏗️ **System Architecture**

Seentics follows a **microservices architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SEENTICS PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   Frontend      │    │   tracker.js    │    │  Mobile Apps    │             │
│  │   (Next.js)     │    │   (Vanilla JS)  │    │   (Future)      │             │
│  └─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘             │
│            │                      │                      │                     │
│            └──────────────────────┼──────────────────────┘                     │
│                                   │                                            │
├───────────────────────────────────┼────────────────────────────────────────────┤
│                                   ▼                                            │
│                        ┌─────────────────┐                                     │
│                        │   API GATEWAY   │                                     │
│                        │   (Go/Gin)      │                                     │
│                        │   Port: 8080    │                                     │
│                        └─────────┬───────┘                                     │
│                                  │                                             │
│    ┌─────────────────────────────┼─────────────────────────────┐                │
│    │                             │                             │                │
│    ▼                             ▼                             ▼                │
│ ┌─────────────┐            ┌─────────────┐            ┌─────────────┐           │
│ │USER SERVICE │            │ ANALYTICS   │            │ WORKFLOWS   │           │
│ │ (Node.js)   │            │ SERVICE     │            │ SERVICE     │           │
│ │ Port: 3001  │            │ (Go)        │            │ (Node.js)   │           │
│ │             │            │ Port: 3002  │            │ Port: 8083  │           │
│ │ - Auth      │            │             │            │             │           │
│ │ - Users     │            │ - Events    │            │ - Execution │           │
│ │ - Websites  │            │ - Metrics   │            │ - Activity  │           │
│ │ - Billing   │            │ - Reports   │            │             │           │
│ └─────────────┘            └─────────────┘            └─────────────┘           │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              DATA LAYER                                        │
│                                                                                 │
│ ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐    │
│ │  MongoDB    │     │TimescaleDB  │     │  MongoDB    │     │   Redis     │    │
│ │             │     │             │     │             │     │             │    │
│ │ Users       │     │ Events      │     │ Workflows   │     │ Cache       │    │
│ │ Websites    │     │ Sessions    │     │ Activity    │     │ Queues      │    │
│ │ Billing     │     │ Analytics   │     │             │     │ Sessions    │    │
│ └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### **Service Breakdown**

| Service | Technology | Port | Purpose |
|---------|------------|------|---------|
| **API Gateway** | Go/Gin | 8080 | Request routing, auth, caching, rate limiting |
| **User Service** | Node.js/Express | 3001 | Authentication, user management, billing |
| **Analytics Service** | Go | 3002 | Event tracking, analytics, reporting |
| **Workflows Service** | Node.js/Express | 8083 | Workflow management, execution, automation |
| **Frontend** | Next.js/React | 3000 | User interface and dashboard |

### **Data Storage**

| Database | Purpose | Data Type |
|----------|---------|-----------|
| **MongoDB** | User accounts, websites, workflows | Document storage |
| **TimescaleDB** | Analytics events, metrics | Time-series data |
| **Redis** | Caching, queues, sessions | In-memory storage |

## 🚀 **Quick Start**

### **⚡ One-Command Setup (Recommended)**
```bash
# Clone and start everything in one go
git clone https://github.com/seentics/seentics.git && cd seentics && cp .env.example .env && docker compose up -d
```

Then access the application at:
- **Frontend**: [http://localhost:3000](http://localhost:3000) *(start separately - see below)*
- **API Gateway**: [http://localhost:8080](http://localhost:8080)

### **Frontend Setup** (Additional step)
```bash
# In a new terminal
cd frontend && npm install && npm run dev
```

---

### **Manual Setup (Alternative)**

#### **Prerequisites**
- **Node.js** 18+ 
- **Go** 1.21+
- **Docker** & Docker Compose
- **Git**

#### **1. Clone the Repository**
```bash
git clone https://github.com/seentics/seentics.git
cd seentics
```

### **2. Start Infrastructure Services**
```bash
# Start databases and Redis
docker compose up -d mongodb timescaledb redis

# Wait for services to be ready (check with docker compose ps)
```

### **3. Configure Environment Variables**
```bash
# Copy environment templates
cp env.example .env
cp frontend/env.example frontend/.env.local

# Edit .env files with your configuration
# See Configuration section below for required variables
```

### **4. Start All Services**
```bash
# Option 1: Start all services with Docker Compose (Recommended)
docker compose up -d

# Option 2: Start services individually
cd services/users && npm install && npm run dev
cd services/analytics && go mod tidy && go run main.go
cd services/workflows && npm install && npm run dev
```

### **5. Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

### **6. Access the Application**
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)
- **User Service**: [http://localhost:3001](http://localhost:3001)
- **Analytics Service**: [http://localhost:3002](http://localhost:3002)
- **Workflows Service**: [http://localhost:8083](http://localhost:8083)

## ⚙️ **Configuration**

### **Environment Variables**

#### **API Gateway** (`.env`)
```bash
PORT=8080
USER_SERVICE_URL=http://user-service:3001
ANALYTICS_SERVICE_URL=http://analytics-service:3002
WORKFLOW_SERVICE_URL=http://workflows-service:8083
JWT_SECRET=your-secure-jwt-secret
RATE_LIMIT_PER_MINUTE=100
CACHE_TTL=300
```

#### **User Service** (`.env`)
```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/seentics_users
JWT_SECRET=your-secure-jwt-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GITHUB_CLIENT_ID=your-github-oauth-client-id
# Removed: Commercial billing integration
```

#### **Analytics Service** (`.env`)
```bash
PORT=3002
DATABASE_URL=postgresql://user:pass@localhost:5432/analytics
BATCH_SIZE=1000
BATCH_TIMEOUT=5s
WORKER_COUNT=10
LOG_LEVEL=info
```

#### **Workflows Service** (`.env`)
```bash
PORT=8083
MONGODB_URI=mongodb://localhost:27017/seentics_workflows
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secure-jwt-secret
```

### **Database Setup**
```bash
# MongoDB (Users & Workflows)
docker run -d --name mongodb -p 27017:27017 mongo:latest

# TimescaleDB (Analytics)
docker run -d --name timescaledb -p 5432:5432 \
  -e POSTGRES_DB=analytics \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=pass \
  timescale/timescaledb:latest-pg15

# Redis (Caching & Queues)
docker run -d --name redis -p 6379:6379 redis:latest
```

## 📚 **API Overview**

### **Public Endpoints** (No Authentication Required)
```
GET  /api/v1/workflows/site/:siteId/active    - Get active workflows for a site
POST /api/v1/events/track                     - Track website events
POST /api/v1/events/track/batch               - Batch event tracking
```

### **Authenticated Endpoints** (JWT Required)
```
# User Management
GET  /api/v1/auth/me                          - Get current user
POST /api/v1/auth/login                        - User login
POST /api/v1/auth/register                     - User registration

# Website Management
GET  /api/v1/websites                          - Get user websites
POST /api/v1/websites                          - Create website

# Analytics
GET  /api/v1/analytics/:websiteId/dashboard    - Dashboard data
GET  /api/v1/analytics/:websiteId/realtime     - Real-time analytics

# Workflows
GET  /api/v1/workflows                         - Get workflows
POST /api/v1/workflows                         - Create workflow
```

### **Webhook Endpoints**
```
# Removed: Commercial webhook endpoints
```

## 🔧 **Development Workflow**

### **Local Development**
1. **Start Infrastructure**: `docker compose up -d`
2. **Start Services**: Each service can be run individually for development
3. **Frontend Development**: Next.js with hot reloading
4. **API Testing**: Use Postman or curl for API testing

### **Testing**
```bash
# Run all tests
npm run test

# Run specific service tests
cd services/users && npm test
cd services/analytics && go test ./...
cd services/workflows && npm test

# Frontend tests
cd frontend && npm test
```

### **Code Quality**
- **ESLint** for JavaScript/TypeScript
- **Go fmt** and **golangci-lint** for Go
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

## 📊 **Performance & Monitoring**

### **Health Checks**
- **Service Health**: `/health` endpoint on each service
- **Readiness Checks**: `/ready` endpoint for deployment readiness
- **Metrics**: Prometheus metrics on `/metrics` endpoints

### **Performance Metrics**
- **Event Processing**: 10,000+ events/second
- **API Response Time**: <100ms for cached responses
- **Dashboard Load Time**: <2 seconds for 30-day analytics
- **Real-time Updates**: <5 second refresh intervals

### **Monitoring Tools**
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard visualization
- **Jaeger**: Distributed tracing
- **ELK Stack**: Log aggregation

## 🚀 **Deployment**

### **Production Deployment**
```bash
# Build Docker images
docker compose -f docker-compose.prod.yml build

# Deploy to production
docker compose -f docker-compose.prod.yml up -d

# Scale services
docker compose -f docker-compose.prod.yml up -d --scale analytics-service=3
```

### **Environment-Specific Configs**
- **Development**: `docker-compose.yml`
- **Staging**: `docker-compose.staging.yml`
- **Production**: `docker-compose.prod.yml`

### **Kubernetes Deployment**
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n seentics
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### **Ways to Contribute**
- 🐛 **Report Bugs**: Create detailed bug reports
- 💡 **Suggest Features**: Propose new functionality
- 📝 **Improve Docs**: Enhance documentation
- 🔧 **Code Changes**: Submit pull requests
- 🧪 **Write Tests**: Add test coverage
- 🌍 **Localization**: Help with translations

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📚 **Documentation**

- [**System Architecture**](./docs/SYSTEM_ARCHITECTURE_OVERVIEW.md) - Complete system overview
- [**Analytics Service**](./docs/ANALYTICS_SERVICE.md) - Analytics service documentation
- [**API Reference**](./docs/API_REFERENCE.md) - API endpoints and usage
- [**Features Guide**](./docs/features.md) - Detailed feature descriptions
- [**User Management**](./docs/USER_MANAGEMENT_MICROSERVICE.md) - User service details
- [**Workflow Engine**](./docs/WORKFLOW_ENGINE_MICROSERVICE.md) - Workflow service details

## 🆘 **Support & Community**

- 📖 [**Documentation**](./docs/) - Comprehensive guides
- 🐛 [**Issues**](https://github.com/seentics/seentics/issues) - Bug reports and feature requests
- 💬 [**Discussions**](https://github.com/seentics/seentics/discussions) - Community discussions
- 📧 [**Email Support**](mailto:support@seentics.com) - Direct support
- 🐦 [**Twitter**](https://twitter.com/seentics) - Latest updates

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## ⭐ **Star History**

If you find this project helpful, please give it a star! ⭐

---

**Built with ❤️ by the Seentics community**

*Seentics - Making websites intelligent, one workflow at a time.*
# Seentics
