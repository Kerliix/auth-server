// middleware/auth.js
export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.redirectAfterLogin = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
}
