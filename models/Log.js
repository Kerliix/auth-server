// models/Log.js
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  level: { type: String, required: true }, // error, info, warn, etc.
  type: { type: String }, // optional: LOGIN_SUCCESS, PASSWORD_RESET, etc.
  message: { type: String, required: true },
  metadata: { type: Object }, // optional additional info
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Log', logSchema);
