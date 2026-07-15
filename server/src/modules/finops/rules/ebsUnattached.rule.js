'use strict';

const { getEBSMonthlyCost } = require('../pricing/ebsPricing');
const { buildFinding } = require('../utils/findingBuilder');

/**
 * EBS Unattached Volumes Rule
 *
 * Identifies EBS volumes in 'available' state (not attached to any instance),
 * recommending deletion or snapshot to eliminate storage charges.
 */
module.exports = {
  id: 'EBS_UNATTACHED',
  name: 'Unattached EBS Volume',
  category: 'Cost Optimization',
  severity: 'Medium',
  service: 'EBS',
  description: 'Identifies EBS volumes not attached to any instance',

  /**
   * @param {Object} resource - NormalizedResource of type ebs_volume
   * @returns {Object|null} Finding or null
   */
  evaluate(resource) {
    // Only evaluate volumes in 'available' state (unattached)
    if (resource.metadata.state !== 'available') return null;

    const volumeType = resource.metadata.volumeType || 'gp2';
    const sizeGb = resource.metadata.sizeGb || 0;
    const monthlyCost = getEBSMonthlyCost(volumeType, sizeGb, resource.region);

    return buildFinding(this, resource, {
      description: `EBS volume ${resource.resourceName} (${volumeType}, ${sizeGb} GB) is not attached to any instance.`,
      recommendation: 'Delete the volume if no longer needed, or create a snapshot before deletion for data retention.',
      estimatedMonthlySavings: monthlyCost,
      confidence: 'High',
      metadata: {
        volumeType,
        sizeGb,
        currentMonthlyCost: monthlyCost,
      },
    });
  },
};
