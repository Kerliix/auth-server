import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { ensureMfaVerified } from '../middleware/mfa.js';

import {
  getDashboard,
  getProfile,
  getChangeProfilePic,
  getEditProfile,
  changePassword,
  changeEmail,
  verifyNewEmail,
  updateProfile,
} from '../controllers/userController.js';

import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

router.get('/dashboard', requireAuth, ensureMfaVerified, getDashboard);
router.get('/profile', requireAuth, ensureMfaVerified, getProfile);
router.get('/change-profile-pic', getChangeProfilePic);
router.get('/edit-profile', requireAuth, ensureMfaVerified, getEditProfile);
router.post('/change-password', requireAuth, ensureMfaVerified, changePassword);
router.post('/change-email', requireAuth, ensureMfaVerified, changeEmail);
router.post('/verify-new-email', requireAuth, ensureMfaVerified, verifyNewEmail);
router.post('/update-profile', requireAuth, ensureMfaVerified, upload.single('profilePic'), updateProfile);

export default router;
