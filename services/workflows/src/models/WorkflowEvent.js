import mongoose from 'mongoose';

const workflowEventSchema = new mongoose.Schema({
  siteId: { type: String, required: true, index: true },
  workflowId: { type: String, required: true, index: true },
  visitorId: { type: String, required: true, index: true },
  // Expanded event types to support funnel analytics and step tracking
  event: { type: String, enum: ['Trigger', 'Step Entered', 'Condition Evaluated', 'Step Completed', 'Action Executed'], required: true },
  nodeId: { type: String, required: true },
  nodeTitle: { type: String, required: true },
  nodeType: { type: String },
  detail: { type: mongoose.Schema.Types.Mixed },
  runId: { type: String, index: true },
  stepOrder: { type: Number },
  executionTime: { type: Number },
  success: { type: Boolean },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: false,
  collection: 'workflow_events'
});

// Compound indexes for analytics queries
workflowEventSchema.index({ workflowId: 1, timestamp: -1 });
workflowEventSchema.index({ siteId: 1, timestamp: -1 });
workflowEventSchema.index({ workflowId: 1, event: 1, timestamp: -1 });
// TTL index to automatically delete old events after 24 hours (86400 seconds)
// This ensures real-time activity data doesn't accumulate indefinitely
workflowEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

export const WorkflowEvent = mongoose.model('WorkflowEvent', workflowEventSchema);

// =============================================================================
// AGGREGATION MODELS FOR HISTORICAL DATA PRESERVATION
// =============================================================================

// Daily aggregation schema - stores daily workflow performance metrics
const dailyAggregationSchema = new mongoose.Schema({
  workflowId: { type: String, required: true, index: true },
  siteId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  triggers: { type: Number, default: 0 },
  completions: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  totalExecutionTime: { type: Number, default: 0 },
  avgExecutionTime: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  uniqueSessions: { type: Number, default: 0 },
  nodePerformance: [{
    nodeId: String,
    nodeTitle: String,
    triggers: Number,
    completions: Number,
    successRate: Number
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'workflow_daily_aggregations',
  timestamps: false
});

// Weekly aggregation schema - stores weekly workflow performance metrics
const weeklyAggregationSchema = new mongoose.Schema({
  workflowId: { type: String, required: true, index: true },
  siteId: { type: String, required: true, index: true },
  weekStart: { type: Date, required: true, index: true },
  weekEnd: { type: Date, required: true, index: true },
  weekNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  totalTriggers: { type: Number, default: 0 },
  totalCompletions: { type: Number, default: 0 },
  avgConversionRate: { type: Number, default: 0 },
  totalExecutionTime: { type: Number, default: 0 },
  avgExecutionTime: { type: Number, default: 0 },
  totalUniqueVisitors: { type: Number, default: 0 },
  totalUniqueSessions: { type: Number, default: 0 },
  dailyBreakdown: [{
    date: Date,
    triggers: Number,
    completions: Number,
    conversionRate: Number
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'workflow_weekly_aggregations',
  timestamps: false
});

// Monthly aggregation schema - stores monthly workflow performance metrics
const monthlyAggregationSchema = new mongoose.Schema({
  workflowId: { type: String, required: true, index: true },
  siteId: { type: String, required: true, index: true },
  month: { type: Number, required: true, index: true },
  year: { type: Number, required: true, index: true },
  monthStart: { type: Date, required: true, index: true },
  monthEnd: { type: Date, required: true, index: true },
  totalTriggers: { type: Number, default: 0 },
  totalCompletions: { type: Number, default: 0 },
  avgConversionRate: { type: Number, default: 0 },
  totalExecutionTime: { type: Number, default: 0 },
  avgExecutionTime: { type: Number, default: 0 },
  totalUniqueVisitors: { type: Number, default: 0 },
  totalUniqueSessions: { type: Number, default: 0 },
  weeklyBreakdown: [{
    weekStart: Date,
    weekEnd: Date,
    triggers: Number,
    completions: Number,
    conversionRate: Number
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'workflow_monthly_aggregations',
  timestamps: false
});

// Indexes for performance
dailyAggregationSchema.index({ workflowId: 1, date: -1 });
dailyAggregationSchema.index({ siteId: 1, date: -1 });
dailyAggregationSchema.index({ date: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

weeklyAggregationSchema.index({ workflowId: 1, weekStart: -1 });
weeklyAggregationSchema.index({ siteId: 1, weekStart: -1 });
weeklyAggregationSchema.index({ weekStart: 1 }, { expireAfterSeconds: 31536000 }); // 1 year TTL

monthlyAggregationSchema.index({ workflowId: 1, year: -1, month: -1 });
monthlyAggregationSchema.index({ siteId: 1, year: -1, month: -1 });
monthlyAggregationSchema.index({ monthStart: 1 }, { expireAfterSeconds: 31536000 }); // 1 year TTL

// Export aggregation models
export const DailyAggregation = mongoose.model('DailyAggregation', dailyAggregationSchema);
export const WeeklyAggregation = mongoose.model('WeeklyAggregation', weeklyAggregationSchema);
export const MonthlyAggregation = mongoose.model('MonthlyAggregation', monthlyAggregationSchema);