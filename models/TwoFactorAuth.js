import mongoose from 'mongoose';

const twoFactorAuthSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  enabled: { type: Boolean, default: false },
  method: { type: String, enum: ['totp', 'sms', 'email'], default: 'totp' },
  secret: String, // for TOTP secrets or similar
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

export default mongoose.model('TwoFactorAuth', twoFactorAuthSchema);
