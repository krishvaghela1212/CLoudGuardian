# Implementation Plan: FinOps Rule Engine

## Overview

Replace the existing Gemini/AI-based infrastructure analysis with a deterministic, pure-function Rule Engine. The engine evaluates normalized AWS resource data against 8 cost-optimization rules and produces structured findings with savings estimates. All code is CommonJS, introduces zero new dependencies, and lives under `server/src/modules/finops/`.

## Tasks

- [x] 1. Create constants modules
  - [x] 1.1 Create `server/src/modules/finops/constants/thresholds.js`
    - Export a `THRESHOLDS` object with keys: `EC2_CPU_LOW` (10), `EC2_STOPPED_DAYS` (7), `EIP_UNATTACHED_HOURS` (1), `RDS_CPU_LOW` (15), `RDS_CONNECTIONS_LOW` (5), `LAMBDA_UNUSED_DAYS` (30), `CLOUDWATCH_RETENTION_MAX` (90), `S3_NO_LIFECYCLE_MIN_OBJECTS` (1000)
    - _Requirements: 8.1_

  - [x] 1.2 Create `server/src/modules/finops/constants/categories.js`
    - Export a `CATEGORIES` object with keys: `COST_OPTIMIZATION`, `SECURITY`, `RELIABILITY`, `PERFORMANCE` mapped to human-readable strings
    - _Requirements: 8.2_

  - [x] 1.3 Create `server/src/modules/finops/constants/severities.js`
    - Export a `SEVERITIES` object with keys: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO` mapped to capitalized strings
    - _Requirements: 8.3_

- [ ] 2. Create pricing utility modules
  - [x] 2.1 Create `server/src/modules/finops/pricing/ec2Pricing.js`
    - Implement `getEC2MonthlyCost(instanceType, region)` using a static hash map of common instance types (t3, t2, m5, m6i, c5, r5 families) with us-east-1 base pricing and region multipliers
    - Implement `getDownsizeTarget(instanceType)` returning the next smaller instance in the same family, or null if already smallest
    - Return 0 for unknown instance types; use CommonJS exports
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 2.2 Create `server/src/modules/finops/pricing/ebsPricing.js`
    - Implement `getEBSMonthlyCost(volumeType, sizeGb, region)` with static per-GB rates for gp2, gp3, io1, io2, st1, sc1, standard volume types
    - Apply region multipliers; return 0 for unknown volume types
    - _Requirements: 7.7, 7.6_

  - [x] 2.3 Create `server/src/modules/finops/pricing/rdsPricing.js`
    - Implement `getRDSMonthlyCost(instanceClass, engine, region)` with static hash map for common db.t3, db.m5, db.r5 classes
    - Implement `getRDSDownsizeTarget(instanceClass)` returning next smaller class or null
    - Return 0 for unknown instance classes
    - _Requirements: 7.8, 7.1, 7.2, 7.6_

  - [ ]* 2.4 Write property tests for pricing utilities
    - **Property 11: Pricing Utility Graceful Degradation**
    - For any string not in the lookup table, pricing functions return 0; for known types they return a non-negative number
    - **Property 14: Downsize Target Family Consistency**
    - For any known instance type, `getDownsizeTarget` returns null or a same-family type with lower cost
    - **Validates: Requirements 7.1, 7.2, 7.4, 7.5**

- [x] 3. Create finding builder utility
  - [x] 3.1 Create `server/src/modules/finops/utils/findingBuilder.js`
    - Implement `buildFinding(rule, resource, details)` that produces a 14-field Finding object
    - Auto-populate: `currency` = 'USD', `version` = '1.0.0', `timestamp` = ISO 8601 now
    - Default `confidence` to 'High' if not in details; default `metadata` to `{}`
    - Ensure `estimatedMonthlySavings` is clamped to >= 0
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 3.2 Write property tests for finding builder
    - **Property 5: Finding Schema Validity**
    - For any valid rule/resource/details input, output contains all 14 fields, currency is 'USD', version is '1.0.0', savings >= 0, timestamp is valid ISO 8601
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.7**

- [x] 4. Create normalizer service
  - [x] 4.1 Create `server/src/modules/finops/services/normalizer.js`
    - Implement `normalize(rawAwsData, region)` that transforms raw AWS SDK responses into `NormalizedResource[]`
    - Support resource types: ec2_instance, ebs_volume, elastic_ip, s3_bucket, rds_instance, lambda_function, cloudwatch_log_group
    - Map service names: EC2, EBS, VPC, S3, RDS, Lambda, CloudWatch
    - Extract Name tags for EC2 instances into `resourceName`
    - Default `metadata` to `{}` and `metrics` to `{}` when source data is missing
    - Handle null/undefined sections gracefully (return empty array, no throw)
    - Do not mutate rawAwsData input
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 4.2 Write property tests for normalizer
    - **Property 12: Normalizer Null Tolerance**
    - For any rawAwsData with null/undefined sections, normalizer produces empty array for those sections without throwing
    - **Property 13: Normalizer Output Schema Completeness**
    - For any valid input, every NormalizedResource has all required fields: resourceType, service, region, resourceId, resourceName, metadata (object), metrics (object)
    - **Validates: Requirements 5.1, 5.3, 5.5, 5.6**

- [x] 5. Checkpoint - Verify foundation modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create Rule Engine core
  - [x] 6.1 Create `server/src/modules/finops/engine/RuleEngine.js`
    - Implement `class RuleEngine` with `constructor(options)`, `loadRules()`, `evaluate(normalizedResources)`, `getLoadedRules()`
    - `loadRules()`: auto-discover `*.rule.js` files from `../rules/` directory, validate each exports `{ id, name, category, severity, service, evaluate }`, skip invalid with error log, sort by id lexicographically, log total loaded count
    - `evaluate(normalizedResources)`: route each resource to rules matching its `service`, try/catch each `rule.evaluate(resource)`, collect non-null findings, compute summary (totalFindings, totalEstimatedSavings, findingsByService, findingsBySeverity), compute executionMetadata (rulesLoaded, rulesExecuted, rulesFailed, executionTimeMs, errors)
    - Use existing winston logger (`require('../../utils/logger')` from `server/src/utils/logger`)
    - Do not mutate input array
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 18.1, 18.2, 18.3, 18.4, 18.5, 19.1, 19.2, 19.3_

  - [ ]* 6.2 Write property tests for Rule Engine
    - **Property 1: Determinism** — evaluating same input twice produces identical findings (excluding timestamps/executionTimeMs)
    - **Property 3: Fault Isolation** — injecting a throwing rule still returns findings from non-failing rules, rulesFailed counter matches throwing rules count
    - **Property 4: Summary Integrity** — totalEstimatedSavings equals sum of all finding savings; findingsByService/findingsBySeverity counts match findings array
    - **Property 6: Service Routing** — rules only evaluate resources matching their declared service
    - **Property 8: Input Immutability** — normalizedResources array is unmodified after evaluate()
    - **Validates: Requirements 2.1, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2**

- [x] 7. Create individual rule modules
  - [x] 7.1 Create `server/src/modules/finops/rules/ec2LowCpu.rule.js`
    - Export rule object with `id: 'EC2_LOW_CPU'`, `service: 'EC2'`, `severity: 'High'`, `category: CATEGORIES.COST_OPTIMIZATION`
    - `evaluate(resource)`: return null if state !== 'running' or avgCpuUtilization is missing; if avgCpu < THRESHOLDS.EC2_CPU_LOW, compute savings using ec2Pricing and return finding via findingBuilder
    - Import from `../constants/thresholds`, `../pricing/ec2Pricing`, `../utils/findingBuilder`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 7.2 Create `server/src/modules/finops/rules/ec2Stopped.rule.js`
    - Export rule with `id: 'EC2_STOPPED'`, `service: 'EC2'`, `severity: 'Medium'`
    - `evaluate(resource)`: return null if state !== 'stopped'; calculate days stopped from metadata.stoppedTime; if > THRESHOLDS.EC2_STOPPED_DAYS, estimate savings from EBS volumes and return finding
    - Import from `../constants/thresholds`, `../pricing/ebsPricing`, `../utils/findingBuilder`
    - _Requirements: 10.1, 10.2, 10.3, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 7.3 Create `server/src/modules/finops/rules/ebsUnattached.rule.js`
    - Export rule with `id: 'EBS_UNATTACHED'`, `service: 'EBS'`, `severity: 'Medium'`
    - `evaluate(resource)`: return null if state !== 'available'; compute monthly cost via ebsPricing and return finding
    - Import from `../pricing/ebsPricing`, `../utils/findingBuilder`
    - _Requirements: 11.1, 11.2, 11.3, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 7.4 Create `server/src/modules/finops/rules/eipUnused.rule.js`
    - Export rule with `id: 'EIP_UNUSED'`, `service: 'VPC'`, `severity: 'Low'`
    - `evaluate(resource)`: return null if resource is attached to a running instance; estimate savings at ~$3.60/month for unused EIP and return finding
    - Import from `../utils/findingBuilder`, `../constants/thresholds`
    - _Requirements: 12.1, 12.2, 12.3, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 7.5 Create `server/src/modules/finops/rules/s3NoLifecycle.rule.js`
    - Export rule with `id: 'S3_NO_LIFECYCLE'`, `service: 'S3'`, `severity: 'Medium'`
    - `evaluate(resource)`: return null if bucket has lifecycle policy or object count < THRESHOLDS.S3_NO_LIFECYCLE_MIN_OBJECTS; return finding recommending lifecycle policy
    - Import from `../constants/thresholds`, `../utils/findingBuilder`
    - _Requirements: 13.1, 13.2, 13.3, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 7.6 Create `server/src/modules/finops/rules/rdsOversized.rule.js`
    - Export rule with `id: 'RDS_OVERSIZED'`, `service: 'RDS'`, `severity: 'High'`
    - `evaluate(resource)`: return null if avgCpuUtilization >= RDS_CPU_LOW OR avgConnections >= RDS_CONNECTIONS_LOW OR metrics missing; compute savings via rdsPricing downsize target and return finding
    - Import from `../constants/thresholds`, `../pricing/rdsPricing`, `../utils/findingBuilder`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 7.7 Create `server/src/modules/finops/rules/lambdaUnused.rule.js`
    - Export rule with `id: 'LAMBDA_UNUSED'`, `service: 'Lambda'`, `severity: 'Low'`
    - `evaluate(resource)`: return null if invocationCount metrics missing or invocationCount > 0; if zero invocations in last LAMBDA_UNUSED_DAYS, return finding recommending review/deletion
    - Import from `../constants/thresholds`, `../utils/findingBuilder`
    - _Requirements: 15.1, 15.2, 15.3, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 7.8 Create `server/src/modules/finops/rules/cwLongRetention.rule.js`
    - Export rule with `id: 'CW_LONG_RETENTION'`, `service: 'CloudWatch'`, `severity: 'Low'`
    - `evaluate(resource)`: if retentionDays is null/undefined (indefinite), return finding recommending setting a policy; if retentionDays > CLOUDWATCH_RETENTION_MAX, return finding recommending reduction; otherwise return null
    - Import from `../constants/thresholds`, `../utils/findingBuilder`
    - _Requirements: 16.1, 16.2, 16.3, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [ ]* 7.9 Write property tests for individual rules
    - **Property 7: Null Safety for Missing Metrics** — for any resource with undefined/null metrics, all rules return null without throwing
    - **Property 10: Rule Threshold Metamorphic Property** — for each rule, values below threshold produce findings, values at/above threshold produce null
    - **Validates: Requirements 9.1, 9.3, 9.4, 10.1, 10.3, 11.1, 11.3, 12.1, 12.3, 13.1, 13.2, 13.3, 14.1, 14.3, 14.4, 15.1, 15.2, 15.3, 16.1, 16.2, 16.3**

- [x] 8. Checkpoint - Verify Rule Engine and rules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Integrate Rule Engine into Scanner Service
  - [x] 9.1 Modify `server/src/services/scanner/scanner.service.js` to replace Gemini/AI analysis with Rule Engine
    - Add requires: `const RuleEngine = require('../../modules/finops/engine/RuleEngine')` and `const { normalize } = require('../../modules/finops/services/normalizer')`
    - Replace the "AI Analysis..." step: emit progress 'Analyzing Resources...', call `normalize(rawAwsData, region)`, instantiate RuleEngine, call `loadRules()`, call `evaluate(normalizedResources)`
    - Update the "Saving Report..." step to persist `{ findings, summary, executionMetadata }` to the Report model (map to existing aiAnalysis schema or store alongside)
    - Update the "Completed" event data to include `findings` and `summary` from Rule Engine result
    - Remove or comment out the `analyzeCloudInfrastructure` import and call
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 19.4_

  - [ ]* 9.2 Write unit tests for scanner integration
    - Test that normalize and RuleEngine are called in correct order
    - Test that Socket.IO progress events emit 'Analyzing Resources...' before evaluation
    - Test that findings and summary are included in the 'Completed' event
    - _Requirements: 17.1, 17.2, 17.5_

- [x] 10. Final checkpoint - Verify complete integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- All modules use CommonJS (`require`/`module.exports`) to match existing codebase
- No new npm dependencies are introduced
- The winston logger at `server/src/utils/logger.js` is used for all logging
- Module imports within finops use relative paths (e.g., `../utils/findingBuilder`, `../pricing/ec2Pricing`)
- Scanner service imports from `../../modules/finops/engine/RuleEngine` and `../../modules/finops/services/normalizer`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "2.4"] },
    { "id": 3, "tasks": ["4.1", "3.2"] },
    { "id": 4, "tasks": ["6.1", "4.2"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "6.2"] },
    { "id": 6, "tasks": ["9.1", "7.9"] },
    { "id": 7, "tasks": ["9.2"] }
  ]
}
```
