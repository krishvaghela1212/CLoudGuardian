'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../../../utils/logger');

/**
 * Core orchestrator that loads rules from the rules/ directory,
 * routes normalized resources to applicable rules, handles failures
 * gracefully, and aggregates findings into a structured result.
 */
class RuleEngine {
  constructor(options = {}) {
    this.options = options;
    this.rules = [];
  }

  /**
   * Auto-discover and load all *.rule.js files from the rules/ directory.
   * Validates each rule exports { id, name, category, severity, service, evaluate }.
   * Invalid rules are logged and skipped. Rules are sorted by id for deterministic order.
   */
  loadRules() {
    const rulesDir = path.join(__dirname, '..', 'rules');
    let files = [];

    try {
      files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.rule.js'));
    } catch (error) {
      logger.error(`[RuleEngine] Failed to read rules directory: ${error.message}`);
      return;
    }

    this.rules = [];

    for (const file of files) {
      try {
        const rule = require(path.join(rulesDir, file));

        // Validate rule interface
        if (
          !rule.id ||
          !rule.name ||
          !rule.category ||
          !rule.severity ||
          !rule.service ||
          typeof rule.evaluate !== 'function'
        ) {
          throw new Error(`Invalid rule interface in ${file}: missing required exports`);
        }

        this.rules.push(rule);
        logger.info(`[RuleEngine] Loaded rule: ${rule.id}`);
      } catch (error) {
        logger.error(`[RuleEngine] Failed to load rule from ${file}: ${error.message}`);
        // Skip invalid rules, continue loading
      }
    }

    // Sort for deterministic execution order
    this.rules.sort((a, b) => a.id.localeCompare(b.id));
    logger.info(`[RuleEngine] ${this.rules.length} rules loaded successfully`);
  }

  /**
   * Evaluate all loaded rules against normalized resources.
   * Routes each resource to rules matching its service.
   * Catches and logs errors per-rule without halting execution.
   *
   * @param {Array} normalizedResources - Array of NormalizedResource objects
   * @returns {Object} RuleEngineResult with findings, summary, and executionMetadata
   */
  evaluate(normalizedResources) {
    const startTime = Date.now();
    const findings = [];
    const errors = [];
    let rulesExecuted = 0;
    let rulesFailed = 0;

    for (const rule of this.rules) {
      // Filter resources applicable to this rule's service
      const applicableResources = normalizedResources.filter(
        r => r.service === rule.service
      );

      for (const resource of applicableResources) {
        try {
          rulesExecuted++;
          const finding = rule.evaluate(resource);
          if (finding !== null && finding !== undefined) {
            findings.push(finding);
          }
        } catch (error) {
          rulesFailed++;
          const errorMsg = `Rule ${rule.id} failed on ${resource.resourceId}: ${error.message}`;
          errors.push(errorMsg);
          logger.error(`[RuleEngine] ${errorMsg}`, { stack: error.stack });
          // Continue — do not halt execution
        }
      }
    }

    const summary = {
      totalFindings: findings.length,
      totalEstimatedSavings: findings.reduce(
        (sum, f) => sum + (f.estimatedMonthlySavings || 0),
        0
      ),
      findingsByService: groupAndCount(findings, 'service'),
      findingsBySeverity: groupAndCount(findings, 'severity'),
    };

    return {
      findings,
      summary,
      executionMetadata: {
        rulesLoaded: this.rules.length,
        rulesExecuted,
        rulesFailed,
        executionTimeMs: Date.now() - startTime,
        errors,
      },
    };
  }

  /**
   * Get list of loaded rule metadata (for diagnostics).
   * @returns {Array} Array of { id, name, category, severity, service }
   */
  getLoadedRules() {
    return this.rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      category: rule.category,
      severity: rule.severity,
      service: rule.service,
    }));
  }
}

/**
 * Group an array of objects by a key and count occurrences.
 * @param {Array} items - Array of objects
 * @param {string} key - Property name to group by
 * @returns {Object} Map of key values to counts
 */
function groupAndCount(items, key) {
  const counts = {};
  for (const item of items) {
    const value = item[key] || 'Unknown';
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

module.exports = RuleEngine;
