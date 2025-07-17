import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import bcrypt from 'bcrypt';
import geoip from 'geoip-lite';
import { authenticator } from 'otplib';
import { v4 as uuidv4 } from 'uuid';
import { UAParser } from 'ua-parser-js';
import logger from '../config/logger.js';
import { sendSms } from '../services/smsService.js';
import {
  sendMfaEmail,
  sendLoginNotificationEmail,
  sendLogoutEmail,
  sendAutoLogoutEmail
} from '../services/emailService.js';

const AUTO_LOGOUT_DAYS = 7;

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0] || req.ip;

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
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials',
        success: null,
        user: {}
      });
    }

    if (user.deactivated) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Your account is deactivated. Contact support.',
        success: null,
        user: {}
      });
    }

    if (!user.mfa?.isEnabled) {
      const sessionId = uuidv4();
      req.session.sessionId = sessionId;
      return await handleSuccessfulLogin(req, res, user, sessionId);
    }

    req.session.mfaUserId = user._id;
    req.session.mfaMethod = user.mfa.method;
    req.session.mfaAttempts = 0;

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

    req.session.mfaAttempts = (req.session.mfaAttempts || 0) + 1;
    if (req.session.mfaAttempts > 5) {
      return res.render('auth/mfa', {
        title: 'Verify MFA',
        error: 'Too many attempts, please try again later.',
        method: req.session.mfaMethod
      });
    }

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

    delete req.session.mfaUserId;
    delete req.session.mfaMethod;
    delete req.session.mfaAttempts;

    const sessionId = uuidv4();
    req.session.sessionId = sessionId;

    return await handleSuccessfulLogin(req, res, user, sessionId);
  } catch (err) {
    logger.error('Error in postMfa:', err);
    res.status(500).send('Server error');
  }
};

const handleSuccessfulLogin = async (req, res, user, sessionId) => {
  const ip = getClientIp(req);
  const geo = geoip.lookup(ip);
  const location = geo ? `${geo.city || 'Unknown'}, ${geo.country || 'N/A'}` : 'Unknown';

  const userAgentString = req.headers['user-agent'];
  const parser = new UAParser(userAgentString);
  const ua = parser.getResult();

  const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`;
  const os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`;
  let device = 'Unknown Device';

  if (ua.device.vendor || ua.device.model) {
    device = `${ua.device.vendor || ''} ${ua.device.model || ''}`.trim();
  } else if (ua.os.name) {
    device = `${ua.os.name} ${ua.os.version || ''}`.trim();
  }

  const time = new Date();

  req.session.userId = user._id;
  req.session.sessionId = sessionId;

  user.lastLogin = time;
  await user.save();

  await LoginLog.create({
    userId: user._id,
    sessionId,
    ip,
    location,
    device,
    browser,
    os,
    time,
    isActive: true
  });

  await sendLoginNotificationEmail(user.email, { ip, location, device, browser, os, time });

  const cutoff = new Date(Date.now() - AUTO_LOGOUT_DAYS * 24 * 60 * 60 * 1000);

  const expiredSessions = await LoginLog.find({
    userId: user._id,
    isActive: true,
    time: { $lt: cutoff }
  });

  for (const session of expiredSessions) {
    await LoginLog.findByIdAndUpdate(session._id, { isActive: false });

    await sendAutoLogoutEmail(user.email, {
      ip: session.ip,
      location: session.location,
      device: session.device,
      browser: session.browser,
      os: session.os,
      time: session.time.toUTCString()
    });
  }

  const redirectTo = req.session.redirectAfterLogin || '/user/dashboard';
  delete req.session.redirectAfterLogin;
  res.redirect(redirectTo);
};

export const logout = async (req, res) => {
  try {
    const userId = req.session.userId;
    const sessionId = req.session.sessionId;
    const user = await User.findById(userId);

    const ip = getClientIp(req);
    const geo = geoip.lookup(ip);
    const location = geo ? `${geo.city || 'Unknown'}, ${geo.country || 'N/A'}` : 'Unknown';

    const userAgentString = req.headers['user-agent'];
    const parser = new UAParser(userAgentString);
    const ua = parser.getResult();

    const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`;
    const os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`;
    let device = 'Unknown Device';

    if (ua.device.vendor || ua.device.model) {
      device = `${ua.device.vendor || ''} ${ua.device.model || ''}`.trim();
    } else if (ua.os.name) {
      device = `${ua.os.name} ${ua.os.version || ''}`.trim();
    }

    const time = new Date();

    if (user && sessionId) {
      await LoginLog.findOneAndUpdate(
        { userId, sessionId },
        { isActive: false }
      );

      await sendLogoutEmail(user.email, { ip, location, device, browser, os, time });
    }
  } catch (err) {
    logger.error('Error in logout:', err);
  }

  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
