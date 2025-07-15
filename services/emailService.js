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

export const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
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
