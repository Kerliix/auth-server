/*
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
*/

// routes/oauthRoutes.js
import express from 'express';
import oauth2Server from '../oauth/server.js';
import { requireAuth, loadUser } from '../middleware/auth.js';
import { ensureMfaVerified } from '../middleware/mfa.js';
import OAuthClient from '../models/OAuthClient.js';

const router = express.Router();

// Load user for all OAuth routes so req.user is available
router.use(loadUser);

// Step 1: GET /authorize
router.get('/authorize',
  requireAuth,
  ensureMfaVerified,
  oauth2Server.authorize(async (clientId, redirectUri, done) => {
    try {
      console.log('[Authorize] Received clientId:', clientId);
      console.log('[Authorize] Received redirectUri:', redirectUri);

      const client = await OAuthClient.findOne({ clientId });
      if (!client) {
        console.log('[Authorize] Client not found:', clientId);
        return done(null, false);
      }

      console.log('[Authorize] Found client:', client.clientId);
      console.log('[Authorize] Registered redirect URIs:', client.redirectUris);

      if (!client.redirectUris.includes(redirectUri)) {
        console.log('[Authorize] Redirect URI not allowed:', redirectUri);
        return done(null, false);
      }

      console.log('[Authorize] Client authorized successfully');
      return done(null, client, redirectUri);
    } catch (err) {
      console.error('[Authorize] Error:', err);
      return done(err);
    }
  }),
  (req, res) => {
    // Render consent page only if user is loaded
    if (!req.user) {
      return res.status(401).send('User not authenticated');
    }

    res.render('oauth/authorize', {
      transactionID: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client,
      scope: req.query.scope,
      state: req.query.state,
      redirect_uri: req.query.redirect_uri,
    });
  }
);

// Step 2: POST /authorize/decision
router.post('/authorize/decision',
  requireAuth,
  oauth2Server.decision((req, done) => {
    return done(null, { scope: req.body.scope });
  })
);

// Step 3: POST /token
router.post('/token', oauth2Server.token(), oauth2Server.errorHandler());

export default router;
