import User from '../models/User.js';
// import Transaction from '../models/Transaction.js';
// import OAuthConnection from '../models/OAuthConnection.js';

export const getChartStats = async (req, res) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Monthly user registrations
  const usersPerMonth = await User.aggregate([
    {
      $match: { createdAt: { $gte: startOfYear } },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        month: '$_id.month',
        count: 1,
        _id: 0,
      },
    },
  ]);

  // Monthly revenue
  const revenuePerMonth = await Transaction.aggregate([
    {
      $match: { createdAt: { $gte: startOfYear } },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        month: '$_id.month',
        total: 1,
        _id: 0,
      },
    },
  ]);

  // OAuth provider breakdown
  const oauthDistribution = await OAuthConnection.aggregate([
    {
      $group: {
        _id: '$provider',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        provider: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ]);

  res.json({ usersPerMonth, revenuePerMonth, oauthDistribution });
};
