import twilio from 'twilio';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Verify Twilio credentials by fetching account info
(async () => {
  try {
    const account = await client.api.accounts(process.env.TWILIO_SID).fetch();
    if (account.status === 'active') {
      logger.info('SMS server is ready to send messages');
    } else {
      logger.warn(`Twilio account status is '${account.status}'`);
    }
  } catch (error) {
    logger.error('SMS server configuration error (Twilio):', error.message || error);
  }
})();

export const sendSms = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to,
    });
    logger.info(`SMS sent to ${to} | SID: ${response.sid}`);
    return response;
  } catch (error) {
    logger.error(`SMS sending failed to ${to}:`, error.message || error);
    throw error;
  }
};
