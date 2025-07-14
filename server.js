// server.js
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import engine from 'ejs-mate';               // <-- Import ejs-mate
import { flashMiddleware } from './middleware/flash.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// View engine setup with ejs-mate
app.engine('ejs', engine);               // <-- Register ejs-mate as the engine for .ejs files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Home
app.get('/', (req, res) => res.redirect('/auth/login'));

// DB connection & server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 3000, () =>
      console.log('Server running on port', process.env.PORT || 3000)
    );
  })
  .catch(err => console.error('DB error:', err));
