/**
 * @deprecated This module provides global AWS client singletons using static credentials.
 * For scan operations, use `server/src/services/aws/clientFactory.js` instead, which creates
 * isolated, short-lived client instances from temporary STS credentials.
 *
 * The `stsClient` export is still actively used by `stsAuth.service.js` for the initial
 * AssumeRole call. Other client singletons (ec2Client, s3Client, etc.) remain functional
 * for backward compatibility (e.g., aws.controller.js) but should NOT be used for scans.
 *
 * @see server/src/services/aws/clientFactory.js — replacement for per-scan client creation
 * @see server/src/services/aws/stsAuth.service.js — uses stsClient for role assumption
 */

const { EC2Client } = require('@aws-sdk/client-ec2');
const { S3Client } = require('@aws-sdk/client-s3');
const { RDSClient } = require('@aws-sdk/client-rds');
const { LambdaClient } = require('@aws-sdk/client-lambda');
const { CloudWatchClient } = require('@aws-sdk/client-cloudwatch');
const { CostExplorerClient } = require('@aws-sdk/client-cost-explorer');
const { STSClient } = require('@aws-sdk/client-sts');

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// ─── Deprecated Client Singletons ────────────────────────────────────────────
// These singletons use static credentials from environment variables.
// For scan operations, create per-scan clients via clientFactory.createAwsClients().

/** @deprecated Use clientFactory.createAwsClients() for scan operations */
const ec2Client = new EC2Client(awsConfig);

/** @deprecated Use clientFactory.createAwsClients() for scan operations */
const s3Client = new S3Client(awsConfig);

/** @deprecated Use clientFactory.createAwsClients() for scan operations */
const rdsClient = new RDSClient(awsConfig);

/** @deprecated Use clientFactory.createAwsClients() for scan operations */
const lambdaClient = new LambdaClient(awsConfig);

/** @deprecated Use clientFactory.createAwsClients() for scan operations */
const cloudWatchClient = new CloudWatchClient(awsConfig);

/** @deprecated Use clientFactory.createAwsClients() for scan operations */
const costExplorerClient = new CostExplorerClient({ ...awsConfig, region: 'us-east-1' });

// stsClient is NOT deprecated — it is used by stsAuth.service.js for the AssumeRole call
const stsClient = new STSClient(awsConfig);

module.exports = {
  ec2Client,
  s3Client,
  rdsClient,
  lambdaClient,
  cloudWatchClient,
  costExplorerClient,
  stsClient,
  awsConfig,
};
