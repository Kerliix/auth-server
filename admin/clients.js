import OAuthClient from '../models/OAuthClient.js';
import logger from '../config/logger.js';

export const getAllClients = async (req, res) => {
  try {
    const clients = await OAuthClient.find({}, 'name clientId redirectUris');
    res.status(200).json(clients);
  } catch (err) {
    logger.error('Error fetching clients:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await OAuthClient.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (err) {
    logger.error('Error fetching client by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
