// routes/authRoutes.js
import express from 'express';
import multer from 'multer';
import {
  getRegisterStep1, postRegisterStep1,
  getVerifyEmail, postVerifyEmail,
  getRegisterDetails, postRegisterDetails,
  getPhoneStep, postPhoneStep,
  getVerifyPhone, postVerifyPhone,
  getProfilePicStep, postProfilePicStep
} from '../controllers/registerController.js';
import {
  getLogin, postLogin, getMfa, postMfa
} from '../controllers/loginController.js';
import {
  logout
} from '../controllers/logoutController.js';

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

router.get('/register/verify-phone', getVerifyPhone);
router.post('/register/verify-phone', postVerifyPhone);
router.get('/register/profile-pic', getProfilePicStep);
router.post('/register/profile-pic', upload.single('profilePic'), postProfilePicStep);
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/auth/mfa', getMfa);
router.post('/auth/mfa', postMfa);
router.get('/logout', logout);

export default router;
