import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    iconName: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['Trigger', 'Condition', 'Action'], required: true },
    color: { type: String, required: true },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    isServerAction: { type: Boolean, default: false }
  },
  width: Number,
  height: Number,
  // Allow UI-specific properties that might leak through
  selected: Boolean,
  dragging: Boolean,
  positionAbsolute: mongoose.Schema.Types.Mixed,
  measured: mongoose.Schema.Types.Mixed,
  resizing: Boolean,
  style: mongoose.Schema.Types.Mixed
}, { _id: false });

const edgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  sourceHandle: String,
  targetHandle: String,
  animated: { type: Boolean, default: false },
  style: mongoose.Schema.Types.Mixed,
  label: String,
  // Allow UI-specific properties that might leak through
  selected: Boolean,
  markerEnd: mongoose.Schema.Types.Mixed,
  markerStart: mongoose.Schema.Types.Mixed
}, { _id: false });

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  category: { type: String, maxlength: 50 },
  status: { type: String, enum: ['Draft', 'Active', 'Paused'], default: 'Draft' },
  siteId: { type: String, required: true },
  userId: { type: String, required: true },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  
  // Workflow-level analytics counters
  analytics: {
    totalTriggers: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    totalRuns: { type: Number, default: 0 },
    successfulRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 }, // in milliseconds
    lastTriggered: { type: Date },
    
    // Node-wise counters
    nodeStats: {
      type: Map,
      of: {
        triggers: { type: Number, default: 0 },
        completions: { type: Number, default: 0 },
        failures: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 },
        conditionsPassed: { type: Number, default: 0 },
        conditionsFailed: { type: Number, default: 0 }
      },
      default: new Map()
    }
  },
  
  // Legacy fields for backward compatibility
  totalTriggers: { type: Number, default: 0 },
  totalCompletions: { type: Number, default: 0 },
  completionRate: { type: String, default: '0.0%' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
workflowSchema.index({ userId: 1, status: 1 });
workflowSchema.index({ siteId: 1, status: 1 });
workflowSchema.index({ createdAt: -1 });

export const Workflow = mongoose.model('Workflow', workflowSchema);