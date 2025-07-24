import express from 'express';
const router = express.Router(); 

import { ensureMfaVerified } from '../middleware/mfa.js';
import { requireAuth } from '../middleware/auth.js';
import {
  changeUsername,
  getDevices,
  getMyApps,
  deleteAccount,
  deactivateAccount,
  getAccountSettings
} from '../controllers/accountController.js';

router.get('/settings', requireAuth, ensureMfaVerified, getAccountSettings);
router.get('/devices', requireAuth, ensureMfaVerified, getDevices);
router.post('/devices/logout/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.session.userId;

  const log = await LoginLog.findOne({ userId, sessionId, isActive: true });
  if (log) {
    await LoginLog.updateOne({ _id: log._id }, { isActive: false });
    // Optionally destroy session if you're storing them in DB
  }

  res.redirect('/account/devices');
});

router.get('/my-apps', requireAuth, ensureMfaVerified, getMyApps);
router.post('/account/deactivate', requireAuth, ensureMfaVerified, deactivateAccount);
router.post('/account/change-username', requireAuth, ensureMfaVerified, changeUsername);
router.post('/account/delete', requireAuth, ensureMfaVerified, deleteAccount);

export default router;
