import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

import {
  getDashboard,
  getProfile,
  getChangeProfilePic,
  getEditProfile,
  getAccountSettings,
  changePassword,
  changeEmail,
  verifyNewEmail,
  updateProfile,
  deleteAccount
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

router.get('/dashboard', requireAuth, getDashboard);
router.get('/profile', requireAuth, getProfile);
router.get('/change-profile-pic', getChangeProfilePic);
router.get('/edit-profile', requireAuth, getEditProfile);
router.get('/account/settings', requireAuth, getAccountSettings);
router.post('/change-password', requireAuth, changePassword);
router.post('/change-email', requireAuth, changeEmail);
router.post('/verify-new-email', requireAuth, verifyNewEmail);
router.post('/update-profile', requireAuth, upload.single('profilePic'), updateProfile);
router.post('/delete', requireAuth, deleteAccount);

export default router;
