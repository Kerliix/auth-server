import Organization from '../models/Organization.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find()
      .populate('owner', 'email')
      .lean();

    const result = organizations.map(org => ({
      _id: org._id,
      name: org.name,
      organizationId: org.organizationId,
      ownerEmail: org.owner ? org.owner.email : null,
    }));

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id)
      .populate('owner', 'email')
      .lean();

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.status(200).json({
      _id: org._id,
      name: org.name,
      organizationId: org.organizationId,
      ownerEmail: org.owner ? org.owner.email : null,
    });
  } catch (error) {
    logger.error('Error fetching organization by id:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
