// models/OAuthClient.js
import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: String,
  clientId: { type: String, unique: true },
  clientSecret: String,
  redirectUris: [String],
  scopes: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('OAuthClient', clientSchema);
