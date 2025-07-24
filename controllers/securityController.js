import qrcode from 'qrcode';
import { authenticator } from 'otplib';
import User from '../models/User.js';

export const getSecurity = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect('/auth/login');

  res.render('account/security', {
    title: 'Security',
    user,
    mfa: user.mfa,
    error: null,
    success: null
  });
};

export const updateMfaSettings = async (req, res) => {
  const user = await User.findById(req.session.userId);
  const { method, phoneNumber } = req.body;

  if (!method) {
    user.mfa.isEnabled = false;
    user.mfa.method = null;
  } else {
    user.mfa.isEnabled = true;
    user.mfa.method = method;

    if (method === 'TOTP') {
      const { authenticator } = require('otplib');
      user.mfa.totpSecret = authenticator.generateSecret();
      // Show QR code setup on frontend
    }

    if (method === 'SMS') {
      user.mfa.phoneNumber = phoneNumber;
      // Verify phone if needed
    }
  }

  await user.save();
  req.session.success = 'MFA settings updated';
  res.redirect('/user/security');
};

export const getTotpSetup = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect('/auth/login');

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, 'Kerliix', secret);

  // Save secret to session temporarily until they confirm
  req.session.tempTotpSecret = secret;

  const qrImageUrl = await qrcode.toDataURL(otpauth);

  res.render('account/totp-setup', {
    title: 'Set Up TOTP',
    qrImageUrl,
    secret,
    user
  });
};

export const verifyTotpSetup = async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.session.userId);
  const secret = req.session.tempTotpSecret;

  if (!user || !secret) return res.redirect('/user/security');

  const isValid = authenticator.check(token, secret);
  if (!isValid) {
    return res.render('user/totp-setup', {
      title: 'Set Up TOTP',
      qrImageUrl: null,
      secret,
      error: 'Invalid TOTP code. Try again.',
      user
    });
  }

  // Save TOTP to user
  user.mfa = {
    isEnabled: true,
    method: 'TOTP',
    totpSecret: secret,
  };
  await user.save();

  delete req.session.tempTotpSecret;
  req.session.success = 'TOTP MFA setup complete.';
  res.redirect('/user/security');
};