import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import engine from 'ejs-mate';
import { flashMiddleware } from './middleware/flash.js';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(flashMiddleware);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rate limiter export (keep this if you want to use it elsewhere)
export const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});

// View engine setup with ejs-mate
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ===== HTTPS enforcement middleware for production =====
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // if request is not secure, redirect to https
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Health check endpoint for Render or other hosting platforms
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/auth', oauthRoutes);
app.use('/admin', adminRoutes);

// Home
app.get('/', (req, res) => res.redirect('/auth/login'));

// DB connection & server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected');

    app.listen(PORT, () => {
      // Build full URL for logging
      let url;
      if (NODE_ENV === 'production') {
        // Assume HTTPS and environment variable DOMAIN (set in Render)
        const domain = process.env.DOMAIN || `localhost:${PORT}`;
        url = `https://${domain}`;
      } else {
        url = `http://localhost:${PORT}`;
      }

      logger.info(`Server running at ${url}`);
    });
  })
  .catch(err => logger.error('DB error:', err));
