import express from 'express';
import { getAuthorizePage, postAuthorizeDecision } from '../oauth/oauthController.js';
import { issueToken } from '../oauth/issueToken.js';
import { registerClient } from '../oauth/registerClient.js';
import { revokeToken } from '../oauth/revokeToken.js';
import { userInfo } from '../oauth/userInfo.js';
import { tokenLimiter } from '../middleware/rateLimiter.js'; 

const router = express.Router();

router.get('/authorize', getAuthorizePage);
router.post('/authorize', postAuthorizeDecision);
router.post('/token', tokenLimiter, issueToken);
router.get('/revoke-Token', revokeToken);
router.post('/register-client', registerClient);
router.get('/userinfo', userInfo);

export default router;
