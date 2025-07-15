import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OAuthClient from '../models/OAuthClient.js';
import AuthorizationCode from '../models/AuthorizationCode.js';
import AccessToken from '../models/AccessToken.js';

export const getAuthorizePage = async (req, res) => {
  const { client_id, redirect_uri, scope, state } = req.query;

  const client = await OAuthClient.findOne({ clientId: client_id });
  if (!client || !client.redirectUris.includes(redirect_uri)) {
    return res.status(400).send('Invalid client or redirect URI');
  }

  if (!req.session.userId) {
    return res.redirect(`/auth/login?next=${req.originalUrl}`);
  }

  const user = await User.findById(req.session.userId);
  res.render('oauth/authorize', {
    title: 'Authorize',
    client,
    scope,
    state,
    redirect_uri,
    user,
  });
};

export const postAuthorizeDecision = async (req, res) => {
  const { approve, client_id, redirect_uri, scope, state } = req.body;

  if (!approve) {
    return res.redirect(`${redirect_uri}?error=access_denied&state=${state}`);
  }

  const code = crypto.randomBytes(16).toString('hex');
  await AuthorizationCode.create({
    code,
    user: req.session.userId,
    clientId: client_id,
    redirectUri: redirect_uri,
    scope,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  res.redirect(`${redirect_uri}?code=${code}&state=${state}`);
};

export const issueToken = async (req, res) => {
  const { code, client_id, client_secret, redirect_uri, grant_type } = req.body;

  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }

  const client = await OAuthClient.findOne({ clientId: client_id });
  if (!client || client.clientSecret !== client_secret) {
    return res.status(401).json({ error: 'invalid_client' });
  }

  const authCode = await AuthorizationCode.findOne({ code });
  if (!authCode || authCode.clientId !== client_id || authCode.redirectUri !== redirect_uri || new Date() > authCode.expiresAt) {
    return res.status(400).json({ error: 'invalid_grant' });
  }

  const accessToken = crypto.randomBytes(32).toString('hex');
  const refreshToken = crypto.randomBytes(32).toString('hex');

  await AccessToken.create({
    accessToken,
    refreshToken,
    user: authCode.user,
    clientId: client_id,
    scope: authCode.scope,
    issuedAt: new Date(),
    expiresIn: 3600,
  });

  await AuthorizationCode.deleteOne({ _id: authCode._id });

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: refreshToken,
    scope: authCode.scope,
  });
};

export const issueToken = async (req, res) => {
  const { grant_type } = req.body;

  if (grant_type === 'authorization_code') {
    const { code, client_id, client_secret, redirect_uri } = req.body;

    const client = await OAuthClient.findOne({ clientId: client_id });
    if (!client || client.clientSecret !== client_secret) {
      return res.status(401).json({ error: 'invalid_client' });
    }

    const authCode = await AuthorizationCode.findOne({ code });
    if (!authCode || authCode.clientId !== client_id || authCode.redirectUri !== redirect_uri || new Date() > authCode.expiresAt) {
      return res.status(400).json({ error: 'invalid_grant' });
    }

    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');

    await AccessToken.create({
      accessToken,
      refreshToken,
      user: authCode.user,
      clientId: client_id,
      scope: authCode.scope,
      issuedAt: new Date(),
      expiresIn: 3600,
    });

    await AuthorizationCode.deleteOne({ _id: authCode._id });

    // OIDC id_token (if scope includes 'openid')
    let id_token;
    if (authCode.scope.includes('openid')) {
      const user = await User.findById(authCode.user);
      id_token = jwt.sign(
        {
          sub: user._id.toString(),
          email: user.email,
          name: user.firstName + ' ' + user.lastName,
          aud: client_id,
          iss: process.env.OAUTH_ISSUER || 'http://localhost:3000',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        process.env.JWT_SECRET,
        { algorithm: 'HS256' }
      );
    }

    return res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: authCode.scope,
      ...(id_token ? { id_token } : {}),
    });
  } 
  else if (grant_type === 'refresh_token') {
    const { refresh_token, client_id, client_secret } = req.body;
    const client = await OAuthClient.findOne({ clientId: client_id });
    if (!client || client.clientSecret !== client_secret) {
      return res.status(401).json({ error: 'invalid_client' });
    }

    const token = await AccessToken.findOne({ refreshToken: refresh_token });
    if (!token || token.clientId !== client_id) {
      return res.status(400).json({ error: 'invalid_grant' });
    }

    const newAccessToken = crypto.randomBytes(32).toString('hex');
    const newRefreshToken = crypto.randomBytes(32).toString('hex');

    token.accessToken = newAccessToken;
    token.refreshToken = newRefreshToken;
    token.issuedAt = new Date();
    token.expiresIn = 3600;
    await token.save();

    // OIDC id_token for refresh token grant (if requested, you can extend here)

    return res.json({
      access_token: newAccessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: newRefreshToken,
      scope: token.scope,
    });
  } else {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }
};

