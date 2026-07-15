'use strict';

/**
 * Static EBS pricing lookup module.
 * Provides approximate monthly costs for EBS volumes based on type and size.
 *
 * Base pricing is per-GB monthly rate for us-east-1.
 * Other regions use multipliers. Returns 0 for unknown volume types.
 */

// Per-GB monthly rates in USD for us-east-1
const PER_GB_RATES = {
  'gp2': 0.10,
  'gp3': 0.08,
  'io1': 0.125,
  'io2': 0.125,
  'st1': 0.045,
  'sc1': 0.015,
  'standard': 0.05,
};

// Region multipliers relative to us-east-1
const REGION_MULTIPLIERS = {
  'us-east-1': 1.0,
  'us-west-2': 1.0,
  'eu-west-1': 1.05,
  'ap-south-1': 0.9,
  'ap-southeast-1': 1.1,
};

/**
 * Get estimated monthly cost for an EBS volume.
 * @param {string} volumeType - 'gp2', 'gp3', 'io1', 'io2', 'st1', 'sc1', 'standard'
 * @param {number} sizeGb - Volume size in GB
 * @param {string} region - AWS region
 * @returns {number} Estimated monthly cost in USD. Returns 0 for unknown volume types.
 */
function getEBSMonthlyCost(volumeType, sizeGb, region) {
  const rate = PER_GB_RATES[volumeType];
  if (rate === undefined) {
    return 0;
  }

  const multiplier = REGION_MULTIPLIERS[region] || 1.0;
  return Math.round(rate * sizeGb * multiplier * 100) / 100;
}

module.exports = {
  getEBSMonthlyCost,
};
