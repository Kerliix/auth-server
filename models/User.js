// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },

  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationCode: String,
  emailVerificationExpires: Date,

  // Personal details
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  sex: {
    type: String,
    enum: ['male', 'female', 'other'],
  },

  // Optional phone number
  countryCode: String,
  phoneNumber: String,

  // Optional profile picture
  profilePicUrl: String,

  // OAuth support
  oauth: {
    isOAuthUser: {
      type: Boolean,
      default: false,
    },
    clientId: String,
    scopes: [String],
    redirectUris: [String],
    tokens: [{
      accessToken: String,
      refreshToken: String,
      issuedAt: Date,
      expiresIn: Number,
      scope: String,
    }],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', userSchema);
