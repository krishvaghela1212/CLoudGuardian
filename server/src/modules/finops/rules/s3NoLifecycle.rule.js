'use strict';

const { THRESHOLDS } = require('../constants/thresholds');
const { buildFinding } = require('../utils/findingBuilder');

/**
 * S3 No Lifecycle Policy Rule
 *
 * Identifies S3 buckets without lifecycle policies that contain a significant
 * number of objects, recommending lifecycle policies for data tiering.
 */
module.exports = {
  id: 'S3_NO_LIFECYCLE',
  name: 'S3 Bucket Without Lifecycle Policy',
  category: 'Cost Optimization',
  severity: 'Medium',
  service: 'S3',
  description: 'Identifies S3 buckets without lifecycle policies containing significant data',

  /**
   * @param {Object} resource - NormalizedResource of type s3_bucket
   * @returns {Object|null} Finding or null
   */
  evaluate(resource) {
    // Return null if bucket already has a lifecycle policy
    if (resource.metadata.hasLifecyclePolicy === true) return null;

    // Return null if bucket has fewer objects than the threshold
    const objectCount = resource.metadata.objectCount || 0;
    if (objectCount < THRESHOLDS.S3_NO_LIFECYCLE_MIN_OBJECTS) return null;

    // Estimate 20% storage savings from lifecycle tiering
    const totalSizeBytes = resource.metadata.totalSizeBytes || 0;
    const totalSizeGb = totalSizeBytes / (1024 * 1024 * 1024);
    // S3 Standard costs ~$0.023/GB/month; 20% savings from tiering
    const estimatedCurrentCost = totalSizeGb * 0.023;
    const estimatedSavings = estimatedCurrentCost * 0.20;

    return buildFinding(this, resource, {
      description: `S3 bucket ${resource.resourceName} has ${objectCount.toLocaleString()} objects without a lifecycle policy configured.`,
      recommendation: 'Configure a lifecycle policy to transition infrequently accessed objects to S3-IA or Glacier, and set expiration rules for old data.',
      estimatedMonthlySavings: Math.round(estimatedSavings * 100) / 100,
      confidence: 'Medium',
      metadata: {
        objectCount,
        totalSizeBytes,
        hasLifecyclePolicy: false,
      },
    });
  },
};
