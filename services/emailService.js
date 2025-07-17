import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    logger.error('Email server configuration error:', error);
  } else {
    logger.info('Email server is ready to send messages');
  }
});

// Reusable email wrapper
const buildEmailHTML = (title, bodyContent) => `
  <div style="max-width: 600px; margin: auto; padding: 30px; background-color: #ffffff; font-family: 'Segoe UI', sans-serif; color: #333; border: 1px solid #eee; border-radius: 8px;">
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="color: #4CAF50; margin: 0;">Kerliix</h1>
      <h2 style="margin-top: 5px;">${title}</h2>
    </div>
    <div style="font-size: 16px; line-height: 1.6;">
      ${bodyContent}
    </div>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <footer style="text-align: center; font-size: 12px; color: #999;">
      <p>You're receiving this email because you have an account on Kerliix.</p>
      <p>If you did not initiate this request, please ignore this message.</p>
    </footer>
  </div>
`;

// 1. VERIFICATION EMAIL
export const sendVerificationEmail = async (to, code) => {
  const html = buildEmailHTML('Verify Your Email', `
    <p>Hello,</p>
    <p>Use the code below to verify your email address:</p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; background: #f0f0f0; padding: 10px 20px; font-size: 24px; font-weight: bold; border-radius: 6px;">${code}</span>
    </div>
    <p>This code is valid for 10 minutes.</p>
  `);

  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Verification email sent to:', to, '| Message ID:', info.messageId);
    return info;
  } catch (err) {
    logger.error('Failed to send verification email:', err);
    throw err;
  }
};

// 2. MFA EMAIL
export const sendMfaEmail = async (to, code) => {
  const html = buildEmailHTML('MFA Login Code', `
    <p>Hello,</p>
    <p>Use the code below to complete your login:</p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; background: #f0f0f0; padding: 10px 20px; font-size: 24px; font-weight: bold; border-radius: 6px;">${code}</span>
    </div>
    <p>If you did not try to login, please secure your account immediately.</p>
  `);

  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your MFA Login Code',
    text: `Use this code to complete your login: ${code}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('MFA email sent to:', to, '| Message ID:', info.messageId);
    return info;
  } catch (err) {
    logger.error('Failed to send MFA email:', err);
    throw err;
  }
};

// 3. WELCOME EMAIL
export const sendWelcomeEmail = async (to, firstName, lastName) => {
  const html = buildEmailHTML(`Welcome, ${firstName} ${lastName}!`, `
    <p>Hi ${firstName},</p>
    <p>Welcome to <strong>Kerliix</strong> 🎉 We're excited to have you as part of our community.</p>
    <p>Here are a few things you can do next:</p>
    <ul style="padding-left: 20px;">
      <li>Explore your dashboard</li>
      <li>Set up your profile</li>
      <li>Start connecting with others</li>
    </ul>
    <p>If you ever need support, our team is just an email away.</p>
    <p style="margin-top: 30px;">Cheers,<br><strong>The Kerliix Team</strong></p>
  `);

  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to Kerliix!',
    text: `Hello ${firstName} ${lastName}, welcome to Kerliix! We're excited to have you onboard.`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Welcome email sent to:', to, '| Message ID:', info.messageId);
    return info;
  } catch (err) {
    logger.error('Failed to send welcome email:', err);
    throw err;
  }
};

// 4. LOGIN NOTIFICATION EMAIL
export const sendLoginNotificationEmail = async (to, { ip, location, device }) => {
  const loginTime = new Date().toLocaleString('en-US', { timeZone: 'UTC', hour12: true });

  const html = buildEmailHTML('New Login Detected', `
    <p>Hello,</p>
    <p>A login to your account was just detected:</p>
    <ul style="padding-left: 20px;">
      <li><strong>Time:</strong> ${loginTime} (UTC)</li>
      <li><strong>Location:</strong> ${location || 'Unknown'}</li>
      <li><strong>IP Address:</strong> ${ip || 'N/A'}</li>
      <li><strong>Device:</strong> ${device || 'Unknown'}</li>
    </ul>
    <p>If this was you, no further action is needed.</p>
    <p>If you didn’t log in, we recommend changing your password immediately.</p>
  `);

  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'New Login to Your Kerliix Account',
    text: `A login was detected from IP: ${ip}, Location: ${location}, Device: ${device}. Time: ${loginTime} (UTC)`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Login notification email sent to:', to, '| Message ID:', info.messageId);
    return info;
  } catch (err) {
    logger.error('Failed to send login notification email:', err);
    throw err;
  }
};

