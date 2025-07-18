// services/loginLogger.js
import LoginLog from '../models/LoginLog.js';
import {
  sendLoginNotificationEmail,
  sendAutoLogoutEmail,
  sendLogoutEmail
} from './emailService.js';

const AUTO_LOGOUT_DAYS = 7;

export async function logLogin(user, sessionId, reqInfo) {
  const time = new Date();

  user.lastLogin = time;
  await user.save();

  await LoginLog.create({
    userId: user._id,
    sessionId,
    ip: reqInfo.ip,
    location: reqInfo.location,
    device: reqInfo.device,
    browser: reqInfo.browser,
    os: reqInfo.os,
    time,
    isActive: true
  });

  await sendLoginNotificationEmail(user.email, {
    ...reqInfo,
    time
  });

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
}

export async function logLogout(userId, sessionId, userEmail, reqInfo) {
  await LoginLog.findOneAndUpdate(
    { userId, sessionId },
    { isActive: false }
  );

  await sendLogoutEmail(userEmail, {
    ...reqInfo,
    time: new Date()
  });
}
