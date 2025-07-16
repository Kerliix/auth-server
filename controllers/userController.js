import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { sendVerificationEmail } from '../services/emailService.js';

export const getDashboard = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect('/auth/login');
  res.render('user/dashboard', { title: 'Dashboard', user });
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect('/auth/login');
  res.render('user/profile', {
    title: 'Profile',
    user,
    session: req.session,
    error: req.session.error,
    success: req.session.success
  });
  req.session.error = null;
  req.session.success = null;
};

// New controller to render Edit Profile page
export const getEditProfile = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect('/auth/login');
  res.render('user/edit-profile', {
    title: 'Edit Profile',
    user,
    error: null,
    success: null,
    session: req.session
  });
};

export const getChangeProfilePic = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect('/auth/login');

  res.render('user/change-profile-pic', {
    title: 'Change Profile Picture',
    user,
    error: null,
    success: null,
    session: req.session
  });
};

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

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.session.userId);
  const match = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!match) {
    return res.render('user/profile', {
      title: 'Profile',
      user,
      error: 'Current password is incorrect',
      session: req.session
    });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.render('user/profile', {
    title: 'Profile',
    user,
    success: 'Password updated successfully',
    session: req.session
  });
};

export const changeEmail = async (req, res) => {
  const { newEmail } = req.body;
  const user = await User.findById(req.session.userId);
  const code = Math.floor(10000000 + Math.random() * 90000000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  user.emailVerificationCode = code;
  user.emailVerificationExpires = expires;
  await user.save();

  await sendVerificationEmail(newEmail, code);
  req.session.pendingEmail = newEmail;

  res.render('user/profile', {
    title: 'Profile',
    user,
    success: 'Verification code sent to new email',
    session: req.session
  });
};

export const verifyNewEmail = async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.session.userId);

  if (
    user.emailVerificationCode !== code ||
    !req.session.pendingEmail ||
    new Date() > new Date(user.emailVerificationExpires)
  ) {
    req.session.error = 'Invalid or expired code';
    return res.redirect('/user/profile');
  }

  user.email = req.session.pendingEmail;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  delete req.session.pendingEmail;
  req.session.success = 'Email address updated';
  res.redirect('/user/profile');
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.session.userId);
  const {
    firstName, lastName, dateOfBirth, sex, countryCode, phoneNumber
  } = req.body;

  user.firstName = firstName;
  user.lastName = lastName;
  user.dateOfBirth = dateOfBirth;
  user.sex = sex;
  user.countryCode = countryCode;
  user.phoneNumber = phoneNumber;

  if (req.file) {
    user.profilePicUrl = `/uploads/${req.file.filename}`;
  }

  await user.save();
  res.render('user/profile', {
    title: 'Profile',
    user,
    success: 'Profile updated successfully',
    session: req.session
  });
};

export const deleteAccount = async (req, res) => {
  const userId = req.session.userId;
  await User.findByIdAndDelete(userId);
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
