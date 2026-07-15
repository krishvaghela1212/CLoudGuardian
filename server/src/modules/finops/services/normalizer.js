'use strict';

/**
 * Normalizer Service
 *
 * Transforms raw AWS SDK responses into a uniform NormalizedResource[] format.
 * Pure function — no side effects, no external calls, no input mutation.
 */

/**
 * Normalize EC2 instances.
 * @param {Array} instances - Raw EC2 instance array from scanner
 * @param {string} region - AWS region
 * @returns {Array} NormalizedResource[]
 */
function normalizeEC2(instances, region) {
  if (!instances || !Array.isArray(instances)) return [];

  return instances.map((instance) => ({
    resourceType: 'ec2_instance',
    service: 'EC2',
    region,
    resourceId: instance.instanceId,
    resourceName: instance.name || 'N/A',
    metadata: {
      instanceType: instance.instanceType,
      state: instance.state,
      platform: instance.platform,
      launchTime: instance.launchTime,
      amiId: instance.amiId,
      publicIp: instance.publicIp,
      privateIp: instance.privateIp,
    },
    metrics: {},
  }));
}

/**
 * Normalize S3 buckets.
 * @param {Object} s3Data - Raw S3 data from scanner { buckets: [...] }
 * @param {string} region - Default AWS region
 * @returns {Array} NormalizedResource[]
 */
function normalizeS3(s3Data, region) {
  if (!s3Data || !s3Data.buckets || !Array.isArray(s3Data.buckets)) return [];

  return s3Data.buckets.map((bucket) => ({
    resourceType: 's3_bucket',
    service: 'S3',
    region: bucket.region || region,
    resourceId: bucket.name,
    resourceName: bucket.name,
    metadata: {
      creationDate: bucket.creationDate,
      hasLifecyclePolicy: false,
    },
    metrics: {},
  }));
}

/**
 * Normalize RDS instances.
 * @param {Object} rdsData - Raw RDS data from scanner { instances: [...] }
 * @param {string} region - AWS region
 * @returns {Array} NormalizedResource[]
 */
function normalizeRDS(rdsData, region) {
  if (!rdsData || !rdsData.instances || !Array.isArray(rdsData.instances)) return [];

  return rdsData.instances.map((instance) => ({
    resourceType: 'rds_instance',
    service: 'RDS',
    region,
    resourceId: instance.dbInstanceId,
    resourceName: instance.dbInstanceId,
    metadata: {
      instanceClass: instance.dbInstanceClass,
      engine: instance.engine,
      engineVersion: instance.engineVersion,
      status: instance.status,
      multiAZ: instance.multiAZ,
      storageType: instance.storageType,
      allocatedStorage: instance.allocatedStorage,
    },
    metrics: {},
  }));
}

/**
 * Normalize Lambda functions.
 * @param {Object} lambdaData - Raw Lambda data from scanner { functions: [...] }
 * @param {string} region - AWS region
 * @returns {Array} NormalizedResource[]
 */
function normalizeLambda(lambdaData, region) {
  if (!lambdaData || !lambdaData.functions || !Array.isArray(lambdaData.functions)) return [];

  return lambdaData.functions.map((fn) => ({
    resourceType: 'lambda_function',
    service: 'Lambda',
    region,
    resourceId: fn.functionName,
    resourceName: fn.functionName,
    metadata: {
      runtime: fn.runtime,
      memorySize: fn.memorySize,
      timeout: fn.timeout,
      codeSize: fn.codeSize,
      lastModified: fn.lastModified,
      state: fn.state,
    },
    metrics: {
      invocationCount: 0,
    },
  }));
}

/**
 * Normalize raw AWS data into uniform NormalizedResource format.
 *
 * @param {Object} rawAwsData - Raw data from scanner { ec2, s3, rds, lambda }
 * @param {string} region - The AWS region the data was collected from
 * @returns {Array} NormalizedResource[]
 */
function normalize(rawAwsData, region) {
  if (!rawAwsData) return [];

  const resources = [];

  resources.push(...normalizeEC2(rawAwsData.ec2, region));
  resources.push(...normalizeS3(rawAwsData.s3, region));
  resources.push(...normalizeRDS(rawAwsData.rds, region));
  resources.push(...normalizeLambda(rawAwsData.lambda, region));

  return resources;
}

module.exports = { normalize };
