'use strict';

const { THRESHOLDS } = require('../constants/thresholds');
const { buildFinding } = require('../utils/findingBuilder');

/**
 * EC2 Stopped Instances Rule
 *
 * Identifies EC2 instances that have been in the 'stopped' state,
 * recommending termination to eliminate EBS volume charges.
 */
module.exports = {
  id: 'EC2_STOPPED',
  name: 'Stopped EC2 Instance',
  category: 'Cost Optimization',
  severity: 'Medium',
  service: 'EC2',
  description: 'Identifies EC2 instances in stopped state still accruing EBS charges',

  /**
   * @param {Object} resource - NormalizedResource of type ec2_instance
   * @returns {Object|null} Finding or null
   */
  evaluate(resource) {
    // Only evaluate stopped instances
    if (resource.metadata.state !== 'stopped') return null;

    // Estimate EBS costs for stopped instances ($10-30/month range, use $20 as midpoint)
    const estimatedEbsCost = 20;

    return buildFinding(this, resource, {
      description: `Instance ${resource.resourceName} (${resource.metadata.instanceType || 'unknown'}) is in stopped state but still accruing EBS storage charges.`,
      recommendation: 'Terminate the instance and snapshot volumes if data retention is needed, or restart if still required.',
      estimatedMonthlySavings: estimatedEbsCost,
      confidence: 'Medium',
      metadata: {
        instanceType: resource.metadata.instanceType,
        state: 'stopped',
        stoppedTime: resource.metadata.stoppedTime || null,
      },
    });
  },
};
