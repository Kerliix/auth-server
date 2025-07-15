import jwt from 'jsonwebtoken';
import AccessToken from '../models/AccessToken.js';

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
