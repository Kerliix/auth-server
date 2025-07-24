import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import logger from '../config/logger.js';
import {
  sendLogoutEmail,
  sendAutoLogoutEmail
} from '../services/emailService.js';

const AUTO_LOGOUT_DAYS = 7;

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0] || req.ip;

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
