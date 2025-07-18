import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['email', 'phone', 'identity'], required: true },
  status: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  verifiedAt: Date,
});

export default mongoose.model('Verification', verificationSchema);
