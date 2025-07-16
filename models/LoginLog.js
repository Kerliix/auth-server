// models/LoginLog.js
import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ip: String,
  location: String,
  device: String,
  time: { type: Date, default: Date.now }
});

export default mongoose.model('LoginLog', loginLogSchema);
