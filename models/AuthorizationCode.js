import mongoose from 'mongoose';

const authorizationCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  redirectUri: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scope: { type: String },
  codeChallenge: { type: String },
  codeChallengeMethod: {
    type: String,
    enum: ['plain', 'S256'],
    default: 'plain',
  },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('AuthorizationCode', authorizationCodeSchema);
