import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

export const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    // logger.warn('verifyAdmin: No token provided');
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    // logger.info(`verifyAdmin: Authenticated admin ID=${decoded.id}, role=${decoded.role}`);
    next();
  } catch (error) {
    // logger.warn(`verifyAdmin: Invalid token - ${error.message}`);
    res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'superadmin') {
    // logger.warn(`isSuperAdmin: Admin ID=${req.admin.id} is not superadmin`);
    return res.status(403).json({ message: 'Forbidden: Requires superadmin privileges' });
  }

  // logger.info(`isSuperAdmin: Access granted to superadmin ID=${req.admin.id}`);
  next();
};
