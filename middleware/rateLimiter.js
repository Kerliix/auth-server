// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});