// controllers/authController.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import logger from '../config/logger.js';
import { sendVerificationEmail } from '../services/emailService.js';

const hashPassword = async (password) => await bcrypt.hash(password, 12);

// Step 1: Email, Username, Password
export const getRegisterStep1 = (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    error: null,
    success: null,
    user: req.session.tempUser || {}
  });
};

export const postRegisterStep1 = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('auth/register', {
        error: 'Email or Username already exists',
        title: 'Register',
        success: null,
        user: { email, username }
      });
    }

    const passwordHash = await hashPassword(password);
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    req.session.tempUser = {
      email,
      username,
      passwordHash,
      emailVerificationCode: code,
      emailVerificationExpires: expires
    };
    await sendVerificationEmail(email, code);

    res.redirect('/auth/register/verify');
  } catch (err) {
    logger.error('❌ Error in postRegisterStep1:', err);
    res.status(500).send('Server error');
  }
};

// Step 2: Verify code
export const getVerifyEmail = (req, res) => {
  res.render('auth/verify-email', {
    title: 'Verify Email',
    error: null,
    success: null,
    user: req.session.tempUser || {}
  });
};

export const postVerifyEmail = (req, res) => {
  try {
    const { code } = req.body;
    const temp = req.session.tempUser;
    if (!temp || temp.emailVerificationCode !== code || new Date() > new Date(temp.emailVerificationExpires)) {
      return res.render('auth/verify-email', {
        error: 'Invalid or expired code',
        title: 'Verify Email',
        success: null,
        user: temp || {}
      });
    }
    temp.isEmailVerified = true;
    res.redirect('/auth/register/details');
  } catch (err) {
    logger.error('Error in postVerifyEmail:', err);
    res.status(500).send('Server error');
  }
};

// Step 3: Name, DOB, Sex
export const getRegisterDetails = (req, res) => {
  res.render('auth/basic-profile', {
    title: 'Your Details',
    error: null,
    success: null,
    user: req.session.tempUser || {}
  });
};

export const postRegisterDetails = (req, res) => {
  if (!req.session.tempUser) {
    return res.redirect('/auth/register');
  }
  try {
    const { firstName, lastName, dateOfBirth, sex } = req.body;
    req.session.tempUser = {
      ...req.session.tempUser,
      firstName,
      lastName,
      dateOfBirth,
      sex,
    };
    res.redirect('/auth/register/phone');
  } catch (err) {
    logger.error('Error in postRegisterDetails:', err);
    res.status(500).send('Server error');
  }
};

// Step 4: Phone (optional)
export const getPhoneStep = (req, res) => {
  res.render('auth/phone-number', {
    title: 'Add Phone',
    error: null,
    success: null,
    user: req.session.tempUser || {}
  });
};

export const postPhoneStep = (req, res) => {
  if (!req.session.tempUser) {
    return res.redirect('/auth/register');
  }
  try {
    const { countryCode, phoneNumber } = req.body;
    req.session.tempUser = {
      ...req.session.tempUser,
      countryCode,
      phoneNumber,
    };
    res.redirect('/auth/register/profile-pic');
  } catch (err) {
    logger.error('Error in postPhoneStep:', err);
    res.status(500).send('Server error');
  }
};

// Step 5: Profile pic (optional)
export const getProfilePicStep = (req, res) => {
  const tempUser = req.session.tempUser || {};
  res.render('auth/add-profile-pic', {
    title: 'Profile Picture',
    error: null,
    success: null,
    user: {
      firstName: tempUser.firstName || '',
      lastName: tempUser.lastName || '',
      profilePicUrl: tempUser.profilePicUrl || null,
    }
  });
};

export const postProfilePicStep = async (req, res) => {
  if (!req.session.tempUser) {
    return res.redirect('/auth/register');
  }

  try {
    const profilePicUrl = req.file ? `/uploads/${req.file.filename}` : null;

    req.session.tempUser = {
      ...req.session.tempUser,
      profilePicUrl,
    };

    const newUser = new User(req.session.tempUser);
    await newUser.save();

    req.session.userId = newUser._id;
    delete req.session.tempUser;

    res.redirect('/user/dashboard');
  } catch (err) {
    logger.error('Error in postProfilePicStep (saving user):', err);
    res.status(500).render('auth/add-profile-pic', {
      title: 'Profile Picture',
      error: 'Error saving user',
      success: null,
      user: req.session.tempUser || {},
    });
  }
};

// Login
export const getLogin = (req, res) => {
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
    req.session.userId = user._id;
    res.redirect('/user/dashboard');
  } catch (err) {
    logger.error('Error in postLogin:', err);
    res.status(500).send('Server error');
  }
};

// Logout
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
