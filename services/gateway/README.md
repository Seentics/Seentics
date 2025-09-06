# Seentics API Gateway

A high-performance Go-based API gateway that provides unified access to all Seentics microservices with intelligent routing, authentication, caching, and rate limiting.

## 🚀 Features

### **Intelligent Routing**
- **Service Discovery**: Routes requests to appropriate microservices
- **Load Balancing**: Distributes traffic across service instances
- **Path-based Routing**: `/api/v1/user/*` → Users Service, `/api/v1/analytics/*` → Analytics Service

### **Security & Authentication**
- **JWT Validation**: Secure token-based authentication
- **Route Protection**: Public, protected, and unprotected route classification
- **Rate Limiting**: Configurable limits per route type and client
- **CORS Protection**: Configurable cross-origin request handling

### **Performance & Caching**
- **Redis Caching**: Intelligent caching for validation and tokens
- **Request Optimization**: Efficient proxy with timeout configuration
- **Cache Warming**: Pre-populate frequently accessed data
- **Performance Monitoring**: Request timing and slow request detection

### **Request Processing**
- **Data Extraction**: Smart extraction of domain and siteId from multiple sources
- **Header Injection**: Adds user and website context for downstream services
- **Validation**: Website ownership and domain validation
- **Metadata Injection**: Adds gateway context to requests

## 🏗️ Architecture

```
Gateway Service
├── Main Router          # HTTP server and route definitions
├── Proxy Layer         # Reverse proxy to microservices
├── Middleware Stack    # Authentication, CORS, rate limiting
├── Cache Layer         # Redis-based caching system
└── Utils               # Helper functions and utilities
```

## 🚀 Quick Start

### Prerequisites
- **Go 1.23+**
- **Redis** for caching and rate limiting
- **Access to all Seentics microservices**

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/seentics/seentics.git
cd services/gateway

# Install dependencies
go mod tidy

# Copy environment configuration
cp .env.example .env
```

### 2. Environment Configuration
Create a `.env` file with the following variables:

```env
# Server Configuration
API_GATEWAY_PORT=8080
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Service URLs
USER_SERVICE_URL=http://localhost:3001
ANALYTICS_SERVICE_URL=http://localhost:3002
WORKFLOW_SERVICE_URL=http://localhost:3003
ADMIN_SERVICE_URL=http://localhost:3004

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:8080

# Rate Limiting
RATE_LIMIT_PUBLIC=1000
RATE_LIMIT_PROTECTED=5000
RATE_LIMIT_AUTH=100
```

### 3. Run the Gateway
```bash
# Development mode
go run .

# Build and run
go build -o gateway .
./gateway

