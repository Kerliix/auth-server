// routes/userRoutes.js

import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

import {
  getDashboard,
  getProfile,
  changePassword,
  changeEmail,
  verifyNewEmail,
  updateProfile,
  deleteAccount
} from '../controllers/userController.js';

import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// To resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads')); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Routes
router.get('/dashboard', requireAuth, getDashboard);
router.get('/profile', requireAuth, getProfile);
router.post('/change-password', requireAuth, changePassword);
router.post('/change-email', requireAuth, changeEmail);
router.post('/verify-new-email', requireAuth, verifyNewEmail);
router.post('/update-profile', requireAuth, upload.single('profilePic'), updateProfile);
router.post('/delete', requireAuth, deleteAccount);

export default router;
