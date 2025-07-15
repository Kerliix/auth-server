import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import Admin from '../models/Admin.js';
import logger from '../config/logger.js';

export const getAdminMe = async (req, res) => {
  try {
    // logger.info('Fetching admin profile for ID:', req.admin.id);
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      logger.warn('Admin not found for ID:', req.admin.id);
      return res.status(404).json({ message: 'Admin not found' });
    }
    logger.info('Admin fetched:', admin.email);
    res.json({ admin });
  } catch (err) {
    logger.error('Error in /admin/me:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (password) admin.password = await bcrypt.hash(password, 10);

    await admin.save();
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Delete old profile picture if exists
    if (admin.profilePic) {
      const oldPath = path.join('uploads', admin.profilePic);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    admin.profilePic = req.file.filename;
    await admin.save();

    res.json({ profilePic: admin.profilePic });
  } catch (error) {
    console.error('Error uploading profile pic:', error);
    res.status(500).json({ message: 'Server error while uploading profile picture' });
  }
};
