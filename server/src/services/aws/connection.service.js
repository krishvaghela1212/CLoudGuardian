const { GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const logger = require('../../utils/logger');

/**
 * Validates the AWS connection and credentials by calling STS GetCallerIdentity.
 * @param {import('@aws-sdk/client-sts').STSClient} stsClient - The STS client to use
 * @param {string} region - The AWS region to include in the response
 */
const testConnection = async (stsClient, region) => {
  try {
    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);

    logger.info(`[AWS] Connection successful. AccountId: ${response.Account}`);

    return {
      connected: true,
      accountId: response.Account,
      arn: response.Arn,
      userId: response.UserId,
      region: region,
    };
  } catch (error) {
    logger.error(`[AWS] Connection test failed: ${error.message}`);
    return {
      connected: false,
      error: error.message,
    };
  }
};

module.exports = { testConnection };
