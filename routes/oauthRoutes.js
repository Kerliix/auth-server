// routes/oauthRoutes.js
import express from 'express';
import {
  getAuthorizePage,
  postAuthorizeDecision,
  issueToken,
  registerClient,
  userInfo,
} from '../oauth/oauthController.js';

const router = express.Router();

router.get('/authorize', getAuthorizePage);
router.post('/authorize', postAuthorizeDecision);
router.post('/token', tokenLimiter, issueToken);
router.post('/register-client', registerClient);
router.get('/userinfo', userInfo);

export default router;
