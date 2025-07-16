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
