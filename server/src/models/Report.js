const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    // The user who initiated the scan
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The raw data collected from AWS
    rawAwsData: {
      ec2: { type: Array, default: [] },
      s3: { type: Object, default: {} },
      rds: { type: Object, default: {} },
      lambda: { type: Object, default: {} },
    },
    // Analysis results (supports both Rule Engine and legacy AI format)
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
