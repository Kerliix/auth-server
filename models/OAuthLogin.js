import mongoose from 'mongoose';

const oauthLoginSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // optional, may be null for failed attempts
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthClient' },
  success: { type: Boolean, default: true },
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
  failureReason: String, // present only if success is false
});

export default mongoose.model('OAuthLogin', oauthLoginSchema);
