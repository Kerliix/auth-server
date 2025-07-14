// middleware/flash.js
export const flashMiddleware = (req, res, next) => {
  if (!req.session) {
    return next(new Error('Session middleware must be initialized before flashMiddleware'));
  }

  res.locals.error = req.session.error || null;
  res.locals.success = req.session.success || null;

  // Clear flash messages after reading them once
  delete req.session.error;
  delete req.session.success;

  next();
};
