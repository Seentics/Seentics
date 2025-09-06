# Funnel-Workflow Integration

## Overview

The Funnel-Workflow Integration is a powerful feature that automatically triggers workflows based on user behavior in conversion funnels. This creates a seamless connection between analytics data and automated customer journey workflows.

## 🎯 What It Does

When users interact with your funnels (e.g., e-commerce checkout, lead generation forms), the system automatically detects specific events and triggers corresponding workflows. This enables:

- **Automatic re-engagement** when users drop off
- **Personalized follow-ups** based on funnel progress
- **Smart segmentation** and targeting
- **Real-time automation** without manual intervention

## 🏗️ Architecture

```
Analytics Service → Funnel Event Emitter → Workflow Service → Workflow Execution
       ↓                    ↓                    ↓                ↓
   Tracks user         Emits events        Receives events   Executes actions
   funnel steps        via webhooks        and finds         (emails, SMS, etc.)
                       to workflow         matching          based on funnel
                       service             workflows         events
```

## 🚀 Key Features

### **Event Types**
- **Drop-off**: User leaves funnel at specific step
- **Conversion**: User completes entire funnel
- **Milestone**: User reaches specific milestone step
- **Abandonment**: User abandons funnel after time delay
- **Step Completion**: User completes specific step

### **Advanced Conditions**
- **Time Thresholds**: Delay workflow execution
- **User Segmentation**: Target specific user groups
- **Custom Metrics**: Complex condition evaluation
- **Value Ranges**: Numeric value filtering

### **Workflow Actions**
- **Email Sequences**: Automated email campaigns
- **SMS Notifications**: Text message workflows
- **Webhook Calls**: External system integration
- **Delayed Execution**: Time-based automation

## 📱 Frontend Components

### **FunnelTriggerBuilder**
- Visual interface for creating funnel triggers
- Funnel selection and event type configuration
- Advanced condition setup
- Real-time validation

### **FunnelTriggerManager**
- Manage existing funnel triggers
- Monitor execution statistics
- Enable/disable triggers
- Performance analytics

## 🔧 Backend Implementation

### **Analytics Service**
```go
// Funnel event emitter
type FunnelEventEmitter struct {
    workflowServiceURL string
    httpClient         *http.Client
}

// Emit funnel events
func (e *FunnelEventEmitter) EmitDropoffEvent(funnelID, websiteID, userID, sessionID, pageURL, referrer string, stepIndex int, userData map[string]interface{}) error
func (e *FunnelEventEmitter) EmitConversionEvent(funnelID, websiteID, userID, sessionID, pageURL, referrer string, userData map[string]interface{}, metrics map[string]interface{}) error
func (e *FunnelEventEmitter) EmitMilestoneEvent(funnelID, websiteID, userID, sessionID, pageURL, referrer string, stepIndex int, userData map[string]interface{}, metrics map[string]interface{}) error
func (e *FunnelEventEmitter) EmitAbandonmentEvent(funnelID, websiteID, userID, sessionID, pageURL, referrer string, stepIndex int, userData map[string]interface{}, abandonmentTime time.Duration) error
```

### **Workflow Service**
```javascript
// Funnel workflow executor
class FunnelWorkflowExecutor {
    async handleFunnelEvent(event)
    async findWorkflowsByFunnelTrigger(event)
    async evaluateWorkflowConditions(workflow, event)
    async executeWorkflow(workflow, event)
}
```

## 📊 API Endpoints

### **Funnel Events**
- `POST /api/funnel-events` - Receive funnel events
- `GET /api/funnel-events/triggers` - List all triggers
- `POST /api/funnel-events/triggers` - Create new trigger
- `PUT /api/funnel-events/triggers/:id` - Update trigger
- `DELETE /api/funnel-events/triggers/:id` - Delete trigger
- `GET /api/funnel-events/stats` - Get statistics

## 💡 Use Cases

### **E-commerce Cart Abandonment**
```
Funnel: Home → Product → Cart → Checkout → Purchase
Trigger: User drops off at Cart step
Workflow: 
  - Wait 1 hour → "Your cart is waiting" email
  - Wait 24 hours → "Limited time offer" SMS
  - Wait 72 hours → "Final reminder" with discount
```

