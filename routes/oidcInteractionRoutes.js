// routes/oidcInteractionRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import oidc from '../oidc/index.js';

const router = express.Router();

router.get('/interaction/:uid', async (req, res) => {
  const details = await oidc.interactionDetails(req, res);
  res.render('auth/login', { uid: details.uid, ...details }); // adjust path if needed
});

router.post('/interaction/:uid', async (req, res) => {
  const { uid } = req.params;
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const valid = await bcrypt.compare(password, user?.password || '');

  if (!valid) return res.redirect(`/auth/interaction/${uid}?error=invalid_login`);

  const result = {
    login: { accountId: user._id.toString() },
  };

  await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
});

export default router;
