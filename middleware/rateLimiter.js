// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const tokenLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 token requests per minute
  message: 'Too many token requests, please try again later.'
});
