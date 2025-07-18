import Organization from '../models/Organization.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

export const getAllOrganizations = async (req, res) => {
  try {
    const { search = '', sortBy = 'name' } = req.query;

    const searchRegex = new RegExp(search, 'i');
    const filter = {
      $or: [
        { name: { $regex: searchRegex } },
        { organizationId: { $regex: searchRegex } },
      ],
    };

    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      filter.$or.push({ _id: search });
    }

    const allowedSortFields = ['name', 'organizationId', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';

    const organizations = await Organization.find(filter, 'name organizationId ownerEmail').sort({ [sortField]: 1 });

    res.status(200).json(organizations);
  } catch (err) {
    logger.error('Error fetching organizations:', err);
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
