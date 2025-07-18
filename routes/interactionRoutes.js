import express from 'express';
import User from '../models/User.js';
const router = express.Router();

router.get('/auth/interaction/:uid', async (req, res) => {
  const { uid, prompt, params } = await req.app.locals.oidc.interactionDetails(req, res);
  res.render('login', { uid, params });
});

router.post('/auth/interaction/:uid/login', async (req, res) => {
  const { uid } = req.params;
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.render('login', { uid, error: 'Invalid credentials' });
  }

  const result = {
    login: {
      accountId: user._id.toString(),
    },
  };
  await req.app.locals.oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
});

router.post('/auth/interaction/:uid/confirm', async (req, res) => {
  const { uid } = req.params;
  const result = { consent: {} };
  await req.app.locals.oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
});

export default router;