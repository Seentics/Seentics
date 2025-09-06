import Joi from 'joi';

const nodeSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().required(),
  position: Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required()
  }).required(),
  data: Joi.object({
    iconName: Joi.string().required(),
    title: Joi.string().required(),
    type: Joi.string().valid('Trigger', 'Condition', 'Action').required(),
    color: Joi.string().required(),
    settings: Joi.object().default({}),
    isServerAction: Joi.boolean().default(false)
  }).required(),
  style: Joi.object().optional(),
  width: Joi.number().optional(),
  height: Joi.number().optional(),
  // Allow UI-specific properties that might leak through
  selected: Joi.boolean().optional(),
  dragging: Joi.boolean().optional(),
  positionAbsolute: Joi.object().optional(),
  measured: Joi.object().optional(),
  resizing: Joi.boolean().optional()
});

const edgeSchema = Joi.object({
  id: Joi.string().required(),
  source: Joi.string().required(),
  target: Joi.string().required(),
  sourceHandle: Joi.string().allow(null).optional(),
  targetHandle: Joi.string().allow(null).optional(),
  animated: Joi.boolean().default(false),
  style: Joi.object().optional(),
  // Allow UI-specific properties that might leak through
  selected: Joi.boolean().optional(),
  markerEnd: Joi.object().optional(),
  markerStart: Joi.object().optional()
});

const workflowSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  category: Joi.string().max(50).optional(),
  status: Joi.string().valid('Draft', 'Active', 'Paused').default('Draft'),
  siteId: Joi.string().required(),
  nodes: Joi.array().items(nodeSchema).required(),
  edges: Joi.array().items(edgeSchema).required(),
  // Allow MongoDB-specific fields
  _id: Joi.alternatives([Joi.string(), Joi.object()]).optional(),
  __v: Joi.number().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  // Allow computed/UI fields
  triggerRate: Joi.string().optional(),
  completionRate: Joi.string().optional(),
  totalTriggers: Joi.number().optional(),
  totalCompletions: Joi.number().optional(),
  userId: Joi.string().optional()
});

// Schema for partial updates (like status-only updates)
const workflowUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  category: Joi.string().max(50).optional(),
  status: Joi.string().valid('Draft', 'Active', 'Paused').optional(),
  siteId: Joi.string().optional(),
  nodes: Joi.array().items(nodeSchema).optional(),
  edges: Joi.array().items(edgeSchema).optional(),
  // Allow MongoDB-specific fields
  _id: Joi.alternatives([Joi.string(), Joi.object()]).optional(),
  __v: Joi.number().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  // Allow computed/UI fields
  triggerRate: Joi.string().optional(),
  completionRate: Joi.string().optional(),
  totalTriggers: Joi.number().optional(),
  totalCompletions: Joi.number().optional(),
  userId: Joi.string().optional()
}).min(1); // At least one field must be provided

// Schema for creation (stricter requirements)
const workflowCreateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  category: Joi.string().max(50).optional(),
  status: Joi.string().valid('Draft', 'Active', 'Paused').default('Draft'),
  siteId: Joi.string().required(),
  nodes: Joi.array().items(nodeSchema).required(),
  edges: Joi.array().items(edgeSchema).required(),
  // Allow these but don't require them
  triggerRate: Joi.string().optional(),
  completionRate: Joi.string().optional(),
  totalTriggers: Joi.number().optional(),
  totalCompletions: Joi.number().optional(),
  userId: Joi.string().optional()
});

export function validateWorkflow(workflow) {
  return workflowSchema.validate(workflow, { allowUnknown: false });
}

export function validateWorkflowRequest(data) {
  return workflowCreateSchema.validate(data, { allowUnknown: false });
}

export function validateWorkflowUpdate(data) {
  return workflowUpdateSchema.validate(data, { allowUnknown: false });
}

export function validateNodeSettings(nodeType, settings) {
  const settingsSchemas = {
    'Time Spent': Joi.object({
      seconds: Joi.number().min(1).max(3600).required()
    }),
    'Scroll Depth': Joi.object({
      scrollDepth: Joi.number().min(1).max(100).required()
    }),
    'Element Click': Joi.object({
      selector: Joi.string().required()
    }),
    'URL Path': Joi.object({
      url: Joi.string().required(),
      urlMatchType: Joi.string().valid('exact', 'contains', 'startsWith', 'endsWith').default('contains')
    }),
    'Device Type': Joi.object({
      deviceType: Joi.string().valid('Mobile', 'Desktop').required()
    }),
    'Show Modal': Joi.object({
      modalTitle: Joi.string().required(),
      modalContent: Joi.string().required()
    }),
    'Show Banner': Joi.object({
      bannerContent: Joi.string().required(),
      bannerPosition: Joi.string().valid('top', 'bottom').default('top'),
      bannerCtaText: Joi.string().optional(),
      bannerCtaUrl: Joi.string().uri().optional()
    }),
    'Send Email': Joi.object({
      emailTo: Joi.string().email().required(),
      emailSubject: Joi.string().required(),
      emailBody: Joi.string().required()
    }),
    'Webhook': Joi.object({
      webhookUrl: Joi.string().uri().required(),
      webhookMethod: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').default('POST'),
      webhookHeaders: Joi.object().optional(),
      webhookBody: Joi.string().optional()
    })
  };

  const schema = settingsSchemas[nodeType];
  if (!schema) {
    return { error: null, value: settings };
  }

  return schema.validate(settings);
}