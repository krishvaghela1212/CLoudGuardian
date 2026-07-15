'use strict';

const { THRESHOLDS } = require('../constants/thresholds');
const { buildFinding } = require('../utils/findingBuilder');

/**
 * CloudWatch Long Retention Rule
 *
 * Identifies CloudWatch Log Groups with retention periods exceeding the
 * recommended maximum, or with no retention policy (indefinite retention).
 */
module.exports = {
  id: 'CW_LONG_RETENTION',
  name: 'CloudWatch Log Long Retention',
  category: 'Cost Optimization',
  severity: 'Low',
  service: 'CloudWatch',
  description: 'Identifies CloudWatch Log Groups with excessive or indefinite retention periods',

  /**
   * @param {Object} resource - NormalizedResource of type cloudwatch_log_group
   * @returns {Object|null} Finding or null
   */
  evaluate(resource) {
    const retentionDays = resource.metadata.retentionDays;

    // Case 1: No retention policy set (indefinite retention)
    if (retentionDays === null || retentionDays === undefined) {
      const storedBytes = resource.metadata.storedBytes || 0;
      // CloudWatch Logs costs ~$0.03/GB/month for storage
      const storedGb = storedBytes / (1024 * 1024 * 1024);
      const estimatedSavings = storedGb > 0 ? Math.round(storedGb * 0.03 * 0.5 * 100) / 100 : 0;

      return buildFinding(this, resource, {
        description: `Log group ${resource.resourceName} has no retention policy configured (indefinite retention).`,
        recommendation: `Set a retention policy (e.g., ${THRESHOLDS.CLOUDWATCH_RETENTION_MAX} days) to automatically expire old logs and reduce storage costs.`,
        estimatedMonthlySavings: estimatedSavings,
        confidence: 'Medium',
        metadata: {
          retentionDays: null,
          storedBytes,
          logGroupName: resource.metadata.logGroupName || resource.resourceName,
        },
      });
    }

    // Case 2: Retention exceeds the maximum threshold
    if (retentionDays > THRESHOLDS.CLOUDWATCH_RETENTION_MAX) {
      const storedBytes = resource.metadata.storedBytes || 0;
      // Estimate savings from reducing retention
      const storedGb = storedBytes / (1024 * 1024 * 1024);
      const reductionRatio = 1 - (THRESHOLDS.CLOUDWATCH_RETENTION_MAX / retentionDays);
      const estimatedSavings = storedGb > 0 ? Math.round(storedGb * 0.03 * reductionRatio * 100) / 100 : 0;

      return buildFinding(this, resource, {
        description: `Log group ${resource.resourceName} has a retention period of ${retentionDays} days, exceeding the recommended maximum of ${THRESHOLDS.CLOUDWATCH_RETENTION_MAX} days.`,
        recommendation: `Reduce retention to ${THRESHOLDS.CLOUDWATCH_RETENTION_MAX} days or less. Export older logs to S3 if long-term retention is required.`,
        estimatedMonthlySavings: estimatedSavings,
        confidence: 'Medium',
        metadata: {
          retentionDays,
          storedBytes,
          recommendedRetention: THRESHOLDS.CLOUDWATCH_RETENTION_MAX,
          logGroupName: resource.metadata.logGroupName || resource.resourceName,
        },
      });
    }

    // Retention is within acceptable range
    return null;
  },
};
