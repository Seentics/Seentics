import express from 'express';
import WebhookController from '../controllers//webhook/webhookController.js';

const router = express.Router();

// Webhook endpoints
router.post('/lemon-squeezy', express.raw({ type: 'application/json' }), WebhookController.handleLemonSqueezyWebhook);

export default router;