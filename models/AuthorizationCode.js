// models/AuthorizationCode.js
import mongoose from 'mongoose';

const codeSchema = new mongoose.Schema({
  code: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientId: String,
  redirectUri: String,
  scope: String,
  expiresAt: Date,
  codeChallenge: String, 
  codeChallengeMethod: String, 
});

export default mongoose.model('AuthorizationCode', codeSchema);
