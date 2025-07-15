import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import logger from '../config/logger.js';

export const adminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    // logger.info(`Admin signin attempt for email: ${email}`);

    const admin = await Admin.findOne({ email });
    if (!admin) {
      // logger.warn(`Admin signin failed: no admin found with email ${email}`);
      return res.status(401).json({ message: 'Access Denied. Invalid Email' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      // logger.warn(`Admin signin failed: wrong password for email ${email}`);
      return res.status(401).json({ message: 'Access Denied. Invalid Password' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // logger.info(`Admin signin successful for email: ${email}`);

    res.json({ token, admin: { name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    // logger.error(`Admin signin error: ${error.message}`, { error });
    res.status(500).json({ message: 'Server error' });
  }
};
