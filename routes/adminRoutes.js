import express from 'express';
import multer from 'multer';
import {verifyAdmin, isSuperAdmin } from '../middleware/verifyAdmin.js';

import { adminSignIn } from '../admin/adminAuthController.js';
import { getAdminMe , getAdminProfile, updateAdminProfile, uploadProfilePic } from '../admin/admin.js';
import { getAllAccounts, getAccountById,} from '../admin/accounts.js';
import { getAllClients, getClientById } from '../admin/clients.js';
import { getAllAdmins, getAdminById, createAdmin, changeAdminRole } from '../admin/admins.js';
import { getAllLogs, getLogById } from '../admin/logs.js';
import { getAllOrganizations, getOrganizationById } from '../admin/organizations.js';
import { getDashboardCharts, getDashboardStats, getRecentLogs } from '../admin/dashboard.js';

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
router.get('/dashboard/charts', verifyAdmin, getDashboardCharts);
router.get('/dashboard/stats', verifyAdmin, getDashboardStats);
router.get('/logs/recent', verifyAdmin, getRecentLogs);
router.get('/accounts', verifyAdmin, getAllAccounts);
router.get('/accounts/:id', verifyAdmin, getAccountById);
router.get('/clients', verifyAdmin, getAllClients);
router.get('/clients/:id', verifyAdmin, getClientById);
router.get('/admins', verifyAdmin, getAllAdmins);
router.get('/admins/:id', verifyAdmin, getAdminById);
router.post('/admins', verifyAdmin, isSuperAdmin, createAdmin);
router.put('/admins/:id/role', verifyAdmin, isSuperAdmin, changeAdminRole);
router.get('/logs', verifyAdmin, getAllLogs);
router.get('/logs/:id', verifyAdmin, getLogById);
router.get('/organizations', verifyAdmin, getAllOrganizations);
router.get('/organizations/:id', verifyAdmin, getOrganizationById);

router.get('/me', verifyAdmin, getAdminMe );
router.get('/profile', verifyAdmin, getAdminProfile);
router.put('/profile', verifyAdmin, updateAdminProfile);
router.post('/profile/pic', verifyAdmin, upload.single('profilePic'), uploadProfilePic);

export default router;

