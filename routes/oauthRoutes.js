// routes/oauthRoutes.js
import express from 'express';
import oauth2Server from '../oauth/index.js';
import { requireAuth, loadUser } from '../middleware/auth.js';
import { ensureMfaVerified } from '../middleware/mfa.js';
import OAuthClient from '../models/OAuthClient.js';
import { authenticateClient } from '../middleware/clientAuth.js';
import AccessToken from '../models/AccessToken.js';

const router = express.Router();

// Load user for all OAuth routes so req.user is available
router.use(loadUser);

// Step 1: GET /authorize
router.get('/authorize',
  requireAuth,
  ensureMfaVerified,
  // Log session before authorize middleware
  (req, res, next) => {
    console.log('[Authorize] Session ID:', req.sessionID);
    console.log('[Authorize] Session Data:', req.session);
    next();
  },
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
    if (!req.user) {
      return res.status(401).send('User not authenticated');
    }

    res.render('oauth/authorize', {
      title: 'Authorize Access',
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
  // Log session here as well
  (req, res, next) => {
    console.log('[Authorize Decision] Session ID:', req.sessionID);
    console.log('[Authorize Decision] Session Data:', req.session);
    next();
  },
  oauth2Server.decision((req, done) => {
    return done(null, { scope: req.body.scope });
  })
);

// Step 3: POST /token
router.post('/token',
  authenticateClient,

  // Log session before token processing
  (req, res, next) => {
    console.log('[Token] Session ID:', req.sessionID);
    console.log('[Token] Session Data:', req.session);
    if (req.oauth2?.client) {
      req.user = req.oauth2.client; // oauth2orize uses req.user as the client
    }
    next();
  },

  // Handle token generation
  oauth2Server.token(),

  // Final success/error logger
  (req, res, next) => {
    const sessionId = req.sessionID;
    if (res.headersSent && res.statusCode === 200) {
      console.log(`[Token Result] SUCCESS for session ${sessionId}`);
    } else {
      console.error(`[Token Result] ERROR for session ${sessionId} with status ${res.statusCode}`);
    }
    next();
  },

  // Default OAuth2 error handler
  oauth2Server.errorHandler()
);

// userInfo endpoint
router.get('/userinfo', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const accessToken = await AccessToken.findOne({ accessToken: token }).populate('user');
    if (!accessToken) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    if (!accessToken.user) {
      return res.status(404).json({ error: 'User not found for this token' });
    }

    const user = accessToken.user;
    res.json({
      sub: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error('[UserInfo] Error fetching user info:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
