# Requirements Document

## Introduction

The FinOps Rule Engine is a deterministic, pure-function cost-optimization analysis module that replaces the existing AI/Gemini-based infrastructure analysis. It evaluates normalized AWS resource data against a configurable set of rules and produces structured findings with savings estimates. The module uses CommonJS, introduces no new npm dependencies, and does not modify authentication, STS, Socket.IO, or MongoDB schema layers.

## Glossary

- **Rule_Engine**: The core orchestrator that loads rules from the rules directory, routes normalized resources to applicable rules, handles failures per-rule, and aggregates findings into a structured result.
- **Normalizer**: A pure-function service that transforms raw AWS SDK responses into a uniform NormalizedResource format.
- **Finding_Builder**: A factory utility that constructs standardized 14-field Finding objects with consistent formatting, timestamps, and versioning.
- **Pricing_Utility**: Static lookup modules (EC2, EBS, RDS) that provide O(1) cost estimates from hash maps without network calls.
- **Constants_Module**: Centralized configuration for thresholds, categories, and severity levels used by rules and utilities.
- **Rule**: A self-contained CommonJS module that evaluates one specific optimization condition against a NormalizedResource and returns a Finding or null.
- **NormalizedResource**: A uniform data object with fields resourceType, service, region, resourceId, resourceName, metadata, and metrics.
- **Finding**: A 14-field structured object describing a cost-optimization issue, including ruleId, severity, estimatedMonthlySavings, and recommendation.
- **Scanner_Service**: The existing service that collects raw AWS infrastructure data and orchestrates analysis.
- **RuleEngineResult**: The output structure containing findings array, summary statistics, and execution metadata.

## Requirements

### Requirement 1: Rule Engine Core Loading

**User Story:** As a developer, I want the Rule Engine to automatically discover and load rule modules from the rules directory, so that new rules can be added without modifying engine code.

#### Acceptance Criteria

1. WHEN the Rule_Engine loads rules, THE Rule_Engine SHALL auto-discover all files matching the pattern `*.rule.js` in the rules directory.
2. WHEN a rule file is loaded, THE Rule_Engine SHALL validate that the module exports an object with id, name, category, severity, service, and evaluate function properties.
3. IF a rule file fails to load or has an invalid interface, THEN THE Rule_Engine SHALL log the error and skip that file without halting the loading of other rules.
4. WHEN all rules are loaded, THE Rule_Engine SHALL sort rules by id in lexicographic order for deterministic execution.
5. WHEN rule loading completes, THE Rule_Engine SHALL log the total number of rules loaded successfully.

---

### Requirement 2: Rule Engine Evaluation

**User Story:** As a developer, I want the Rule Engine to evaluate all loaded rules against normalized resources and aggregate findings, so that a complete cost-optimization report is produced in one pass.

#### Acceptance Criteria

1. WHEN the Rule_Engine evaluates resources, THE Rule_Engine SHALL route each NormalizedResource only to rules whose declared service matches the resource service.
2. WHEN a rule evaluate function returns a non-null Finding, THE Rule_Engine SHALL include that Finding in the result findings array.
3. WHEN evaluation completes, THE Rule_Engine SHALL produce a RuleEngineResult containing findings array, summary object, and executionMetadata object.
4. WHEN evaluation completes, THE Rule_Engine SHALL compute summary.totalEstimatedSavings as the sum of estimatedMonthlySavings across all findings.
5. WHEN evaluation completes, THE Rule_Engine SHALL compute summary.findingsByService as a count of findings grouped by service.
6. WHEN evaluation completes, THE Rule_Engine SHALL compute summary.findingsBySeverity as a count of findings grouped by severity.
7. THE Rule_Engine SHALL not mutate the input normalizedResources array during evaluation.

---

### Requirement 3: Rule Engine Fault Isolation

**User Story:** As a developer, I want a failing rule to never prevent other rules from executing, so that partial results are always available even when individual rules have bugs.

#### Acceptance Criteria

1. IF a rule evaluate function throws an exception, THEN THE Rule_Engine SHALL catch the error, log it with the rule id and resource id, and continue executing remaining rules.
2. IF a rule evaluate function throws an exception, THEN THE Rule_Engine SHALL increment the executionMetadata.rulesFailed counter by one.
3. IF a rule evaluate function throws an exception, THEN THE Rule_Engine SHALL add the error message to the executionMetadata.errors array.
4. WHEN evaluation completes after one or more rule failures, THE Rule_Engine SHALL still return a valid RuleEngineResult with findings from all non-failing rules.

---

### Requirement 4: Determinism

**User Story:** As a developer, I want the Rule Engine to produce identical output given identical input, so that findings are reproducible and unit tests are reliable.

