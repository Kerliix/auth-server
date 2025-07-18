import Admin from '../models/Admin.js';
import logger from '../config/logger.js';

export const getAllAdmins = async (req, res) => {
  try {
    const { search = '', sortBy = 'name' } = req.query;

    // Build search criteria: case-insensitive partial match on name or email,
    // or exact match on _id if search is a valid ObjectId
    const searchRegex = new RegExp(search, 'i'); // case-insensitive regex
    const searchCriteria = {
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ],
    };

    // Check if search is a valid Mongo ObjectId, if yes add _id exact match
    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      searchCriteria.$or.push({ _id: search });
    }

    // Validate sortBy — allow only certain fields for safety
    const allowedSortFields = ['name', 'email', 'role', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';

    // Fetch admins with search and sorting
    const admins = await Admin.find(searchCriteria, 'name email role')
      .sort({ [sortField]: 1 }); // ascending sort

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

export const createAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!['admin', 'superadmin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const newAdmin = new Admin({ name, email, password, role });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    console.error('Error creating admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changeAdminRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'superadmin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.role = role;
    await admin.save();

    res.status(200).json({ message: `Admin role updated to ${role}` });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
