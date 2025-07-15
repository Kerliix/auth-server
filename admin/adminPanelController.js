import User from '../models/User.js';
// import OAuthClient from '../models/OAuthClient.js';
// import Log from '../models/Log.js';
// import Admin from '../models/Admin.js';

export const getAllUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(100);
  res.json(users);
};

export const getAllClients = async (req, res) => {
  const clients = await OAuthClient.find();
  res.json(clients);
};

export const getAllLogs = async (req, res) => {
  const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
  res.json(logs);
};

export const getAllAdmins = async (req, res) => {
  const admins = await Admin.find().select('-password');
  res.json(admins);
};
