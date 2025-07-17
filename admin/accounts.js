import User from '../models/User.js';
import logger from '../config/logger.js';

export const getAllAccounts = async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt');
    res.status(200).json(users);
  } catch (err) {
    logger.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    logger.error('Error fetching user by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
