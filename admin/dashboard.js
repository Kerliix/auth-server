import User from '../models/User.js';
import OAuthClient from '../models/OAuthClient.js';
import Log from '../models/Log.js';
import logger from '../config/logger.js';
import Verification from '../models/Verification.js';
import PasswordResetRequest from '../models/PasswordResetRequest.js';
import TwoFactorAuth from '../models/TwoFactorAuth.js';
import OAuthLogin from '../models/OAuthLogin.js';

export const getDashboardCharts = async (req, res) => {
  try {
    const now = new Date();
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);

    // Group users by month (createdAt)
    const usersPerMonth = await User.aggregate([
      {
        $match: { createdAt: { $gte: lastYear } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1
        }
      }
    ]);

    // Example stub for revenue per month (you can replace with real model if available)
    const revenuePerMonth = [
      { month: 1, amount: 1000 },
      { month: 2, amount: 1400 },
      { month: 3, amount: 1200 },
      { month: 4, amount: 2000 },
    ];

    // OAuth client distribution (by type)
    const oauthDistribution = await OAuthClient.aggregate([
      {
        $group: {
          _id: "$type", // assuming OAuthClient has a "type" field (e.g., "web", "mobile")
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      usersPerMonth,
      revenuePerMonth,
      oauthDistribution,
    });
  } catch (err) {
    logger.error('Dashboard chart error:', err);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};

export const getRecentLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const result = logs.map(log => ({
      id: log._id,
      message: log.message,
      timestamp: log.createdAt
    }));

    res.status(200).json(result);
  } catch (err) {
    logger.error('Error fetching recent logs:', err);
    res.status(500).json({ message: 'Failed to fetch recent logs' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Active Users - users active in last 30 days (example: last login date tracked)
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });

    // New Signups - users created in last 30 days
    const newSignups = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Pending Verifications (assuming a Verification model with status)
    const pendingVerifications = await Verification.countDocuments({ status: 'pending' });

    // Password Reset Requests in last 30 days
    const passwordResetRequests = await PasswordResetRequest.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // 2FA Adoption - count of users with 2FA enabled / total users (percentage)
    const usersWith2FA = await TwoFactorAuth.countDocuments({ enabled: true });
    const totalUsers = await User.countDocuments();
    const twoFactorAdoption = totalUsers > 0 ? Math.round((usersWith2FA / totalUsers) * 100) : 0;

    // OAuth Logins in last 30 days (assuming OAuthLogin model storing login events)
    const oauthLogins = await OAuthLogin.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Failed OAuth Attempts in last 30 days (assuming Log collection with errorType or similar)
    const failedOAuthAttempts = await Log.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      level: 'error',
      message: /OAuth failed/i // crude filter on message content, refine as needed
    });

    res.status(200).json({
      activeUsers,
      newSignups,
      pendingVerifications,
      passwordResetRequests,
      twoFactorAdoption,
      oauthLogins,
      failedOAuthAttempts,
    });
  } catch (err) {
    logger.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
};
