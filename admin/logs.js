import Log from '../models/Log.js';
import User from '../models/User.js'; // For user email lookup if needed

// GET /admin/logs - list logs
export const getAllLogs = async (req, res) => {
  try {
    // Fetch logs, populate user email if available
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .lean();

    // Map user emails (optional optimization: batch user fetch could be done)
    const userIds = logs.map(log => log.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }, 'email').lean();
    const userMap = new Map(users.map(u => [u._id.toString(), u.email]));

    const logsWithUserEmail = logs.map(log => ({
      _id: log._id,
      action: log.message,
      userEmail: log.userId ? userMap.get(log.userId.toString()) : 'Unknown',
      ip: log.ip,
      timestamp: log.createdAt,
    }));

    res.status(200).json(logsWithUserEmail);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /admin/logs/:id - get log details
export const getLogById = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id).lean();
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    let userEmail = 'Unknown';
    if (log.userId) {
      const user = await User.findById(log.userId, 'email').lean();
      if (user) userEmail = user.email;
    }

    res.status(200).json({
      _id: log._id,
      action: log.message,
      userEmail,
      ip: log.ip,
      timestamp: log.createdAt,
      details: log.metadata || null,
    });
  } catch (err) {
    console.error('Error fetching log by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
