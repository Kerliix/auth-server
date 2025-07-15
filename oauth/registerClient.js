import jwt from 'jsonwebtoken';

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
