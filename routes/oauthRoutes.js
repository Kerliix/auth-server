import express from 'express';
import oauth2Server from '../oauth/index.js';
import { requireAuth, loadUser } from '../middleware/auth.js';
import { ensureMfaVerified } from '../middleware/mfa.js';
import { authenticateClient } from '../middleware/clientAuth.js';
import OAuthClient from '../models/OAuthClient.js';
import AccessToken from '../models/AccessToken.js';
import logger from '../config/logger.js';
import csrf from 'csurf';

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

// Inject user from session or token
router.use(loadUser);

// AUTHORIZATION ENDPOINT (GET /oauth/authorize)
router.get('/authorize',
  requireAuth,
  ensureMfaVerified,
  csrfProtection,
  (req, res, next) => {
    logger.info('[Authorize] Request from IP:', req.ip, 'User-Agent:', req.get('User-Agent'));
    next();
  },
  oauth2Server.authorize(async (clientId, redirectUri, done) => {
    try {
      const client = await OAuthClient.findOne({ clientId });
      if (!client || !client.redirectUris.includes(redirectUri)) {
        return done(null, false);
      }
      return done(null, client, redirectUri);
    } catch (err) {
      logger.error('[Authorize] Client Lookup Error:', err);
      return done(err);
    }
  }),
  (req, res) => {
    if (!req.user) return res.status(401).send('User not authenticated');
    res.render('oauth/authorize', {
      title: 'Authorize Access',
      csrfToken: req.csrfToken(),
      transactionID: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client,
      scope: req.query.scope,
      state: req.query.state,
      redirect_uri: req.query.redirect_uri,
      code_challenge: req.query.code_challenge,
      code_challenge_method: req.query.code_challenge_method,
    });
  }
);

// DECISION ENDPOINT (POST /oauth/authorize/decision)
router.post('/authorize/decision',
  requireAuth,
  csrfProtection,
  (req, res, next) => {
    logger.info('[Authorize Decision] IP:', req.ip, 'User-Agent:', req.get('User-Agent'));
    next();
  },
  oauth2Server.decision((req, done) => {
    const { scope, code_challenge, code_challenge_method } = req.body;

    // Only allow S256 PKCE
    if (!code_challenge || code_challenge_method !== 'S256') {
      return done(new Error('Only S256 PKCE is supported'));
    }

    return done(null, {
      scope,
      code_challenge,
      code_challenge_method,
    });
  })
);

// TOKEN EXCHANGE (POST /oauth/token)
router.post('/token',
  authenticateClient,
  (req, res, next) => {
    logger.info('[Token] Request from IP:', req.ip, 'User-Agent:', req.get('User-Agent'));
    if (req.oauth2?.client) req.user = req.oauth2.client;
    next();
  },
  oauth2Server.token(),
  (req, res, next) => {
    if (res.headersSent && res.statusCode === 200) {
      logger.info(`[Token Result] SUCCESS`);
    } else {
      logger.error(`[Token Result] FAILURE with status ${res.statusCode}`);
    }
    next();
  },
  oauth2Server.errorHandler()
);

// USERINFO ENDPOINT (GET /oauth/userinfo)
router.get('/userinfo', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const accessToken = await AccessToken.findOne({ accessToken: token }).populate('user');
    if (!accessToken || !accessToken.scope?.includes('profile')) {
      return res.status(403).json({ error: 'Insufficient scope: "profile" required' });
    }

    const user = accessToken.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      sub: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    logger.error('[UserInfo] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TOKEN REVOCATION (POST /oauth/revoke)
router.post('/revoke',
  authenticateClient,
  async (req, res) => {
    const token = req.body.token;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    try {
      const revoked = await oauth2Server.revoke(token);
      if (revoked) {
        logger.info('[Revoke] Token revoked. IP:', req.ip, 'Client:', req.oauth2?.client?.clientId);
      } else {
        logger.warn('[Revoke] Token not found');
      }
      res.status(200).json({});
    } catch (err) {
      logger.error('[Revoke] Error:', err);
      res.status(500).json({ error: 'Failed to revoke token' });
    }
  }
);

// TOKEN INTROSPECTION (POST /oauth/introspect)
router.post('/introspect',
  authenticateClient,
  async (req, res) => {
    const token = req.body.token;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    try {
      const data = await oauth2Server.introspect(token);
      res.status(200).json(data);
    } catch (err) {
      logger.error('[Introspect] Error:', err);
      res.status(500).json({ error: 'Failed to introspect token' });
    }
  }
);

// OIDC DISCOVERY DOCUMENT (GET /.well-known/openid-configuration)
router.get('/.well-known/openid-configuration', (req, res) => {
  const issuer = process.env.JWT_ISSUER || 'https://auth.kerliix.com';
  const base = issuer.replace(/\/+$/, '');

  res.json({
    issuer: base,
    authorization_endpoint: `${base}/oauth/authorize`,
    token_endpoint: `${base}/oauth/token`,
    userinfo_endpoint: `${base}/oauth/userinfo`,
    revocation_endpoint: `${base}/oauth/revoke`,
    introspection_endpoint: `${base}/oauth/introspect`,
    jwks_uri: `${base}/oauth/jwks.json`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid', 'profile', 'email'],
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
    grant_types_supported: ['authorization_code', 'refresh_token', 'client_credentials'],
  });
});

// JWKS ENDPOINT (GET /oauth/jwks.json)
router.get('/jwks.json', async (req, res) => {
  try {
    const jwks = await oauth2Server.getJWKS();
    res.json(jwks);
  } catch (err) {
    logger.error('[JWKS] Error:', err);
    res.status(500).json({ error: 'Failed to load JWKS' });
  }
});

export default router;
