const { getRegions, getEC2Instances } = require('../services/aws/ec2.service');
const { getS3Buckets } = require('../services/aws/s3.service');
const { getRDSInstances } = require('../services/aws/rds.service');
const { getLambdaFunctions } = require('../services/aws/lambda.service');
const { testConnection } = require('../services/aws/connection.service');
const { createAwsClients } = require('../services/aws/clientFactory');
const logger = require('../utils/logger');

/**
 * Creates AWS clients using the default credential chain (env vars / instance profile).
 * Used by the individual resource API endpoints for backward compatibility.
 */
function getDefaultClients() {
  return createAwsClients(null);
}

// @desc    Test AWS connection
// @route   GET /api/aws/connection
// @access  Private
exports.getConnection = async (req, res, next) => {
  try {
    const clients = getDefaultClients();
    const region = process.env.AWS_REGION || 'us-east-1';
    const result = await testConnection(clients.stsClient, region);
    res.status(200).json({
      success: true,
      message: result.connected ? 'AWS connected successfully' : 'AWS connection failed',
      data: result,
    });
  } catch (error) {
    logger.error(`[AWS Controller] getConnection error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all available AWS regions
// @route   GET /api/aws/regions
// @access  Private
exports.getRegions = async (req, res, next) => {
  try {
    const clients = getDefaultClients();
    const regions = await getRegions(clients.ec2Client);
    res.status(200).json({
      success: true,
      message: `Fetched ${regions.length} regions successfully`,
      data: { count: regions.length, regions },
    });
  } catch (error) {
    logger.error(`[AWS Controller] getRegions error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all EC2 instances
// @route   GET /api/aws/ec2
// @access  Private
exports.getEC2 = async (req, res, next) => {
  try {
    const clients = getDefaultClients();
    const instances = await getEC2Instances(clients.ec2Client);
    res.status(200).json({
      success: true,
      message: `Fetched ${instances.length} EC2 instances successfully`,
      data: { count: instances.length, instances },
    });
  } catch (error) {
    logger.error(`[AWS Controller] getEC2 error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all S3 buckets
// @route   GET /api/aws/s3
// @access  Private
exports.getS3 = async (req, res, next) => {
  try {
    const clients = getDefaultClients();
    const data = await getS3Buckets(clients.s3Client);
    res.status(200).json({
      success: true,
      message: `Fetched ${data.bucketCount} S3 buckets successfully`,
      data,
    });
  } catch (error) {
    logger.error(`[AWS Controller] getS3 error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all RDS instances
// @route   GET /api/aws/rds
// @access  Private
exports.getRDS = async (req, res, next) => {
  try {
    const clients = getDefaultClients();
    const data = await getRDSInstances(clients.rdsClient);
    res.status(200).json({
      success: true,
      message: `Fetched ${data.instanceCount} RDS instances successfully`,
      data,
    });
  } catch (error) {
    logger.error(`[AWS Controller] getRDS error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all Lambda functions
// @route   GET /api/aws/lambda
// @access  Private
exports.getLambda = async (req, res, next) => {
  try {
    const clients = getDefaultClients();
    const data = await getLambdaFunctions(clients.lambdaClient);
    res.status(200).json({
      success: true,
      message: `Fetched ${data.functionCount} Lambda functions successfully`,
      data,
    });
  } catch (error) {
    logger.error(`[AWS Controller] getLambda error: ${error.message}`);
    next(error);
  }
};