### **Lead Generation Nurturing**
```
Funnel: Landing Page → Form View → Form Submit → Thank You
Trigger: User converts at Form Submit
Workflow:
  - Immediate: Welcome email + onboarding
  - Day 3: Product education content
  - Day 7: Case study + testimonial
  - Day 14: Sales team contact
```

### **High-Value Customer Onboarding**
```
Funnel: Any conversion funnel
Trigger: User completes with high-value metrics
Workflow:
  - VIP onboarding sequence
  - Dedicated account manager
  - Exclusive content access
  - Early feature access
```

## 🛠️ Setup & Configuration

### **1. Environment Variables**
```bash
# Analytics Service
WORKFLOW_SERVICE_URL=http://workflows-service:3003

# Workflow Service
MONGODB_URI=mongodb://localhost:27017/workflows
REDIS_URL=redis://localhost:6379
```

### **2. Database Schema**
```sql
-- Funnel triggers table
CREATE TABLE funnel_triggers (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    funnel_id VARCHAR(255) NOT NULL,
    website_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    step_index INTEGER NOT NULL,
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **3. Service Dependencies**
```yaml
# docker-compose.yml
services:
  analytics-service:
    environment:
      - WORKFLOW_SERVICE_URL=http://workflows-service:3003
    depends_on:
      - workflows-service
  
  workflows-service:
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/workflows
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
```

## 🧪 Testing

### **Run Integration Tests**
```bash
cd services/workflows
npm install axios
node test-funnel-integration.js
```

### **Manual Testing**
1. Create a funnel in analytics
2. Create a workflow with funnel trigger
3. Simulate funnel events
4. Verify workflow execution

## 📈 Monitoring & Analytics

### **Trigger Statistics**
- Total triggers created
- Active vs inactive triggers
- Execution count per trigger
- Recent activity timeline

### **Performance Metrics**
- Event processing latency
- Workflow execution success rate
- Trigger condition evaluation time
- System resource usage

## 🔒 Security & Privacy

### **Authentication**
- All API endpoints require authentication
- Service-to-service communication uses internal network
- User data is encrypted in transit

### **Data Privacy**
- Funnel events contain minimal PII
- User segmentation respects privacy settings
- GDPR compliance built-in

## 🚀 Future Enhancements

### **Planned Features**
- **AI-powered triggers**: Predictive funnel behavior
- **Dynamic workflows**: Adaptive customer journeys
- **Multi-channel orchestration**: Cross-platform automation
- **Advanced segmentation**: Machine learning user groups

### **Integration Roadmap**
- **CRM systems**: Salesforce, HubSpot, Pipedrive
- **Marketing tools**: Mailchimp, ActiveCampaign
- **E-commerce platforms**: Shopify, WooCommerce
- **Payment processors**: Stripe, PayPal

## 🆘 Troubleshooting

### **Common Issues**

#### **Events Not Triggering**
- Check trigger is active
- Verify funnel ID matches
- Confirm event type is correct
- Check workflow service connectivity

#### **Workflows Not Executing**
- Validate workflow status is "Active"
- Check trigger conditions
- Verify user segmentation
- Review workflow node configuration

#### **Performance Issues**
- Monitor database query performance
- Check Redis connection
- Review trigger cache loading
- Optimize condition evaluation

### **Debug Mode**
```bash
# Enable debug logging
export LOG_LEVEL=debug
export DEBUG_FUNNEL_EVENTS=true
```

## 📚 Additional Resources

- [Workflow Builder Documentation](./WORKFLOW_BUILDER.md)
- [Analytics API Reference](./API_REFERENCE.md)
- [Funnel Analytics Guide](./FUNNEL_ANALYTICS.md)
- [System Architecture Overview](./SYSTEM_ARCHITECTURE_OVERVIEW.md)

## 🤝 Contributing

To contribute to this feature:

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

## 📄 License

This feature is part of the Seentics platform and follows the same licensing terms.
