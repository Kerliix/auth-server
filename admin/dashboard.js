import User from '../models/User.js';
import OAuthClient from '../models/OAuthClient.js';
import Log from '../models/Log.js';
import logger from '../config/logger.js';
import mongoose from 'mongoose';

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
