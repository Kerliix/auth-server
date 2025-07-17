import User from '../models/User.js';

// GET /admin/accounts - Get list of all user accounts
export const getAllAccounts = async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt'); // Only fetch needed fields
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /admin/accounts/:id - Get details for a single account
export const getAccountById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
