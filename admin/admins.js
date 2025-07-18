import Admin from '../models/Admin.js';
import logger from '../config/logger.js';

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, 'name email role');
    res.status(200).json(admins);
  } catch (err) {
    logger.error('Error fetching admins:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('name email role profilePic');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(admin);
  } catch (err) {
    logger.error('Error fetching admin by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
