// app.js
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import engine from 'ejs-mate';
import MongoStore from 'connect-mongo';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger/swaggerConfig.js';
import { flashMiddleware } from './middleware/flash.js';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import securityRoutes from './routes/securityRoutes.js';

import User from './models/User.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60,
  }),
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));

app.use(flashMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

export const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

// View user info in views
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).lean();
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

// For active nav highlighting
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Force HTTPS in production
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/oauth', oauthRoutes);
app.use('/admin', adminRoutes);
app.use('/account', accountRoutes);
app.use('/security', securityRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
