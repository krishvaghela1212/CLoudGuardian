'use strict';

const { THRESHOLDS } = require('../constants/thresholds');
const { getEC2MonthlyCost, getDownsizeTarget } = require('../pricing/ec2Pricing');
const { buildFinding } = require('../utils/findingBuilder');

/**
 * EC2 Low CPU Utilization Rule
 *
 * Identifies running EC2 instances with average CPU utilization below the
 * configured threshold, recommending downsizing to reduce costs.
 */
module.exports = {
  id: 'EC2_LOW_CPU',
  name: 'Low CPU Utilization',
  category: 'Cost Optimization',
  severity: 'High',
  service: 'EC2',
  description: 'Identifies EC2 instances with average CPU utilization below threshold',

  /**
   * @param {Object} resource - NormalizedResource of type ec2_instance
   * @returns {Object|null} Finding or null
   */
  evaluate(resource) {
    // Only evaluate running instances
    if (resource.metadata.state !== 'running') return null;

    const avgCpu = resource.metrics.avgCpuUtilization;

    // Skip if no metrics available
    if (avgCpu === undefined || avgCpu === null) return null;

    if (avgCpu < THRESHOLDS.EC2_CPU_LOW) {
      const instanceType = resource.metadata.instanceType;
      const currentCost = getEC2MonthlyCost(instanceType, resource.region);
      const downsizeTarget = getDownsizeTarget(instanceType);

      let savings = 0;
      let recommendation = '';

      if (downsizeTarget) {
        const downsizedCost = getEC2MonthlyCost(downsizeTarget, resource.region);
        savings = currentCost - downsizedCost;
        recommendation = `Downsize from ${instanceType} to ${downsizeTarget}. Average CPU is ${avgCpu.toFixed(1)}%.`;
      } else {
        savings = currentCost * 0.5;
        recommendation = `Consider downsizing ${instanceType}. Average CPU is ${avgCpu.toFixed(1)}%.`;
      }

      return buildFinding(this, resource, {
        description: `Instance ${resource.resourceName} (${instanceType}) has average CPU utilization of ${avgCpu.toFixed(1)}%, below the ${THRESHOLDS.EC2_CPU_LOW}% threshold.`,
        recommendation,
        estimatedMonthlySavings: Math.round(savings * 100) / 100,
        confidence: 'High',
        metadata: {
          avgCpuUtilization: avgCpu,
          instanceType,
          downsizeTarget,
          currentMonthlyCost: currentCost,
        },
      });
    }

    return null;
  },
};
