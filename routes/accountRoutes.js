import express from 'express';
const router = express.Router(); 

import { ensureMfaVerified } from '../middleware/mfa.js';
import { requireAuth } from '../middleware/auth.js';
import {
    deleteAccount,
    deactivateAccount,
    changeUsername,
    getAccountSettings
} from '../controllers/accountController.js';

router.get('/settings', requireAuth, ensureMfaVerified, getAccountSettings);
router.post('/account/deactivate', requireAuth, ensureMfaVerified, deactivateAccount);
router.post('/account/change-username', requireAuth, ensureMfaVerified, changeUsername);
router.post('/account/delete', requireAuth, ensureMfaVerified, deleteAccount);

export default router;
