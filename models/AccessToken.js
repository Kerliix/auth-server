// models/AccessToken.js
import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  accessToken: String,
  refreshToken: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientId: String,
  scope: String,
  issuedAt: Date,
  expiresIn: Number,
});

export default mongoose.model('AccessToken', tokenSchema);
