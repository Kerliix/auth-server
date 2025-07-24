import mongoose from 'mongoose';

const accessTokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true, unique: true },
  refreshToken: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: String, required: true },
  scope: { type: String },
  issuedAt: { type: Date, required: true },
  expiresIn: { type: Number, required: true }, // in seconds
  refreshExpiresAt: { type: Date }, // optional: for refresh token expiration
}, { timestamps: true });

export default mongoose.model('AccessToken', accessTokenSchema);
