export const ensureMfaVerified = (req, res, next) => {
  if (!req.session.userId && req.session.mfaUserId) {
    return res.redirect('/auth/mfa');
  }
  next();
};
