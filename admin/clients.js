import OAuthClient from '../models/OAuthClient.js';
import logger from '../config/logger.js';

export const getAllClients = async (req, res) => {
  try {
    const { search = '', sortBy = 'name' } = req.query;

    const searchRegex = new RegExp(search, 'i');
    const filter = {
      $or: [
        { name: { $regex: searchRegex } },
        { clientId: { $regex: searchRegex } },
      ],
    };

    // Match _id if search looks like ObjectId
    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      filter.$or.push({ _id: search });
    }

    const allowedSortFields = ['name', 'clientId', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';

    const clients = await OAuthClient.find(filter, 'name clientId redirectUris').sort({ [sortField]: 1 });

    res.status(200).json(clients);
  } catch (err) {
    logger.error('Error fetching clients:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await OAuthClient.findById(req.params.id).select('name clientId redirectUris scopes createdAt');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json(client);
  } catch (err) {
    logger.error('Error fetching client by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};