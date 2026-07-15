'use strict';

const { THRESHOLDS } = require('../constants/thresholds');
const { buildFinding } = require('../utils/findingBuilder');

/**
 * Lambda Unused Functions Rule
 *
 * Identifies Lambda functions with zero invocations in the monitoring period,
 * recommending review or deletion to reduce maintenance burden.
 * Lambda doesn't charge when not invoked, so savings are $0.
 */
module.exports = {
  id: 'LAMBDA_UNUSED',
  name: 'Unused Lambda Function',
  category: 'Cost Optimization',
  severity: 'Low',
  service: 'Lambda',
  description: 'Identifies Lambda functions with zero invocations in the monitoring period',

  /**
   * @param {Object} resource - NormalizedResource of type lambda_function
   * @returns {Object|null} Finding or null
   */
  evaluate(resource) {
    const invocationCount = resource.metrics.invocationCount;

    // Return null if invocation metrics are not available
    if (invocationCount === undefined || invocationCount === null) return null;

    // Return null if function has been invoked (count > 0)
    if (invocationCount > 0) return null;

    return buildFinding(this, resource, {
      description: `Lambda function ${resource.resourceName} has had zero invocations in the last ${THRESHOLDS.LAMBDA_UNUSED_DAYS} days.`,
      recommendation: 'Review and delete the function if no longer needed, or investigate why it is not being triggered.',
      estimatedMonthlySavings: 0,
      confidence: 'Medium',
      metadata: {
        invocationCount: 0,
        runtime: resource.metadata.runtime || null,
        lastModified: resource.metadata.lastModified || null,
      },
    });
  },
};