#### Acceptance Criteria

1. THE Rule_Engine SHALL produce identical RuleEngineResult findings for identical normalizedResources input regardless of wall-clock time (excluding executionMetadata.executionTimeMs and finding timestamps).
2. THE Rule_Engine SHALL execute rules in a fixed deterministic order based on lexicographic rule id sorting.
3. THE Normalizer SHALL produce identical NormalizedResource arrays for identical rawAwsData input.
4. THE Pricing_Utility SHALL return identical cost values for identical instanceType and region input pairs.

---

### Requirement 5: Normalizer Service

**User Story:** As a developer, I want raw AWS SDK responses transformed into a uniform NormalizedResource format, so that rules can evaluate resources without knowing AWS SDK internals.

#### Acceptance Criteria

1. WHEN the Normalizer receives rawAwsData, THE Normalizer SHALL produce an array of NormalizedResource objects each containing resourceType, service, region, resourceId, resourceName, metadata, and metrics fields.
2. WHEN an EC2 instance has a Name tag, THE Normalizer SHALL use that tag value as the resourceName.
3. IF a section of rawAwsData is null or undefined, THEN THE Normalizer SHALL return an empty array for that section without throwing an error.
4. THE Normalizer SHALL not mutate the rawAwsData input object.
5. WHEN the Normalizer produces a NormalizedResource, THE Normalizer SHALL default metadata to an empty object if source fields are missing.
6. WHEN the Normalizer produces a NormalizedResource, THE Normalizer SHALL default metrics to an empty object if no CloudWatch data is available for that resource.
7. THE Normalizer SHALL support the following resource types: ec2_instance, ebs_volume, elastic_ip, s3_bucket, rds_instance, lambda_function, and cloudwatch_log_group.

---

### Requirement 6: Finding Builder

**User Story:** As a developer, I want a utility that constructs standardized Finding objects, so that all findings have a consistent 14-field schema regardless of which rule produces them.

#### Acceptance Criteria

1. WHEN the Finding_Builder builds a finding, THE Finding_Builder SHALL populate all 14 fields: ruleId, name, category, service, resourceId, resourceName, severity, description, recommendation, estimatedMonthlySavings, currency, confidence, metadata, timestamp, and version.
2. WHEN the Finding_Builder builds a finding, THE Finding_Builder SHALL set currency to 'USD'.
3. WHEN the Finding_Builder builds a finding, THE Finding_Builder SHALL set version to '1.0.0'.
4. WHEN the Finding_Builder builds a finding, THE Finding_Builder SHALL set timestamp to the current ISO 8601 string.
5. IF confidence is not specified in details, THEN THE Finding_Builder SHALL default confidence to 'High'.
6. IF metadata is not specified in details, THEN THE Finding_Builder SHALL default metadata to an empty object.
7. THE Finding_Builder SHALL ensure estimatedMonthlySavings is a non-negative number.

---

### Requirement 7: Pricing Utilities

**User Story:** As a developer, I want static pricing lookup tables for EC2, EBS, and RDS, so that rules can estimate savings without calling external AWS Pricing APIs.

#### Acceptance Criteria

1. WHEN the Pricing_Utility receives a known instanceType and region, THE Pricing_Utility SHALL return a non-negative monthly cost in USD.
2. IF the Pricing_Utility receives an unknown instanceType, THEN THE Pricing_Utility SHALL return 0.
3. THE Pricing_Utility SHALL use us-east-1 base pricing with region multipliers for other regions.
4. WHEN getDownsizeTarget is called with a known instanceType, THE Pricing_Utility SHALL return the next smaller instance type in the same family.
5. IF getDownsizeTarget is called with the smallest instance type in a family, THEN THE Pricing_Utility SHALL return null.
6. THE Pricing_Utility SHALL make zero network requests during any lookup operation.
7. WHEN getEBSMonthlyCost is called, THE Pricing_Utility SHALL compute cost based on volumeType and sizeGb.
8. WHEN getRDSMonthlyCost is called, THE Pricing_Utility SHALL compute cost based on instanceClass and engine.

---

### Requirement 8: Constants Module

**User Story:** As a developer, I want centralized threshold, category, and severity constants, so that rule behavior can be tuned from a single location without modifying rule logic.

#### Acceptance Criteria

