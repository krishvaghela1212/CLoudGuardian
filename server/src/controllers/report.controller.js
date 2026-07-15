const Report = require('../models/Report');
const logger = require('../utils/logger');

// @desc    Get the latest scan report for a user
// @route   GET /api/reports/latest
// @access  Private
exports.getLatestReport = async (req, res, next) => {
  try {
    const latestReport = await Report.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!latestReport) {
      return res.status(404).json({
        success: false,
        message: 'No scan reports found. Please run a new scan.',
      });
    }

    res.status(200).json({
      success: true,
      data: latestReport,
    });
  } catch (error) {
    logger.error(`[Report Controller] getLatestReport error: ${error.message}`);
    next(error);
  }
};
