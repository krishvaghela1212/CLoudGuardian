'use strict';

/**
 * Static EC2 pricing lookup module.
 * Provides approximate On-Demand monthly costs for common instance types
 * and downsize target mapping.
 *
 * Base pricing is for us-east-1. Other regions use multipliers.
 * Returns 0 for unknown instance types (graceful degradation).
 */

// Approximate monthly On-Demand costs in USD for us-east-1
const BASE_PRICING = {
  // T2 family
  't2.nano': 4.18,
  't2.micro': 8.35,
  't2.small': 16.70,
  't2.medium': 33.41,
  't2.large': 66.82,
  't2.xlarge': 133.63,

  // T3 family
  't3.nano': 3.80,
  't3.micro': 7.59,
  't3.small': 15.18,
  't3.medium': 30.37,
  't3.large': 60.74,
  't3.xlarge': 121.47,

  // M5 family
  'm5.large': 69.12,
  'm5.xlarge': 138.24,
  'm5.2xlarge': 276.48,
  'm5.4xlarge': 552.96,

  // M6i family
  'm6i.large': 69.12,
  'm6i.xlarge': 138.24,
  'm6i.2xlarge': 276.48,
  'm6i.4xlarge': 552.96,

  // C5 family
  'c5.large': 61.20,
  'c5.xlarge': 122.40,
  'c5.2xlarge': 244.80,

  // R5 family
  'r5.large': 90.72,
  'r5.xlarge': 181.44,
  'r5.2xlarge': 362.88,
};

// Region multipliers relative to us-east-1
const REGION_MULTIPLIERS = {
  'us-east-1': 1.0,
  'us-west-2': 1.0,
  'eu-west-1': 1.05,
  'ap-south-1': 0.9,
  'ap-southeast-1': 1.1,
};

// Downsize mapping: instance type -> next smaller in same family
const DOWNSIZE_MAP = {
  't2.micro': 't2.nano',
  't2.small': 't2.micro',
  't2.medium': 't2.small',
  't2.large': 't2.medium',
  't2.xlarge': 't2.large',

  't3.micro': 't3.nano',
  't3.small': 't3.micro',
  't3.medium': 't3.small',
  't3.large': 't3.medium',
  't3.xlarge': 't3.large',

  'm5.xlarge': 'm5.large',
  'm5.2xlarge': 'm5.xlarge',
  'm5.4xlarge': 'm5.2xlarge',

  'm6i.xlarge': 'm6i.large',
  'm6i.2xlarge': 'm6i.xlarge',
  'm6i.4xlarge': 'm6i.2xlarge',

  'c5.xlarge': 'c5.large',
  'c5.2xlarge': 'c5.xlarge',

  'r5.xlarge': 'r5.large',
  'r5.2xlarge': 'r5.xlarge',
};

/**
 * Get estimated monthly cost for an EC2 instance type.
 * @param {string} instanceType - e.g., 't3.micro', 'm5.large'
 * @param {string} region - AWS region
 * @returns {number} Estimated monthly cost in USD. Returns 0 for unknown types.
 */
function getEC2MonthlyCost(instanceType, region) {
  const baseCost = BASE_PRICING[instanceType];
  if (baseCost === undefined) {
    return 0;
  }

  const multiplier = REGION_MULTIPLIERS[region] || 1.0;
  return Math.round(baseCost * multiplier * 100) / 100;
}

/**
 * Get the next smaller instance type for downsizing.
 * @param {string} instanceType - Current instance type
 * @returns {string|null} Smaller instance type or null if already smallest
 */
function getDownsizeTarget(instanceType) {
  return DOWNSIZE_MAP[instanceType] || null;
}

module.exports = {
  getEC2MonthlyCost,
  getDownsizeTarget,
};