1. THE Constants_Module SHALL export a THRESHOLDS object containing numeric threshold values for EC2_CPU_LOW, EC2_STOPPED_DAYS, EIP_UNATTACHED_HOURS, RDS_CPU_LOW, RDS_CONNECTIONS_LOW, LAMBDA_UNUSED_DAYS, CLOUDWATCH_RETENTION_MAX, and S3_NO_LIFECYCLE_MIN_OBJECTS.
2. THE Constants_Module SHALL export a CATEGORIES object containing string values for COST_OPTIMIZATION, SECURITY, RELIABILITY, and PERFORMANCE.
3. THE Constants_Module SHALL export a SEVERITIES object containing string values for CRITICAL, HIGH, MEDIUM, LOW, and INFO.

---

### Requirement 9: EC2 Low CPU Rule

**User Story:** As a cloud operator, I want to identify EC2 instances with consistently low CPU utilization, so that I can downsize them and reduce costs.

#### Acceptance Criteria

1. WHEN the EC2_LOW_CPU rule evaluates a running EC2 instance with avgCpuUtilization below the EC2_CPU_LOW threshold, THE Rule SHALL return a Finding with a downsize recommendation.
2. WHEN the EC2_LOW_CPU rule finds a downsize target, THE Rule SHALL calculate estimatedMonthlySavings as the difference between current cost and downsized cost.
3. IF avgCpuUtilization metrics are not available for an instance, THEN THE Rule SHALL return null without error.
4. IF the instance state is not 'running', THEN THE Rule SHALL return null without evaluation.

---

### Requirement 10: EC2 Stopped Instances Rule

**User Story:** As a cloud operator, I want to identify EC2 instances that have been stopped for an extended period, so that I can terminate them or snapshot their volumes to save costs.

#### Acceptance Criteria

1. WHEN the EC2_STOPPED rule evaluates an EC2 instance in 'stopped' state for longer than EC2_STOPPED_DAYS threshold, THE Rule SHALL return a Finding recommending termination or volume snapshot.
2. WHEN the EC2_STOPPED rule produces a finding, THE Rule SHALL calculate estimatedMonthlySavings based on associated EBS volumes still accruing charges.
3. IF the instance has been stopped for fewer days than EC2_STOPPED_DAYS, THEN THE Rule SHALL return null.

---

### Requirement 11: EBS Unattached Volumes Rule

**User Story:** As a cloud operator, I want to identify EBS volumes not attached to any instance, so that I can delete unused storage and reduce costs.

#### Acceptance Criteria

1. WHEN the EBS_UNATTACHED rule evaluates an EBS volume with state 'available', THE Rule SHALL return a Finding recommending deletion or snapshot.
2. WHEN the EBS_UNATTACHED rule produces a finding, THE Rule SHALL calculate estimatedMonthlySavings based on volumeType and sizeGb using the Pricing_Utility.
3. IF the EBS volume state is not 'available', THEN THE Rule SHALL return null.

---

### Requirement 12: Unused Elastic IP Rule

**User Story:** As a cloud operator, I want to identify Elastic IPs not associated with running instances, so that I can release them and avoid unnecessary charges.

#### Acceptance Criteria

1. WHEN the EIP_UNUSED rule evaluates an Elastic IP that is not attached to a running instance, THE Rule SHALL return a Finding recommending release.
2. WHEN the EIP_UNUSED rule produces a finding, THE Rule SHALL calculate estimatedMonthlySavings based on the AWS hourly charge for unused EIPs.
3. IF the Elastic IP is associated with a running instance, THEN THE Rule SHALL return null.

---

### Requirement 13: S3 No Lifecycle Policy Rule

**User Story:** As a cloud operator, I want to identify S3 buckets without lifecycle policies that contain significant data, so that I can implement data tiering to reduce storage costs.

#### Acceptance Criteria

1. WHEN the S3_NO_LIFECYCLE rule evaluates an S3 bucket without a lifecycle policy and with object count above S3_NO_LIFECYCLE_MIN_OBJECTS threshold, THE Rule SHALL return a Finding recommending lifecycle policy creation.
2. IF the bucket has a lifecycle policy, THEN THE Rule SHALL return null.
3. IF the bucket has fewer objects than S3_NO_LIFECYCLE_MIN_OBJECTS threshold, THEN THE Rule SHALL return null.

---

### Requirement 14: RDS Oversized Instance Rule

**User Story:** As a cloud operator, I want to identify RDS instances with low CPU and low connection counts, so that I can downsize them to reduce database costs.

#### Acceptance Criteria

1. WHEN the RDS_OVERSIZED rule evaluates an RDS instance with avgCpuUtilization below RDS_CPU_LOW and avgConnections below RDS_CONNECTIONS_LOW, THE Rule SHALL return a Finding recommending downsizing.
2. WHEN the RDS_OVERSIZED rule finds a downsize target, THE Rule SHALL calculate estimatedMonthlySavings as the difference between current and downsized costs.
3. IF the RDS instance does not meet both low CPU and low connection thresholds, THEN THE Rule SHALL return null.
4. IF CPU or connection metrics are not available, THEN THE Rule SHALL return null without error.

