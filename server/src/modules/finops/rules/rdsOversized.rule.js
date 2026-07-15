'use strict';

const { THRESHOLDS } = require('../constants/thresholds');
const { getRDSMonthlyCost, getRDSDownsizeTarget } = require('../pricing/rdsPricing');
const { buildFinding } = require('../utils/findingBuilder');

/**
 * RDS Oversized Instance Rule
 *
 * Identifies RDS instances with both low CPU utilization and low connection
 * counts, recommending downsizing to reduce database costs.
 */
module.exports = {
  id: 'RDS_OVERSIZED',
  name: 'Oversized RDS Instance',
  category: 'Cost Optimization',
  severity: 'High',
  service: 'RDS',
  description: 'Identifies RDS instances with low CPU and connection counts suggesting oversizing',

  /**
   * @param {Object} resource - NormalizedResource of type rds_instance
   * @returns {Object|null} Finding or null
   */
  evaluate(resource) {
    const avgCpu = resource.metrics.avgCpuUtilization;
    const avgConnections = resource.metrics.avgConnections;

    // Return null if metrics are missing
    if (avgCpu === undefined || avgCpu === null) return null;
    if (avgConnections === undefined || avgConnections === null) return null;

    // Return null if CPU or connections are above thresholds (not oversized)
    if (avgCpu >= THRESHOLDS.RDS_CPU_LOW) return null;
    if (avgConnections >= THRESHOLDS.RDS_CONNECTIONS_LOW) return null;

    const instanceClass = resource.metadata.instanceClass;
    const engine = resource.metadata.engine || 'mysql';
    const currentCost = getRDSMonthlyCost(instanceClass, engine, resource.region);
    const downsizeTarget = getRDSDownsizeTarget(instanceClass);

    let savings = 0;
    let recommendation = '';

    if (downsizeTarget) {
      const downsizedCost = getRDSMonthlyCost(downsizeTarget, engine, resource.region);
      savings = currentCost - downsizedCost;
      recommendation = `Downsize from ${instanceClass} to ${downsizeTarget}. Average CPU is ${avgCpu.toFixed(1)}% and average connections is ${avgConnections.toFixed(1)}.`;
    } else {
      savings = currentCost * 0.5;
      recommendation = `Consider downsizing ${instanceClass}. Average CPU is ${avgCpu.toFixed(1)}% and average connections is ${avgConnections.toFixed(1)}.`;
    }

    return buildFinding(this, resource, {
      description: `RDS instance ${resource.resourceName} (${instanceClass}) has average CPU of ${avgCpu.toFixed(1)}% and ${avgConnections.toFixed(1)} average connections, both below thresholds.`,
      recommendation,
      estimatedMonthlySavings: Math.round(savings * 100) / 100,
      confidence: 'High',
      metadata: {
        avgCpuUtilization: avgCpu,
        avgConnections,
        instanceClass,
        engine,
        downsizeTarget,
        currentMonthlyCost: currentCost,
      },
    });
  },
};
