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
    done(null, client);
  } catch (err) {
    done(err);
  }
});

// Grant authorization code
server.grant(oauth2orize.grant.code(async (client, redirectUri, user, ares, done) => {
  try {
    if (!user) {
      return done(new Error('User is undefined in grant handler. Make sure req.user is set via middleware.'));
    }

    const code = crypto.randomBytes(16).toString('hex');
    await AuthorizationCode.create({
      code,
      clientId: client.clientId,
      redirectUri,
      user: user._id,
      scope: ares.scope,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins expiry
    });

    done(null, code);
  } catch (err) {
    done(err);
  }
}));

// Exchange code for token
server.exchange(oauth2orize.exchange.code(async (client, code, redirectUri, done) => {
  try {
    const authCode = await AuthorizationCode.findOne({ code });

    if (
      !authCode ||
      authCode.clientId !== client.clientId ||
      authCode.redirectUri !== redirectUri ||
      new Date() > authCode.expiresAt
    ) {
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
      expiresIn: 3600,
    });

    await AuthorizationCode.deleteOne({ _id: authCode._id });

    done(null, accessToken, refreshToken, { expires_in: 3600 });
  } catch (err) {
    done(err);
  }
}));

// Refresh token exchange
server.exchange(oauth2orize.exchange.refreshToken(async (client, refreshToken, scope, done) => {
  try {
    const token = await AccessToken.findOne({ refreshToken });

    if (!token || token.clientId !== client.clientId) {
      return done(null, false);
    }

    token.accessToken = crypto.randomBytes(32).toString('hex');
    token.refreshToken = crypto.randomBytes(32).toString('hex');
    token.issuedAt = new Date();
    token.expiresIn = 3600;

    await token.save();

    done(null, token.accessToken, token.refreshToken, { expires_in: 3600 });
  } catch (err) {
    done(err);
  }
}));

export default server;