export const sendLogoutEmail = async (to, { ip, location, device, time }) => {
  const html = buildEmailHTML('You Logged Out', `
    <p>Hello,</p>
    <p>You have successfully logged out from your account.</p>
    <ul style="padding-left: 20px;">
      <li><strong>Time:</strong> ${time} (UTC)</li>
      <li><strong>Location:</strong> ${location || 'Unknown'}</li>
      <li><strong>IP Address:</strong> ${ip || 'N/A'}</li>
      <li><strong>Device:</strong> ${device || 'Unknown'}</li>
    </ul>
    <p>If this wasn't you, we recommend changing your password immediately.</p>
  `);

  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'You Logged Out from Kerliix',
    text: `Logout detected from IP: ${ip}, Location: ${location}, Device: ${device}. Time: ${time} (UTC)`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Logout email sent to:', to, '| Message ID:', info.messageId);
    return info;
  } catch (err) {
    logger.error('Failed to send logout email:', err);
    throw err;
  }
};

export const sendAutoLogoutEmail = async (to, { ip, location, device, browser, os, time }) => {
  const html = buildEmailHTML('Session Auto Logged Out', `
    <p>Hello,</p>
    <p>One of your active sessions was automatically logged out due to inactivity for ${AUTO_LOGOUT_DAYS} days.</p>
    <ul style="padding-left: 20px;">
      <li><strong>Time:</strong> ${time} (UTC)</li>
      <li><strong>Location:</strong> ${location || 'Unknown'}</li>
      <li><strong>IP Address:</strong> ${ip || 'N/A'}</li>
      <li><strong>Device:</strong> ${device || 'Unknown'}</li>
      <li><strong>Browser:</strong> ${browser || 'Unknown'}</li>
      <li><strong>OS:</strong> ${os || 'Unknown'}</li>
    </ul>
    <p>This is for your security. If you need to stay logged in longer, consider using "Remember Me" options if available.</p>
  `);

  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'You Were Auto Logged Out',
    text: `One of your sessions was auto-logged out due to inactivity.`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Auto logout email sent to:', to, '| Message ID:', info.messageId);
    return info;
  } catch (err) {
    logger.error('Failed to send auto logout email:', err);
    throw err;
  }
};

export const sendUsernameChangedEmail = async (to, oldUsername, newUsername) => {
  const html = buildEmailHTML('Username Changed', `
    <p>Hello,</p>
    <p>This is a confirmation that your Kerliix username has been updated.</p>
    <ul style="padding-left: 20px;">
      <li><strong>Previous Username:</strong> ${oldUsername}</li>
      <li><strong>New Username:</strong> ${newUsername}</li>
    </ul>
    <p>If you did not make this change, please contact our support team immediately.</p>
  `);

  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Username Has Been Changed',
    text: `Your username has been changed from "${oldUsername}" to "${newUsername}". If you didn't request this, contact support.`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Username change email sent to:', to, '| Message ID:', info.messageId);
    return info;
  } catch (err) {
    logger.error('Failed to send username change email:', err);
    throw err;
  }
};

export const sendAccountDeactivatedEmail = async (to) => {
  const html = buildEmailHTML('Account Deactivated', `
    <p>Hello,</p>
    <p>Your Kerliix account has been <strong>deactivated</strong>. This means you will no longer be able to log in or access your data.</p>
    <p>If this was intentional, no further action is required. If you did not request this, please contact our support team immediately.</p>
    <p style="margin-top: 30px;">Thanks,<br><strong>The Kerliix Team</strong></p>
  `);

  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Kerliix Account Has Been Deactivated',
    text: `Your account has been deactivated. Contact support if this was not intended.`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Deactivation email sent to:', to, '| Message ID:', info.messageId);
    return info;
  } catch (err) {
    logger.error('Failed to send deactivation email:', err);
    throw err;
  }
};

export const sendAccountDeletedEmail = async (to) => {
  const html = buildEmailHTML('Account Deleted', `
    <p>Hello,</p>
    <p>We're writing to confirm that your Kerliix account has been <strong>permanently deleted</strong>.</p>
    <p>All your personal information, login logs, and data have been removed from our system and cannot be recovered.</p>
    <p>If this was not intended, please contact us immediately — although recovery may not be possible.</p>
    <p style="margin-top: 30px;">Goodbye,<br><strong>The Kerliix Team</strong></p>
  `);

  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Kerliix Account Has Been Deleted',
    text: `Your account has been permanently deleted. This action cannot be undone.`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Account deletion email sent to:', to, '| Message ID:', info.messageId);
    return info;
  } catch (err) {
    logger.error('Failed to send deletion email:', err);
    throw err;
  }
};
