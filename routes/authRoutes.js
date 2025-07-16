// routes/authRoutes.js
import express from 'express';
import multer from 'multer';
import {
  getRegisterStep1, postRegisterStep1,
  getVerifyEmail, postVerifyEmail,
  getRegisterDetails, postRegisterDetails,
  getPhoneStep, postPhoneStep,
  getProfilePicStep, postProfilePicStep
} from '../controllers/registerController.js';
import {
  getLogin, postLogin, getMfa, postMfa,
  logout
} from '../controllers/authController.js';

const router = express.Router();
const upload = multer({ dest: 'public/uploads' });

router.get('/register', getRegisterStep1);
router.post('/register', postRegisterStep1);
router.get('/register/verify', getVerifyEmail);
router.post('/register/verify', postVerifyEmail);
router.get('/register/details', getRegisterDetails);
router.post('/register/details', postRegisterDetails);
router.get('/register/phone', getPhoneStep);
router.post('/register/phone', postPhoneStep);
router.get('/register/profile-pic', getProfilePicStep);
router.post('/register/profile-pic', upload.single('profilePic'), postProfilePicStep);
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/auth/mfa', getMfa);
router.post('/auth/mfa', postMfa);
router.get('/logout', logout);

export default router;
