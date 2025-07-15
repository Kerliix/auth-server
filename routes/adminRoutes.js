import express from 'express';
import multer from 'multer';

import { adminSignIn } from '../admin/adminAuthController.js';
import { getChartStats } from '../admin/adminDashboardController.js';
import {
  verifyAdmin,
  isSuperAdmin
} from '../middleware/verifyAdmin.js';

import {
  getAdminMe ,
  getAdminProfile,
  updateAdminProfile,
  uploadProfilePic
} from '../admin/admin.js';

import {
  getAllUsers,
  getAllClients,
  getAllLogs,
  getAllAdmins
} from '../admin/adminPanelController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/signin', adminSignIn);
router.get('/dashboard/charts', verifyAdmin, getChartStats);
router.get('/accounts', verifyAdmin, getAllUsers);
router.get('/clients', verifyAdmin, getAllClients);
router.get('/logs', verifyAdmin, getAllLogs);
router.get('/admins', verifyAdmin, isSuperAdmin, getAllAdmins);
router.get('/profile', verifyAdmin, getAdminProfile);
router.get('/me', verifyAdmin, getAdminMe );
router.put('/profile', verifyAdmin, updateAdminProfile);
router.post('/profile/pic', verifyAdmin, upload.single('profilePic'), uploadProfilePic);

export default router;
