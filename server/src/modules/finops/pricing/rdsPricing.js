'use strict';

/**
 * Static RDS pricing lookup module.
 * Provides approximate monthly costs for common RDS instance classes,
 * varying by engine type.
 *
 * Base pricing is for us-east-1. Other regions use multipliers.
 * Returns 0 for unknown instance classes (graceful degradation).
 */

// Approximate monthly On-Demand costs in USD for us-east-1
// Pricing varies by engine: mysql is slightly cheaper than postgres
const BASE_PRICING = {
  mysql: {
    'db.t3.micro': 12.41,
    'db.t3.small': 24.82,
    'db.t3.medium': 49.64,
    'db.t3.large': 99.28,
    'db.m5.large': 124.10,
    'db.m5.xlarge': 248.20,
    'db.m5.2xlarge': 496.40,
    'db.r5.large': 172.80,
    'db.r5.xlarge': 345.60,
    'db.r5.2xlarge': 691.20,
  },
  postgres: {
    'db.t3.micro': 12.85,
    'db.t3.small': 25.70,
    'db.t3.medium': 51.40,
    'db.t3.large': 102.80,
    'db.m5.large': 128.50,
    'db.m5.xlarge': 257.00,
    'db.m5.2xlarge': 514.00,
    'db.r5.large': 178.80,
    'db.r5.xlarge': 357.60,
    'db.r5.2xlarge': 715.20,
  },
};

// Region multipliers relative to us-east-1
const REGION_MULTIPLIERS = {
  'us-east-1': 1.0,
  'us-west-2': 1.0,
  'eu-west-1': 1.05,
  'ap-south-1': 0.9,
  'ap-southeast-1': 1.1,
};

// Downsize mapping: instance class -> next smaller in same family
const DOWNSIZE_MAP = {
  'db.t3.small': 'db.t3.micro',
  'db.t3.medium': 'db.t3.small',
  'db.t3.large': 'db.t3.medium',

  'db.m5.xlarge': 'db.m5.large',
  'db.m5.2xlarge': 'db.m5.xlarge',

  'db.r5.xlarge': 'db.r5.large',
  'db.r5.2xlarge': 'db.r5.xlarge',
};

/**
 * Get estimated monthly cost for an RDS instance.
 * @param {string} instanceClass - e.g., 'db.t3.micro', 'db.m5.large'
 * @param {string} engine - 'mysql', 'postgres', etc.
 * @param {string} region - AWS region
 * @returns {number} Estimated monthly cost in USD. Returns 0 for unknown classes.
 */
function getRDSMonthlyCost(instanceClass, engine, region) {
  // Normalize engine name and fall back to mysql pricing for unknown engines
  const normalizedEngine = (engine || '').toLowerCase();
  const enginePricing = BASE_PRICING[normalizedEngine] || BASE_PRICING['mysql'];

  const baseCost = enginePricing[instanceClass];
  if (baseCost === undefined) {
    return 0;
  }

  const multiplier = REGION_MULTIPLIERS[region] || 1.0;
  return Math.round(baseCost * multiplier * 100) / 100;
}

/**
 * Get the next smaller RDS instance class for downsizing.
 * @param {string} instanceClass - Current instance class
 * @returns {string|null} Smaller instance class or null if already smallest
 */
function getRDSDownsizeTarget(instanceClass) {
  return DOWNSIZE_MAP[instanceClass] || null;
}

module.exports = {
  getRDSMonthlyCost,
  getRDSDownsizeTarget,
};
