import Organization from '../models/Organization.js';
import User from '../models/User.js';

// GET /admin/organizations
export const getAllOrganizations = async (req, res) => {
  try {
    // Populate owner to get email
    const organizations = await Organization.find()
      .populate('owner', 'email')
      .lean();

    // Map owner email for frontend convenience
    const result = organizations.map(org => ({
      _id: org._id,
      name: org.name,
      organizationId: org.organizationId,
      ownerEmail: org.owner ? org.owner.email : null,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /admin/organizations/:id
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
    console.error('Error fetching organization by id:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