export const registerClient = async (req, res) => {
  const { name, redirectUris, scopes } = req.body;

  if (!name || !redirectUris) {
    return res.status(400).json({ error: 'name and redirectUris are required' });
  }

  const clientId = crypto.randomBytes(12).toString('hex');
  const clientSecret = crypto.randomBytes(24).toString('hex');

  try {
    const client = await OAuthClient.create({
      name,
      clientId,
      clientSecret,
      redirectUris: Array.isArray(redirectUris) ? redirectUris : [redirectUris],
      scopes: scopes ? (Array.isArray(scopes) ? scopes : [scopes]) : [],
    });

    res.status(201).json({
      client_id: client.clientId,
      client_secret: client.clientSecret,
      redirect_uris: client.redirectUris,
      scopes: client.scopes,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register client' });
  }
};

export const userInfo = async (req, res) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'invalid_request', error_description: 'Missing Bearer token' });
  }

  const tokenString = auth.slice('Bearer '.length);
  const token = await AccessToken.findOne({ accessToken: tokenString }).populate('user');

  if (!token) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  if (new Date() > new Date(token.issuedAt.getTime() + token.expiresIn * 1000)) {
    return res.status(401).json({ error: 'invalid_token', error_description: 'Token expired' });
  }

  const user = token.user;

  // Return user info based on scope
  const response = {};
  if (token.scope.includes('profile')) {
    response.name = user.firstName + ' ' + user.lastName;
    response.family_name = user.lastName;
    response.given_name = user.firstName;
    response.birthdate = user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : undefined;
    response.gender = user.sex;
  }
  if (token.scope.includes('email')) {
    response.email = user.email;
  }

  res.json(response);
};

export const revokeToken = async (req, res) => {
  const { token, token_type_hint } = req.body;
  const authHeader = req.headers.authorization || '';
  // Basic Auth for client authentication (clientId:clientSecret)
  const basicPrefix = 'Basic ';
  if (!authHeader.startsWith(basicPrefix)) {
    return res.status(401).json({ error: 'invalid_client' });
  }
  const base64Credentials = authHeader.slice(basicPrefix.length);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [clientId, clientSecret] = credentials.split(':');

  const client = await OAuthClient.findOne({ clientId });
  if (!client || client.clientSecret !== clientSecret) {
    return res.status(401).json({ error: 'invalid_client' });
  }

  // Find and delete token
  let tokenDoc;
  if (token_type_hint === 'refresh_token') {
    tokenDoc = await AccessToken.findOne({ refreshToken: token });
  } else {
    // default to access_token
    tokenDoc = await AccessToken.findOne({ accessToken: token });
  }

  if (tokenDoc && tokenDoc.clientId === clientId) {
    await AccessToken.deleteOne({ _id: tokenDoc._id });
  }

  // Per spec, respond 200 even if token not found
  res.status(200).send();
};
