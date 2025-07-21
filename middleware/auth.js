import User from '../models/User.js';

export async function loadUser(req, res, next) {
  if (req.session.userId) {
    try {
      req.user = await User.findById(req.session.userId);
    } catch (err) {
      console.error('Failed to load user:', err);
      req.session.userId = null;
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.redirectAfterLogin = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
}
