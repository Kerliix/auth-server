// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

// Create the transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',          // Explicit SMTP host for Gmail
  port: 587,                       // Port 587 for TLS
  secure: false,                   // false because we're using STARTTLS
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
});

// Optional: verify the connection configuration on server start
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email server configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Function to send the email
export const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: `"Kerliix" <${process.env.EMAIL_USER}>`, // Custom sender name
    to,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', to, '| Message ID:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Failed to send verification email:', err);
    throw err; // Re-throw to handle it in calling controller
  }
};
