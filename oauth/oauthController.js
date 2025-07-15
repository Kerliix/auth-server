import crypto from 'crypto';
import User from '../models/User.js';
import OAuthClient from '../models/OAuthClient.js';
import AuthorizationCode from '../models/AuthorizationCode.js';

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

