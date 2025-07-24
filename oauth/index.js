import oauth2orize from 'oauth2orize';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import OAuthClient from '../models/OAuthClient.js';
import AuthorizationCode from '../models/AuthorizationCode.js';
import AccessToken from '../models/AccessToken.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

const JWT_ISSUER = process.env.JWT_ISSUER || 'https://auth.kerliix.com';
const JWT_ALG = 'RS256';
const PRIVATE_KEY = fs.readFileSync(path.resolve('config/keys/private.key'));
const PUBLIC_KEY = fs.readFileSync(path.resolve('config/keys/public.key'));

const server = oauth2orize.createServer();

server.serializeClient((client, done) => done(null, client.clientId));

server.deserializeClient(async (clientId, done) => {
  try {
    const client = await OAuthClient.findOne({ clientId });
    done(null, client);
  } catch (err) {
    logger.error('[DeserializeClient] Error:', err);
    done(err);
  }
});

// Authorization Code Grant (with S256 PKCE)
server.grant(oauth2orize.grant.code(async (client, redirectUri, user, ares, done) => {
  try {
    if (!ares.code_challenge || ares.code_challenge_method !== 'S256') {
      return done(new Error('PKCE S256 required'));
    }

    const code = crypto.randomBytes(16).toString('hex');
    await AuthorizationCode.create({
      code,
      clientId: client.clientId,
      redirectUri,
      user: user._id,
      scope: ares.scope,
      codeChallenge: ares.code_challenge,
      codeChallengeMethod: 'S256',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });
    done(null, code);
  } catch (err) {
    logger.error('[Grant] Error:', err);
    done(err);
  }
}));

// Authorization Code Exchange
server.exchange(oauth2orize.exchange.code(async (client, code, redirectUri, req, done) => {
  try {
    const authCode = await AuthorizationCode.findOne({ code });
    if (!authCode || authCode.clientId !== client.clientId || authCode.redirectUri !== redirectUri) {
      return done(null, false);
    }
    if (new Date() > authCode.expiresAt) return done(null, false);

    const codeVerifier = req.body.code_verifier;
    if (!codeVerifier) return done(null, false);
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    const expectedChallenge = hash.toString('base64url');
    if (expectedChallenge !== authCode.codeChallenge) return done(null, false);

    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');

    await AccessToken.create({
      accessToken,
      refreshToken,
      user: authCode.user,
      clientId: client.clientId,
      scope: authCode.scope,
      issuedAt: new Date(),
      expiresIn: 3600,
      refreshExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await AuthorizationCode.deleteOne({ _id: authCode._id });
    const idToken = await generateIdToken(authCode.user, client.clientId);
    done(null, accessToken, refreshToken, {
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: idToken,
    });
  } catch (err) {
    logger.error('[Token Exchange] ERROR:', err);
    done(err);
  }
}));

// Refresh Token Exchange
server.exchange(oauth2orize.exchange.refreshToken(async (client, refreshToken, scope, done) => {
  try {
    const token = await AccessToken.findOne({ refreshToken });
    if (!token || token.clientId !== client.clientId) return done(null, false);
    if (token.refreshExpiresAt && new Date() > token.refreshExpiresAt) return done(null, false);

    token.accessToken = crypto.randomBytes(32).toString('hex');
    token.refreshToken = crypto.randomBytes(32).toString('hex');
    token.issuedAt = new Date();
    token.expiresIn = 3600;
    token.refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await token.save();

    const idToken = await generateIdToken(token.user, client.clientId);
    done(null, token.accessToken, token.refreshToken, {
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: idToken,
    });
  } catch (err) {
    logger.error('[Refresh Token Exchange] ERROR:', err);
    done(err);
  }
}));

// Client Credentials Grant
server.exchange(oauth2orize.exchange.clientCredentials(async (client, scope, done) => {
  try {
    const accessToken = crypto.randomBytes(32).toString('hex');
    await AccessToken.create({
      accessToken,
      clientId: client.clientId,
      scope,
      issuedAt: new Date(),
      expiresIn: 3600,
    });
    done(null, accessToken, null, {
      token_type: 'Bearer',
      expires_in: 3600,
    });
  } catch (err) {
    logger.error('[Client Credentials] ERROR:', err);
    done(err);
  }
}));

// Revocation with Audit Logging
server.revoke = async function (token) {
  const result = await AccessToken.deleteOne({ $or: [
    { accessToken: token },
    { refreshToken: token },
  ]});
  logger.info(`[Token Revoke] Token: ${token}, Result: ${result.deletedCount > 0 ? 'Success' : 'Not Found'}`);
  return result.deletedCount > 0;
};

// Introspection with Expiry Check
server.introspect = async function (token) {
  const found = await AccessToken.findOne({ accessToken: token }).populate('user');
  if (!found || new Date() > new Date(found.issuedAt.getTime() + found.expiresIn * 1000)) {
    return { active: false };
  }
  return {
    active: true,
    client_id: found.clientId,
    username: found.user?.email,
    scope: found.scope,
    exp: Math.floor(found.issuedAt.getTime() / 1000) + found.expiresIn,
    iat: Math.floor(found.issuedAt.getTime() / 1000),
    sub: found.user?._id.toString(),
    aud: found.clientId,
    iss: JWT_ISSUER,
  };
};

// JWT ID Token Generator
async function generateIdToken(userId, clientId) {
  const user = await User.findById(userId);
  if (!user) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: JWT_ISSUER,
    sub: user._id.toString(),
    aud: clientId,
    exp: now + 3600,
    iat: now,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: JWT_ALG,
    keyid: 'kerliix-key-1',
  });
}

// JWKS Endpoint
server.getJWKS = function () {
  const publicKey = crypto.createPublicKey(PUBLIC_KEY);
  const jwk = publicKey.export({ format: 'jwk' });

  return {
    keys: [{
      ...jwk,
      use: 'sig',
      alg: JWT_ALG,
      kid: 'kerliix-key-1',
    }],
  };
};

export default server;
