import mongoose from 'mongoose';

const passwordResetRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  usedAt: Date,
});

export default mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
