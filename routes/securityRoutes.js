import express from 'express';
const router = express.Router();

import { ensureMfaVerified } from '../middleware/mfa.js';
import { requireAuth } from '../middleware/auth.js';
import {
  getSecurity,
  updateMfaSettings,
  getTotpSetup,
  verifyTotpSetup
} from '../controllers/securityController.js';

// Routes
router.get('/', requireAuth, ensureMfaVerified, getSecurity);
router.post('/security/mfa', requireAuth, ensureMfaVerified, updateMfaSettings);
router.get('/security/totp-setup', requireAuth, ensureMfaVerified, getTotpSetup);
router.post('/security/totp-setup', requireAuth, ensureMfaVerified, verifyTotpSetup);

export default router;
