import jwt from 'jsonwebtoken';
import AccessToken from '../models/AccessToken.js';

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