'use strict';

/**
 * Build a standardized 14-field Finding object.
 *
 * @param {Object} rule - The rule that produced this finding
 * @param {Object} resource - The NormalizedResource evaluated
 * @param {Object} details - Rule-specific details
 * @param {string} details.description - Description of the issue
 * @param {string} details.recommendation - Action to take
 * @param {number} details.estimatedMonthlySavings - Savings estimate
 * @param {string} [details.confidence] - Confidence level (defaults to 'High')
 * @param {Object} [details.metadata] - Additional metadata (defaults to {})
 * @returns {Object} Finding object with 14 fields
 */
function buildFinding(rule, resource, details) {
  const savings = Math.round(Math.max(0, details.estimatedMonthlySavings || 0) * 100) / 100;

  return {
    ruleId: rule.id,
    name: rule.name,
    category: rule.category,
    service: rule.service,
    severity: rule.severity,
    resourceId: resource.resourceId,
    resourceName: resource.resourceName,
    description: details.description,
    recommendation: details.recommendation,
    estimatedMonthlySavings: savings,
    currency: 'USD',
    confidence: details.confidence || 'High',
    metadata: details.metadata || {},
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
}

module.exports = { buildFinding };
