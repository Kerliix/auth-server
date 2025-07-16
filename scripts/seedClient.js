import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import OAuthClient from '../models/OAuthClient.js';
import logger from '../config/logger.js';

dotenv.config();

const generateSecureString = (length = 32) => {
  // Generate a secure random string, hex-encoded
  return crypto.randomBytes(length).toString('hex');
};

const seedClients = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Define clients with names, redirectUris and scopes only — IDs and secrets generated dynamically
  const clients = [
    {
      name: 'Way',
      redirectUris: ['http://localhost:5000/auth/callback'],
      scopes: ['openid', 'profile', 'email'],
    },
    {
      name: 'client example',
      redirectUris: ['http://localhost:4000/auth/callback'],
      scopes: ['openid', 'profile'],
    },
  ];

  for (const client of clients) {
    // Check if client exists by name (or you can change criteria)
    const existing = await OAuthClient.findOne({ name: client.name });
    if (!existing) {
      // Generate secure clientId and clientSecret
      const clientId = generateSecureString(12); // 24 hex chars
      const clientSecret = generateSecureString(24); // 48 hex chars

      // Create new client document
      const newClient = await OAuthClient.create({
        name: client.name,
        clientId,
        clientSecret,
        redirectUris: client.redirectUris,
        scopes: client.scopes,
      });

      logger.info(`Client "${client.name}" created.`);
      logger.info('--- Client Credentials ---');
      logger.info(`Client ID: ${clientId}`);
      logger.info(`Client Secret: ${clientSecret}`);
      logger.info(`Redirect URIs: ${JSON.stringify(client.redirectUris)}`);
      logger.info(`Scopes: ${JSON.stringify(client.scopes)}`);
      logger.info('--------------------------');
    } else {
      logger.info(`Client "${client.name}" already exists.`);
      logger.info(`Client ID: ${existing.clientId}`);
      logger.info(`Redirect URIs: ${JSON.stringify(existing.redirectUris)}`);
      logger.info(`Scopes: ${JSON.stringify(existing.scopes)}`);
    }
  }

  await mongoose.disconnect();
};

seedClients().catch((err) => {
  logger.error('Error seeding clients:', err);
});