---

### Requirement 15: Lambda Unused Functions Rule

**User Story:** As a cloud operator, I want to identify Lambda functions that have not been invoked recently, so that I can clean up unused functions and reduce code maintenance burden.

#### Acceptance Criteria

1. WHEN the LAMBDA_UNUSED rule evaluates a Lambda function with zero invocations in the last LAMBDA_UNUSED_DAYS, THE Rule SHALL return a Finding recommending deletion or review.
2. IF the function has been invoked within LAMBDA_UNUSED_DAYS, THEN THE Rule SHALL return null.
3. IF invocation metrics are not available, THEN THE Rule SHALL return null without error.

---

### Requirement 16: CloudWatch Long Retention Rule

**User Story:** As a cloud operator, I want to identify CloudWatch Log Groups with retention periods exceeding the recommended maximum, so that I can reduce log storage costs.

#### Acceptance Criteria

1. WHEN the CW_LONG_RETENTION rule evaluates a CloudWatch Log Group with retentionDays exceeding CLOUDWATCH_RETENTION_MAX threshold, THE Rule SHALL return a Finding recommending reduced retention.
2. IF the log group has retentionDays at or below CLOUDWATCH_RETENTION_MAX, THEN THE Rule SHALL return null.
3. IF the log group has no retention period set (indefinite), THE Rule SHALL return a Finding recommending a retention policy be configured.

---

### Requirement 17: Scanner Integration

**User Story:** As a developer, I want the Scanner Service to use the Rule Engine instead of AI/Gemini analysis, so that scan results are deterministic and do not require external API keys.

#### Acceptance Criteria

1. WHEN the Scanner_Service completes raw data collection, THE Scanner_Service SHALL normalize the raw data using the Normalizer and evaluate it using the Rule_Engine.
2. WHEN the Scanner_Service invokes the Rule_Engine, THE Scanner_Service SHALL emit a Socket.IO progress event with step 'Analyzing Resources...' before evaluation begins.
3. WHEN evaluation completes, THE Scanner_Service SHALL persist findings and summary to the Report model.
4. THE Scanner_Service SHALL not invoke the Gemini/AI service for cost-optimization analysis after the Rule_Engine is integrated.
5. WHEN the Scanner_Service emits the 'Completed' progress event, THE Scanner_Service SHALL include findings and summary from the Rule_Engine result.

---

### Requirement 18: Logging

**User Story:** As a developer, I want structured logging throughout the Rule Engine lifecycle, so that I can troubleshoot rule loading, execution, and failure issues in production.

#### Acceptance Criteria

1. WHEN the Rule_Engine loads a rule successfully, THE Rule_Engine SHALL log an info-level message containing the rule id.
2. IF a rule fails during evaluation, THEN THE Rule_Engine SHALL log an error-level message containing the rule id, resource id, error message, and stack trace.
3. IF a rule file fails to load, THEN THE Rule_Engine SHALL log an error-level message containing the filename and reason.
4. WHEN rule loading completes, THE Rule_Engine SHALL log an info-level message containing the total count of loaded rules.
5. THE Rule_Engine SHALL use the existing winston logger instance for all log output.

---

### Requirement 19: Module Constraints

**User Story:** As a developer, I want the Rule Engine to follow project conventions and constraints, so that it integrates seamlessly with the existing codebase.

#### Acceptance Criteria

1. THE Rule_Engine module SHALL use CommonJS module syntax (require/module.exports) exclusively.
2. THE Rule_Engine module SHALL introduce zero new npm dependencies.
3. THE Rule_Engine module SHALL not make any network requests, database queries, or filesystem writes during rule evaluation.
4. THE Rule_Engine module SHALL not modify existing authentication, STS, Socket.IO, or MongoDB schema modules.
5. THE Rule_Engine module SHALL ensure every rule is independently unit-testable by accepting a NormalizedResource as input and returning a Finding or null.

---

### Requirement 20: Rule Independence and Testability

**User Story:** As a developer, I want each rule to be a pure function of its input with no shared state, so that rules can be unit-tested in isolation without setup dependencies.

#### Acceptance Criteria

1. THE Rule SHALL accept a single NormalizedResource argument and return either a Finding or null.
2. THE Rule SHALL not access or modify any shared mutable state between evaluations.
3. THE Rule SHALL not call external services, databases, or the filesystem during evaluation.
4. THE Rule SHALL not depend on the output of any other rule.
5. WHEN a rule needs pricing data, THE Rule SHALL use the Pricing_Utility functions which are pure static lookups.
