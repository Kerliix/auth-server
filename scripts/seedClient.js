import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OAuthClient from '../models/OAuthClient.js';

dotenv.config();

const seedClients = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const clients = [
    {
      name: 'Test App',
      clientId: 'abc123',
      clientSecret: 'secret456',
      redirectUris: ['http://localhost:5000/callback'],
      scopes: ['openid', 'profile', 'email'],
    },
    {
      name: 'Mobile App',
      clientId: 'mobileapp',
      clientSecret: 'mobsecret',
      redirectUris: ['myapp://callback'],
      scopes: ['openid', 'profile'],
    },
  ];

  for (const c of clients) {
    const existing = await OAuthClient.findOne({ clientId: c.clientId });
    if (!existing) {
      await OAuthClient.create(c);
      console.log(`Client "${c.name}" created.`);
    } else {
      console.log(`Client "${c.name}" already exists.`);
    }
  }

  await mongoose.disconnect();
};

seedClients().catch(console.error);
