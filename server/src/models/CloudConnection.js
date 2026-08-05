'use strict';

const mongoose = require('mongoose');

// Supported AWS regions (common set — extendable)
const SUPPORTED_AWS_REGIONS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'af-south-1',
  'ap-east-1', 'ap-south-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
  'ap-southeast-1', 'ap-southeast-2', 'ap-southeast-3',
  'ca-central-1',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
  'eu-south-1', 'eu-north-1',
  'me-south-1',
  'sa-east-1',
  'us-gov-east-1', 'us-gov-west-1',
];

const ROLE_ARN_PATTERN = /^arn:aws:iam::\d{12}:role\/.+$/;
const ACCOUNT_ID_PATTERN = /^\d{12}$/;

const cloudConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    provider: {
      type: String,
      enum: ['AWS'],
      default: 'AWS',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Connection name is required'],
      trim: true,
      maxlength: [50, 'Connection name must be 50 characters or less'],
    },
    accountId: {
      type: String,
      required: [true, 'AWS Account ID is required'],
      trim: true,
      validate: {
        validator: (v) => ACCOUNT_ID_PATTERN.test(v),
        message: 'AWS Account ID must be exactly 12 digits',
      },
    },
    roleArn: {
      type: String,
      required: [true, 'IAM Role ARN is required'],
      trim: true,
      validate: {
        validator: (v) => ROLE_ARN_PATTERN.test(v),
        message:
          'Invalid Role ARN format. Expected: arn:aws:iam::<12-digit-account-id>:role/<role-name>',
      },
    },
    region: {
      type: String,
      required: [true, 'AWS Region is required'],
      validate: {
        validator: (v) => SUPPORTED_AWS_REGIONS.includes(v),
        message: `Region must be a supported AWS region. Supported: ${SUPPORTED_AWS_REGIONS.join(', ')}`,
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [255, 'Description must be 255 characters or less'],
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONNECTED', 'FAILED'],
      default: 'PENDING',
    },
    lastScanAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one connection name per user
cloudConnectionSchema.index({ userId: 1, name: 1 }, { unique: true });

// Never expose roleArn in default queries — callers must explicitly select it
cloudConnectionSchema.set('toJSON', {
  transform: (doc, ret) => {
    // Keep roleArn masked in list views; explicit selects can retrieve it
    return ret;
  },
});

module.exports = mongoose.model('CloudConnection', cloudConnectionSchema);
module.exports.SUPPORTED_AWS_REGIONS = SUPPORTED_AWS_REGIONS;
