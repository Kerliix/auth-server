import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import logger from '../config/logger.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/emailService.js';
import { sendPhoneVerificationCode } from '../services/smsService.js';

const hashPassword = async (password) => await bcrypt.hash(password, 12);

// --- REGISTER ---

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

export const postRegisterDetails = async (req, res) => {
  if (!req.session.tempUser) return res.redirect('/auth/register');

  try {
    const { firstName, lastName, dateOfBirth, sex } = req.body;
    req.session.tempUser = {
      ...req.session.tempUser,
      firstName,
      lastName,
      dateOfBirth,
      sex,
    };

    // Send welcome email here after names are set
    await sendWelcomeEmail(req.session.tempUser.email, firstName, lastName);

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

export const postPhoneStep = async (req, res) => {
  if (!req.session.tempUser) return res.redirect('/auth/register');

  try {
    const { countryCode, phoneNumber } = req.body;

    // Generate phone verification code and expiry
    const phoneVerificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save phone and verification info in session
    req.session.tempUser = {
      ...req.session.tempUser,
      countryCode,
      phoneNumber,
      phoneVerificationCode,
      phoneVerificationExpires,
      phoneIsVerified: false
    };

    // Send SMS with code
    await sendPhoneVerificationCode(`${countryCode}${phoneNumber}`, phoneVerificationCode);

    // Redirect to phone verification page
    res.redirect('/auth/register/verify-phone');
  } catch (err) {
    logger.error('Error in postPhoneStep:', err);
    res.status(500).send('Server error');
  }
};

export const getVerifyPhone = (req, res) => {
  res.render('auth/verify-phone', {
    title: 'Verify Phone Number',
    error: null,
    success: null,
    user: req.session.tempUser || {}
  });
};

export const postVerifyPhone = (req, res) => {
  try {
    const { code } = req.body;
    const temp = req.session.tempUser;

    if (
      !temp ||
      temp.phoneVerificationCode !== code ||
      new Date() > new Date(temp.phoneVerificationExpires)
    ) {
      return res.render('auth/verify-phone', {
        error: 'Invalid or expired code',
        title: 'Verify Phone Number',
        success: null,
        user: temp || {}
      });
    }

    temp.phoneIsVerified = true;

    // Proceed to next step (profile pic)
    res.redirect('/auth/register/profile-pic');
  } catch (err) {
    logger.error('Error in postVerifyPhone:', err);
    res.status(500).send('Server error');
  }
};

// Step 5: Profile Pic (optional) + Create final user
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
  if (!req.session.tempUser) return res.redirect('/auth/register');

  try {
    const profilePicUrl = req.file ? `/uploads/${req.file.filename}` : null;

    req.session.tempUser = {
      ...req.session.tempUser,
      profilePicUrl,
    };

    // Build user data, including phone verification
    const userData = {
      email: req.session.tempUser.email,
      username: req.session.tempUser.username,
      password: req.session.tempUser.passwordHash,
      isEmailVerified: req.session.tempUser.isEmailVerified || false,
      firstName: req.session.tempUser.firstName,
      lastName: req.session.tempUser.lastName,
      dateOfBirth: req.session.tempUser.dateOfBirth,
      sex: req.session.tempUser.sex,
      profilePicUrl,
      phone: {
        countryCode: req.session.tempUser.countryCode || null,
        phoneNumber: req.session.tempUser.phoneNumber || null,
        isVerified: req.session.tempUser.phoneIsVerified || false,
        verificationCode: null,
        verificationExpires: null
      }
    };

    const newUser = new User(userData);
    await newUser.save();

    req.session.userId = newUser._id;
    delete req.session.tempUser;

    // Redirect back to original URL or dashboard
    const redirectTo = req.session.redirectAfterLogin || '/user/dashboard';
    delete req.session.redirectAfterLogin;

    res.redirect(redirectTo);
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
