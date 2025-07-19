// middleware/clientAuth.js
import OAuthClient from '../models/OAuthClient.js';
import base64 from 'base-64';

export async function authenticateClient(req, res, next) {
  let clientId, clientSecret;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Basic ')) {
    const decoded = base64.decode(authHeader.split(' ')[1]);
    [clientId, clientSecret] = decoded.split(':');
    console.log('[ClientAuth] Parsed from Basic Auth:', clientId);
  } else {
    clientId = req.body.client_id;
    clientSecret = req.body.client_secret;
    console.log('[ClientAuth] Parsed from body:', clientId);
  }

  if (!clientId || !clientSecret) {
    console.error('[ClientAuth] Missing client_id or client_secret');
    return res.status(401).json({ error: 'invalid_client', error_description: 'Missing client credentials' });
  }

  try {
    const client = await OAuthClient.findOne({ clientId });

    if (!client) {
      console.error('[ClientAuth] Client not found:', clientId);
      return res.status(401).json({ error: 'invalid_client', error_description: 'Client not found' });
    }

    if (client.clientSecret !== clientSecret) {
      console.error('[ClientAuth] Invalid client secret for:', clientId);
      return res.status(401).json({ error: 'invalid_client', error_description: 'Invalid client credentials' });
    }

    console.log('[ClientAuth] Client authenticated:', clientId);
    req.oauth2 = { client }; // inject into request
    next();
  } catch (err) {
    console.error('[ClientAuth] Error authenticating client:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
