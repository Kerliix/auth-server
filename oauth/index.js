import oauth2orize from 'oauth2orize';
import crypto from 'crypto';
import OAuthClient from '../models/OAuthClient.js';
import AuthorizationCode from '../models/AuthorizationCode.js';
import AccessToken from '../models/AccessToken.js';

// Create OAuth2 server
const server = oauth2orize.createServer();

// Serialize and deserialize client
server.serializeClient((client, done) => done(null, client.clientId));
server.deserializeClient(async (clientId, done) => {
  try {
    const client = await OAuthClient.findOne({ clientId });
    console.log('[DeserializeClient] Found client:', client?.clientId || 'null');
    done(null, client);
  } catch (err) {
    console.error('[DeserializeClient] Error:', err);
    done(err);
  }
});

// Grant authorization code
server.grant(oauth2orize.grant.code(async (client, redirectUri, user, ares, done) => {
  try {
    if (!user) {
      console.error('[Grant] User is undefined.');
      return done(new Error('User is undefined in grant handler.'));
    }

    const code = crypto.randomBytes(16).toString('hex');
    console.log('[Grant] Generating auth code for client:', client.clientId);

    await AuthorizationCode.create({
      code,
      clientId: client.clientId,
      redirectUri,
      user: user._id,
      scope: ares.scope,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins expiry
    });

    console.log('[Grant] Auth code issued:', code);
    done(null, code);
  } catch (err) {
    console.error('[Grant] Error:', err);
    done(err);
  }
}));

// Exchange code for token
server.exchange(oauth2orize.exchange.code(async (client, code, redirectUri, done) => {
  try {
    console.log('[Token Exchange] Client ID:', client?.clientId || 'null');
    console.log('[Token Exchange] Received code:', code);
    console.log('[Token Exchange] Redirect URI:', redirectUri);

    if (!client) {
      console.error('[Token Exchange] Client is null. Cannot proceed.');
      return done(null, false);
    }

    const authCode = await AuthorizationCode.findOne({ code });
    console.log('[Token Exchange] Fetched authCode:', authCode ? 'found' : 'null');

    if (!authCode) {
      console.error('[Token Exchange] Authorization code not found.');
      return done(null, false);
    }

    if (authCode.clientId !== client.clientId) {
      console.error('[Token Exchange] Client ID mismatch. Expected:', authCode.clientId, 'Got:', client.clientId);
      return done(null, false);
    }

    if (authCode.redirectUri !== redirectUri) {
      console.error('[Token Exchange] Redirect URI mismatch. Expected:', authCode.redirectUri, 'Got:', redirectUri);
      return done(null, false);
    }

    if (new Date() > authCode.expiresAt) {
      console.error('[Token Exchange] Authorization code has expired.');
      return done(null, false);
    }

    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');

    await AccessToken.create({
      accessToken,
      refreshToken,
      user: authCode.user,
      clientId: client.clientId,
      scope: authCode.scope,
      issuedAt: new Date(),
      expiresIn: 3600, // 1 hour in seconds
    });

    await AuthorizationCode.deleteOne({ _id: authCode._id });
    console.log('[Token Exchange] Token issued successfully.');

    done(null, accessToken, refreshToken, { expires_in: 3600 });
  } catch (err) {
    console.error('[Token Exchange] ERROR:', err);
    done(err);
  }
}));

// Refresh token exchange
server.exchange(oauth2orize.exchange.refreshToken(async (client, refreshToken, scope, done) => {
  try {
    console.log('[Refresh Token Exchange] Refresh token:', refreshToken);

    const token = await AccessToken.findOne({ refreshToken });
    if (!token) {
      console.error('[Refresh Token Exchange] Token not found.');
      return done(null, false);
    }

    if (token.clientId !== client.clientId) {
      console.error('[Refresh Token Exchange] Client ID mismatch.');
      return done(null, false);
    }

    token.accessToken = crypto.randomBytes(32).toString('hex');
    token.refreshToken = crypto.randomBytes(32).toString('hex');
    token.issuedAt = new Date();
    token.expiresIn = 3600;

    await token.save();

    console.log('[Refresh Token Exchange] Token refreshed successfully.');
    done(null, token.accessToken, token.refreshToken, { expires_in: 3600 });
  } catch (err) {
    console.error('[Refresh Token Exchange] ERROR:', err);
    done(err);
  }
}));

export default server;
