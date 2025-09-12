import express from 'express';
import privacyController from '../controllers/privacy/privacyController.js';
import { authenticate } from '../middleware/auth.js';
import { body, query } from 'express-validator';

const router = express.Router();

// Validation middleware
const createPrivacyRequestValidation = [
  body('type').isIn(['export', 'deletion', 'correction', 'portability']).withMessage('Invalid request type'),
  body('reason').optional().isString().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),
  body('details').optional().isString().isLength({ min: 10 }).withMessage('Details must be at least 10 characters'),
  body('requestedData').optional().isObject().withMessage('Requested data must be an object')
];

const updatePrivacySettingsValidation = [
  body('analyticsTracking').optional().isBoolean().withMessage('Analytics tracking must be boolean'),
  body('marketingEmails').optional().isBoolean().withMessage('Marketing emails must be boolean'),
  body('personalizedContent').optional().isBoolean().withMessage('Personalized content must be boolean'),
  body('thirdPartySharing').optional().isBoolean().withMessage('Third party sharing must be boolean'),
  body('dataRetention').optional().isIn(['1year', '2years', '5years', 'indefinite']).withMessage('Invalid data retention period'),
  body('cookieConsent').optional().isObject().withMessage('Cookie consent must be an object')
];

const dataDeletionValidation = [
  body('reason').isString().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters')
];

// Privacy settings routes
router.get('/settings', authenticate, privacyController.getPrivacySettings);
router.put('/settings', authenticate, updatePrivacySettingsValidation, privacyController.updatePrivacySettings);

// Privacy requests routes
router.post('/requests', authenticate, createPrivacyRequestValidation, (req, res) => {
  res.json({ success: true, message: 'Privacy request endpoint - temporarily disabled' });
});
router.get('/requests', authenticate, privacyController.getPrivacyRequests);

// Data export routes
router.get('/download/:filename', authenticate, (req, res) => {
  res.json({ success: true, message: 'Download endpoint - temporarily disabled' });
});

// Data deletion routes
router.post('/delete', authenticate, dataDeletionValidation, (req, res) => {
  res.json({ success: true, message: 'Delete endpoint - temporarily disabled' });
});

// Compliance status
router.get('/compliance', authenticate, (req, res) => {
  res.json({ success: true, message: 'Compliance endpoint - temporarily disabled' });
});

export default router;
