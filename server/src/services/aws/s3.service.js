const { ListBucketsCommand, GetBucketLocationCommand, GetBucketAclCommand } = require('@aws-sdk/client-s3');
const logger = require('../../utils/logger');

/**
 * Fetches all S3 buckets with location info.
 * @param {import('@aws-sdk/client-s3').S3Client} s3Client - The S3 client instance to use for API calls
 */
const getS3Buckets = async (s3Client) => {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    const buckets = await Promise.all(
      response.Buckets.map(async (bucket) => {
        let region = 'us-east-1';
        try {
          const locationCmd = new GetBucketLocationCommand({ Bucket: bucket.Name });
          const locationRes = await s3Client.send(locationCmd);
          region = locationRes.LocationConstraint || 'us-east-1';
        } catch (err) {
          logger.warn(`[S3 Service] Could not get location for bucket ${bucket.Name}: ${err.message}`);
        }

        return {
          name: bucket.Name,
          creationDate: bucket.CreationDate,
          region,
        };
      })
    );

    return {
      owner: {
        displayName: response.Owner?.DisplayName,
        id: response.Owner?.ID,
      },
      bucketCount: buckets.length,
      buckets,
    };
  } catch (error) {
    logger.error(`[S3 Service] getS3Buckets failed: ${error.message}`);
    throw error;
  }
};

module.exports = { getS3Buckets };