# With Docker
docker build -t seentics-gateway .
docker run -p 8080:8080 seentics-gateway
```

## 🔧 Configuration

### Route Classification

The gateway automatically classifies routes into three types:

#### **Unprotected Routes** (No validation)
- `/` - Health check
- `/api/v1/user/auth/register` - User registration
- `/api/v1/user/auth/login` - User login
- `/api/v1/user/auth/google` - Google OAuth
- `/api/v1/user/auth/github` - GitHub OAuth
- `/api/v1/webhooks/*` - Webhook endpoints
- `/health` - Health check
- `/metrics` - Metrics endpoint

#### **Public Routes** (Domain/siteId validation only)
- `/api/v1/track` - Website tracking
- `/api/v1/analytics/event` - Event tracking
- `/api/v1/analytics/track` - Analytics tracking
- `/api/v1/workflows/site/*` - Public workflow access
- `/api/v1/execution/action` - Action execution
- `/api/v1/funnels/track` - Funnel tracking

#### **Protected Routes** (JWT + website ownership validation)
- `/api/v1/analytics/dashboard/*` - Analytics dashboard
- `/api/v1/workflows/*` - Workflow management
- `/api/v1/websites/*` - Website management
- `/api/v1/user/profile` - User profile
- `/api/v1/admin/*` - Admin operations

### Rate Limiting

| Route Type | Requests/Hour | Description |
|------------|---------------|-------------|
| Public | 1,000 | Website tracking and analytics |
| Protected | 5,000 | Dashboard and management |
| Auth | 100 | Authentication endpoints |
| Unprotected | 100 | General endpoints |

## 🔌 API Endpoints

### **Health & Monitoring**
- `GET /` - Gateway status
- `GET /health` - Health check
- `GET /metrics` - Performance metrics

### **Proxied Endpoints**
All `/api/v1/*` requests are automatically routed to appropriate services:

- **Users Service**: `/api/v1/user/*`
- **Analytics Service**: `/api/v1/analytics/*`, `/api/v1/funnels/*`
- **Workflows Service**: `/api/v1/workflows/*`
- **Admin Service**: `/api/v1/admin/*`

## 🗄️ Caching Strategy

### **Cache Types**
- **Validation Cache**: Website validation results (30 min TTL)
- **Token Cache**: JWT validation results (15 min TTL)
- **Website Cache**: Website data (30 min TTL)
- **Domain Cache**: Domain lookups (1 hour TTL)

### **Cache Keys**
```
validation:{websiteId:domain_hash}
token:{token_hash}
website:{websiteId}
domain:{domain}
siteId:{siteId}
```

### **Cache Management**
```go
// Clear specific caches
ClearUserCache(userID)
ClearWebsiteCache(websiteId)
ClearValidationCache(websiteId, domain)
ClearTokenCache(token)

// Get cache statistics
stats := GetCacheStats()
```

## 🔐 Security Features

### **Authentication Flow**
1. **Token Extraction**: Extract JWT from Authorization header
2. **Token Validation**: Validate with Users service
3. **User Context**: Inject user data into request context
4. **Route Protection**: Apply appropriate validation based on route type

### **Website Validation**
1. **Data Extraction**: Extract domain/siteId from request
2. **Cache Check**: Check Redis for cached validation
3. **Service Call**: Call Users service for validation
4. **Result Caching**: Cache validation results
5. **Header Injection**: Add website context to request

### **Rate Limiting**
- **Per-route limits**: Different limits for different route types
- **Client identification**: IP, user ID, or domain-based limits
- **Redis-based**: Atomic increment with expiration
- **Configurable**: Environment-based configuration

## 📊 Monitoring & Logging

### **Request Logging**
```
[15:04:05] GET /api/v1/analytics/dashboard/123 - 45ms
[15:04:06] POST /api/v1/track - 12ms
[15:04:07] GET /api/v1/workflows - 89ms ⚠️ SLOW REQUEST
```

### **Performance Metrics**
- Request/response timing
- Slow request detection (>100ms)
- Cache hit/miss ratios
- Rate limit violations

### **Health Checks**
- Redis connectivity
- Service availability
- Response times
- Error rates

## 🚀 Deployment

### **Docker Deployment**
```dockerfile
FROM golang:1.23-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o gateway .
EXPOSE 8080
CMD ["./gateway"]
```

### **Environment Variables**
```bash
# Production
export NODE_ENV=production
export REDIS_URL=redis://redis:6379
export USER_SERVICE_URL=https://users.seentics.com
export ANALYTICS_SERVICE_URL=https://analytics.seentics.com
export WORKFLOW_SERVICE_URL=https://workflows.seentics.com
export ADMIN_SERVICE_URL=https://admin.seentics.com
```

### **Load Balancing**
```nginx
upstream gateway {
    server gateway1:8080;
    server gateway2:8080;
    server gateway3:8080;
}

server {
    listen 80;
    location / {
        proxy_pass http://gateway;
    }
}
```

## 🧪 Testing

### **Unit Tests**
```bash
go test ./...
```

### **Integration Tests**
```bash
# Test with Redis
REDIS_URL=redis://localhost:6379 go test -v

# Test with mock services
go test -tags=integration
```

### **Load Testing**
```bash
# Install hey
go install github.com/rakyll/hey@latest

# Test rate limiting
hey -n 1000 -c 10 http://localhost:8080/api/v1/track
```

## 🐛 Troubleshooting

### **Common Issues**

**Gateway Won't Start**
- Check Redis connectivity
- Verify environment variables
- Check port availability

**Authentication Failures**
- Verify JWT secrets
- Check Users service availability
- Review token expiration

**Rate Limiting Issues**
- Check Redis connection
- Verify rate limit configuration
- Monitor request patterns

**CORS Errors**
- Check CORS_ORIGIN configuration
- Verify frontend domain
- Review preflight requests

### **Debug Mode**
Enable debug logging by setting:
```env
DEBUG=true
LOG_LEVEL=debug
```

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### **Code Guidelines**
- Follow Go conventions and formatting
- Add comprehensive error handling
- Include proper logging
- Write tests for new features
- Update documentation

### **Testing Requirements**
- All new features must have tests
- Maintain >80% test coverage
- Include integration tests for critical paths
- Test rate limiting and caching

## 📚 Resources

### **Documentation**
- [System Architecture](../../SYSTEM_ARCHITECTURE_OVERVIEW.md)
- [API Reference](../../docs/API_REFERENCE.md)
- [Contributing Guide](../../CONTRIBUTING.md)

### **External Resources**
- [Go Documentation](https://golang.org/doc/)
- [Redis Documentation](https://redis.io/documentation)
- [HTTP/2 Proxy](https://golang.org/pkg/net/http/httputil/)
- [Rate Limiting Patterns](https://redis.io/commands/incr)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

---

**Built with ❤️ by the Seentics community**
