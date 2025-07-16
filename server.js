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

import User from './models/User.js';

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

export const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

// 🔽 Inject logged-in user into all views (EJS Mate layouts too)
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).lean(); // .lean() for performance
      res.locals.user = user;
    } catch (err) {
      logger.error('Error injecting user into views:', err);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/oauth', oauthRoutes);
app.use('/admin', adminRoutes);

// app.get('/', (req, res) => res.redirect('/auth/login'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected');

    app.listen(PORT, () => {
      let url;
      if (NODE_ENV === 'production') {
        const domain = process.env.DOMAIN || `localhost:${PORT}`;
        url = `https://${domain}`;
      } else {
        url = `http://localhost:${PORT}`;
      }

      logger.info(`Server running at ${url}`);
    });
  })
  .catch(err => logger.error('DB error:', err));
