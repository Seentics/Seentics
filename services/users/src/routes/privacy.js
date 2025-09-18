import express from 'express';
import privacyController from '../controllers/privacy/privacyController.js';
import { authenticate } from '../middleware/auth.js';
import { body, query } from 'express-validator';

const router = express.Router();

// Validation middleware
const createPrivacyRequestValidation = [
  body('type').isIn(['export', 'deletion', 'correction', 'portability', 'data_export', 'data_deletion', 'data_portability', 'opt_out']).withMessage('Invalid request type'),
  body('reason').optional().isString().isLength({ min: 1 }).withMessage('Reason must be provided'),
  body('details').optional().isString().isLength({ min: 1 }).withMessage('Details must be provided'),
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
  body('reason').optional().isString().isLength({ min: 1 }).withMessage('Reason must be provided'),
  body('confirmPassword').optional().isString().withMessage('Password confirmation must be a string')
];

// Privacy settings routes
router.get('/settings', authenticate, privacyController.getPrivacySettings);
router.put('/settings', authenticate, updatePrivacySettingsValidation, privacyController.updatePrivacySettings);

// Privacy requests routes
router.post('/requests', authenticate, createPrivacyRequestValidation, privacyController.submitPrivacyRequest);
router.get('/requests', authenticate, privacyController.getPrivacyRequests);

// Data export routes
router.get('/export', authenticate, privacyController.exportUserData);
router.get('/download', authenticate, privacyController.downloadPrivacyData);

// Data deletion routes
router.post('/delete', authenticate, dataDeletionValidation, privacyController.deleteUserData);

// Compliance status
router.get('/compliance', authenticate, (req, res) => {
  res.json({ success: true, message: 'Compliance endpoint - temporarily disabled' });
});

export default router;
