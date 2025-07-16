import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import bcrypt from 'bcrypt';
import geoip from 'geoip-lite';
import logger from '../config/logger.js';
import { sendMfaEmail, sendLoginNotificationEmail } from '../services/emailService.js';
import { sendSms } from '../services/smsService.js';
import { authenticator } from 'otplib';

// --- LOGIN ---

export const getLogin = (req, res) => {
  if (!req.query.continue) {
    delete req.session.redirectAfterLogin;
  }

  res.render('auth/login', {
    title: 'Login',
    error: null,
    success: null,
    user: {}
  });
};

export const postLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials',
        success: null,
        user: {}
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials',
        success: null,
        user: {}
      });
    }

    // --- MFA Handling ---
    if (!user.mfa?.isEnabled) {
      req.session.userId = user._id;

      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
      const geo = geoip.lookup(ip);
      const location = geo ? `${geo.city || 'Unknown'}, ${geo.country || 'N/A'}` : 'Unknown';
      const device = req.headers['user-agent'];
      const time = new Date().toUTCString();

      // Update user last login
      user.lastLogin = new Date();
      await user.save();

      // Log to database
      await LoginLog.create({
        userId: user._id,
        ip,
        location,
        device,
        time: new Date()
      });

      await sendLoginNotificationEmail(user.email, { ip, location, device, time });

      const redirectTo = req.session.redirectAfterLogin || '/user/dashboard';
      delete req.session.redirectAfterLogin;
      return res.redirect(redirectTo);
    }

    // Store MFA session
    req.session.mfaUserId = user._id;
    req.session.mfaMethod = user.mfa.method;

    // Generate and send MFA code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (user.mfa.method === 'EMAIL') {
      user.mfa.emailOTP = code;
      user.mfa.emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendMfaEmail(user.email, code);
    } else if (user.mfa.method === 'SMS') {
      user.mfa.smsOTP = code;
      user.mfa.smsOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendMfaEmail(user.email, code);
      await sendSms(user.mfa.phoneNumber, `Your login code is: ${code}`);
    }

    return res.redirect('/auth/mfa');

  } catch (err) {
    logger.error('Error in postLogin:', err);
    res.status(500).send('Server error');
  }
};

export const getMfa = (req, res) => {
  res.render('auth/mfa', {
    title: 'Verify MFA',
    error: null,
    method: req.session.mfaMethod
  });
};

export const postMfa = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.session.mfaUserId);
    if (!user) return res.redirect('/auth/login');

    const now = new Date();
    let isValid = false;

    if (user.mfa.method === 'EMAIL') {
      isValid = user.mfa.emailOTP === code && now < user.mfa.emailOTPExpires;
    } else if (user.mfa.method === 'SMS') {
      isValid = user.mfa.smsOTP === code && now < user.mfa.smsOTPExpires;
    } else if (user.mfa.method === 'TOTP') {
      authenticator.options = { step: 30 };
      isValid = authenticator.check(code, user.mfa.totpSecret);
    }

    if (!isValid) {
      return res.render('auth/mfa', {
        title: 'Verify MFA',
        error: 'Invalid or expired code',
        method: req.session.mfaMethod
      });
    }

    req.session.userId = user._id;
    delete req.session.mfaUserId;
    delete req.session.mfaMethod;
    delete req.session.mfaAttempts;

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const geo = geoip.lookup(ip);
    const location = geo ? `${geo.city || 'Unknown'}, ${geo.country || 'N/A'}` : 'Unknown';
    const device = req.headers['user-agent'];
    const time = new Date().toUTCString();

    // Update user last login
    user.lastLogin = new Date();
    await user.save();

    // Log to database
    await LoginLog.create({
      userId: user._id,
      ip,
      location,
      device,
      time: new Date()
    });

    await sendLoginNotificationEmail(user.email, { ip, location, device, time });

    const redirectTo = req.session.redirectAfterLogin || '/user/dashboard';
    delete req.session.redirectAfterLogin;
    res.redirect(redirectTo);

  } catch (err) {
    logger.error('Error in postMfa:', err);
    res.status(500).send('Server error');
  }
};

// --- LOGOUT ---
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
