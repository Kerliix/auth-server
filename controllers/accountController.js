import bcrypt from 'bcrypt';
import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import {
  sendAccountDeactivatedEmail,
  sendUsernameChangedEmail,
  sendAccountDeletedEmail
} from '../services/emailService.js';

export const getAccountSettings = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect('/auth/login');
  res.render('account/settings', {
    title: 'Account Settings',
    user,
    error: null,
    success: null
  });
};

export const changeUsername = async (req, res) => {
  const userId = req.session.userId;
  const { newUsername } = req.body;

  if (!newUsername || newUsername.length < 3) {
    return res.render('account/settings', {
      title: 'Account Settings',
      user: await User.findById(userId),
      error: 'Username must be at least 3 characters.',
      success: null
    });
  }

  const existing = await User.findOne({ username: newUsername });
  if (existing) {
    return res.render('account/settings', {
      title: 'Account Settings',
      user: await User.findById(userId),
      error: 'Username already taken.',
      success: null
    });
  }

  const user = await User.findById(userId);
  const oldUsername = user.username;

  user.username = newUsername;
  await user.save();

  await sendUsernameChangedEmail(user.email, oldUsername, newUsername);

  res.render('account/settings', {
    title: 'Account Settings',
    user,
    success: 'Username updated successfully',
    error: null
  });
};

export const getDevices = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect('/auth/login');

  const devices = await LoginLog.find({ userId: user._id, isActive: true })
    .sort({ time: -1 });

  res.render('account/devices', {
    title: 'Devices',
    user,
    devices,
    currentSessionId: req.session.sessionId
  });
};

export const getMyApps = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect('/auth/login');
  res.render('account/my-apps', { title: 'My Apps', user });
};

export const deactivateAccount = async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId);
  if (!user) return res.redirect('/auth/login');

  user.deactivated = true;
  await user.save();

  await sendAccountDeactivatedEmail(user.email);

  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

export const deleteAccount = async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId);
  if (user) {
    await sendAccountDeletedEmail(user.email);
    await User.findByIdAndDelete(userId);
  }
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
