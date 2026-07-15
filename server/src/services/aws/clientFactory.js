'use strict';

const { EC2Client } = require('@aws-sdk/client-ec2');
const { S3Client } = require('@aws-sdk/client-s3');
const { RDSClient } = require('@aws-sdk/client-rds');
const { LambdaClient } = require('@aws-sdk/client-lambda');
const { CloudWatchClient } = require('@aws-sdk/client-cloudwatch');
const { CostExplorerClient } = require('@aws-sdk/client-cost-explorer');
const { STSClient } = require('@aws-sdk/client-sts');

/**
 * @typedef {Object} TemporaryCredentials
 * @property {string} accessKeyId
 * @property {string} secretAccessKey
 * @property {string} sessionToken
 * @property {Date} expiration
 */

/**
 * @typedef {Object} AwsClients
 * @property {import('@aws-sdk/client-ec2').EC2Client} ec2Client
 * @property {import('@aws-sdk/client-s3').S3Client} s3Client
 * @property {import('@aws-sdk/client-rds').RDSClient} rdsClient
 * @property {import('@aws-sdk/client-lambda').LambdaClient} lambdaClient
 * @property {import('@aws-sdk/client-cloudwatch').CloudWatchClient} cloudWatchClient
 * @property {import('@aws-sdk/client-cost-explorer').CostExplorerClient} costExplorerClient
 * @property {import('@aws-sdk/client-sts').STSClient} stsClient
 */

/** Map of client type identifiers to their constructor classes */
const CLIENT_MAP = {
  ec2: EC2Client,
  s3: S3Client,
  rds: RDSClient,
  lambda: LambdaClient,
  cloudwatch: CloudWatchClient,
  costexplorer: CostExplorerClient,
  sts: STSClient,
};

/**
 * Resolves the effective AWS region using the fallback chain:
 * parameter → AWS_REGION env var → 'us-east-1'
 * @param {string} [region]
 * @returns {string}
 */
function resolveRegion(region) {
  return region || process.env.AWS_REGION || 'us-east-1';
}

/**
 * Builds the base client configuration object.
 * @param {TemporaryCredentials|null} credentials - Temp creds or null for env fallback
 * @param {string} region - Resolved AWS region
 * @returns {Object} AWS SDK v3 client configuration
 */
function buildBaseConfig(credentials, region) {
  const config = { region };

  if (credentials !== null && credentials !== undefined) {
    config.credentials = {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    };
  }

  return config;
}

/**
 * Creates a single AWS client of the specified type.
 * @param {string} clientType - One of 'ec2', 's3', 'rds', 'lambda', 'cloudwatch', 'costexplorer', 'sts'
 * @param {TemporaryCredentials|null} credentials - Temp creds or null for env fallback
 * @param {string} [region] - AWS region (defaults to AWS_REGION env var, then 'us-east-1')
 * @returns {Object} The AWS SDK client instance
 */
function createClient(clientType, credentials, region) {
  const normalizedType = clientType.toLowerCase();
  const ClientClass = CLIENT_MAP[normalizedType];

  if (!ClientClass) {
    throw new Error(
      `Unknown client type: "${clientType}". Valid types: ${Object.keys(CLIENT_MAP).join(', ')}`
    );
  }

  const effectiveRegion = normalizedType === 'costexplorer'
    ? 'us-east-1'
    : resolveRegion(region);

  const config = buildBaseConfig(credentials, effectiveRegion);

  return new ClientClass(config);
}

/**
 * Creates a full set of AWS SDK v3 clients with the given credentials.
 * Each invocation returns fresh, isolated client instances (no shared state).
 *
 * @param {TemporaryCredentials|null} credentials - Temp creds or null for env fallback
 * @param {string} [region] - AWS region (defaults to AWS_REGION env var, then 'us-east-1')
 * @returns {AwsClients}
 */
function createAwsClients(credentials, region) {
  const effectiveRegion = resolveRegion(region);
  const baseConfig = buildBaseConfig(credentials, effectiveRegion);

  return {
    ec2Client: new EC2Client(baseConfig),
    s3Client: new S3Client(baseConfig),
    rdsClient: new RDSClient(baseConfig),
    lambdaClient: new LambdaClient(baseConfig),
    cloudWatchClient: new CloudWatchClient(baseConfig),
    costExplorerClient: new CostExplorerClient({ ...baseConfig, region: 'us-east-1' }),
    stsClient: new STSClient(baseConfig),
  };
}

module.exports = {
  createAwsClients,
  createClient,
};
