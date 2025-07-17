import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  ip: String,
  location: String,
  device: String,
  browser: String,
  os: String,
  time: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model('LoginLog', loginLogSchema);
