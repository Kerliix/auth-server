// middleware/auth.js
import User from '../models/User.js';

// Middleware to load user object from session userId
export async function loadUser(req, res, next) {
  if (req.session.userId) {
    try {
      req.user = await User.findById(req.session.userId);
    } catch (err) {
      console.error('Failed to load user:', err);
      // Optionally clear session if user not found
      req.session.userId = null;
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

// Middleware to require authentication
export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.redirectAfterLogin = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
}
