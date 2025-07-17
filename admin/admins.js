import Admin from '../models/Admin.js';

// GET /admin/admins - List all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, 'name email role');
    res.status(200).json(admins);
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /admin/admins/:id - Get a specific admin by ID
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (err) {
    console.error('Error fetching admin by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
