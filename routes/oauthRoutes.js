import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAuthorizePage, postAuthorizeDecision } from '../oauth/oauthController.js';
import { issueToken } from '../oauth/issueToken.js';
import { registerClient } from '../oauth/registerClient.js';
import { revokeToken } from '../oauth/revokeToken.js';
import { userInfo } from '../oauth/userInfo.js';
import { tokenLimiter } from '../middleware/rateLimiter.js'; 
import { ensureMfaVerified } from '../middleware/mfa.js';

const router = express.Router();

router.get('/authorize', requireAuth, ensureMfaVerified, getAuthorizePage);
router.post('/authorize', requireAuth, ensureMfaVerified, postAuthorizeDecision);
router.post('/token', tokenLimiter, issueToken);
router.get('/revoke-Token', requireAuth, ensureMfaVerified, revokeToken);
router.post('/register-client', registerClient);
router.get('/userinfo', requireAuth, ensureMfaVerified, userInfo);

export default router;
