import User from '../models/User.js';
import logger from '../config/logger.js';

export const getAllAccounts = async (req, res) => {
  try {
    const { search = '', sortBy = 'createdAt', order = 'desc' } = req.query;

    const searchRegex = new RegExp(search, 'i'); // case-insensitive

    // Build filter:
    const filter = search
      ? {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { _id: search },  // exact match for id (no regex)
          ],
        }
      : {};

    // Validate sort field to prevent injection:
    const validSortFields = ['name', 'email', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Validate order
    const sortOrder = order === 'asc' ? 1 : -1;

    const users = await User.find(filter, 'name email createdAt').sort({ [sortField]: sortOrder });

    res.status(200).json(users);
  } catch (err) {
    logger.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select([
      'email',
      'username',
      'role',
      'isEmailVerified',
      'lastLogin',
      'mfa.isEnabled',
      'mfa.method',
      'firstName',
      'lastName',
      'dateOfBirth',
      'sex',
      'phone.countryCode',
      'phone.phoneNumber',
      'phone.isVerified',
      'profilePicUrl',
      'oauth.isOAuthUser',
      'deactivated',
      'createdAt',
    ]);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    logger.error('Error fetching user by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
