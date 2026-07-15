'use strict';

const { buildFinding } = require('../utils/findingBuilder');

/**
 * Unused Elastic IP Rule
 *
 * Identifies Elastic IPs not attached to a running instance.
 * AWS charges ~$0.005/hour (~$3.60/month) for unused EIPs.
 */
module.exports = {
  id: 'EIP_UNUSED',
  name: 'Unused Elastic IP',
  category: 'Cost Optimization',
  severity: 'Low',
  service: 'VPC',
  description: 'Identifies Elastic IPs not associated with running instances',

  /**
   * @param {Object} resource - NormalizedResource of type elastic_ip
   * @returns {Object|null} Finding or null
   */
  evaluate(resource) {
    // Return null if the EIP is attached to a running instance
    if (resource.metadata.isAttached === true) return null;

    // AWS charges ~$0.005/hour for unused EIPs = ~$3.60/month
    const monthlySavings = 3.60;

    return buildFinding(this, resource, {
      description: `Elastic IP ${resource.resourceName} (${resource.metadata.publicIp || resource.resourceId}) is not associated with a running instance.`,
      recommendation: 'Release the Elastic IP if no longer needed to avoid hourly charges.',
      estimatedMonthlySavings: monthlySavings,
      confidence: 'High',
      metadata: {
        publicIp: resource.metadata.publicIp || null,
        allocationId: resource.metadata.allocationId || null,
      },
    });
  },
};
