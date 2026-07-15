const { AssumeRoleCommand } = require('@aws-sdk/client-sts');
const { stsClient } = require('../../config/aws');
const logger = require('../../utils/logger');

/**
 * Custom error class for authentication failures.
 */
class AuthenticationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
  }
}

/**
 * Pattern for validating IAM Role ARNs.
 */
const ROLE_ARN_PATTERN = /^arn:aws:iam::\d{12}:role\/.+$/;

/**
 * Assumes an IAM role via STS and returns temporary credentials.
 *
 * @typedef {Object} AssumeRoleOptions
 * @property {string} roleArn - The ARN of the IAM role to assume
 * @property {string} [sessionName] - Optional session name (defaults to CloudGuardianScan-<timestamp>)
 * @property {number} [durationSeconds] - Session duration (defaults to AWS_STS_SESSION_DURATION env or 3600)
 * @property {string} [externalId] - Optional external ID for cross-account trust policies
 *
 * @typedef {Object} TemporaryCredentials
 * @property {string} accessKeyId
 * @property {string} secretAccessKey
 * @property {string} sessionToken
 * @property {Date} expiration
 *
 * @param {AssumeRoleOptions} options
 * @returns {Promise<TemporaryCredentials>}
 * @throws {AuthenticationError}
 */
async function assumeRole(options) {
  const { roleArn, sessionName, durationSeconds, externalId } = options;

  // Step 1: Validate Role ARN format
  if (!roleArn || !ROLE_ARN_PATTERN.test(roleArn)) {
    const errorMessage = `Invalid Role ARN format: "${roleArn}". Expected pattern: arn:aws:iam::<12-digit-account-id>:role/<role-name>`;
    logger.error('Role ARN validation failed', { roleArn, error: errorMessage });
    throw new AuthenticationError(errorMessage, 'INVALID_ARN');
  }

  // Step 2: Build AssumeRole command params
  const sessionDuration = durationSeconds ||
    parseInt(process.env.AWS_STS_SESSION_DURATION, 10) || 3600;
  const resolvedSessionName = sessionName || `CloudGuardianScan-${Date.now()}`;

  const params = {
    RoleArn: roleArn,
    RoleSessionName: resolvedSessionName,
    DurationSeconds: sessionDuration,
  };

  if (externalId) {
    params.ExternalId = externalId;
  }

  // Step 3: Call STS AssumeRole
  logger.info('Assuming IAM role', { roleArn, sessionName: resolvedSessionName });

  try {
    const command = new AssumeRoleCommand(params);
    const response = await stsClient.send(command);

    // Step 4: Normalize credentials
    const credentials = {
      accessKeyId: response.Credentials.AccessKeyId,
      secretAccessKey: response.Credentials.SecretAccessKey,
      sessionToken: response.Credentials.SessionToken,
      expiration: new Date(response.Credentials.Expiration),
    };

    // Log success — truncate accessKeyId, never log secrets
    logger.info('Role assumed successfully', {
      roleArn,
      accessKeyId: credentials.accessKeyId.substring(0, 8),
      expiration: credentials.expiration.toISOString(),
    });

    return credentials;
  } catch (error) {
    // Log failure with error details
    logger.error('AssumeRole failed', {
      roleArn,
      errorCode: error.name || error.Code,
      errorMessage: error.message,
    });

    // Provide specific messages for known error types
    if (error.name === 'AccessDenied' || error.Code === 'AccessDenied') {
      throw new AuthenticationError(
        `Access denied when assuming role "${roleArn}". Verify that the IAM trust policy allows this principal to assume the role.`,
        'ACCESS_DENIED'
      );
    }

    throw new AuthenticationError(
      `Failed to assume role "${roleArn}": ${error.message}`,
      error.name || error.Code || 'STS_ERROR'
    );
  }
}

/**
 * Checks if credentials are expired or within the expiry buffer.
 *
 * @param {TemporaryCredentials} credentials - Credentials to check
 * @param {number} [bufferMs] - Buffer in milliseconds before expiry (defaults to AWS_CREDENTIAL_EXPIRY_BUFFER_MS env or 300000)
 * @returns {boolean} true if credentials are expired or within the buffer window
 */
function isExpired(credentials, bufferMs) {
  const buffer = bufferMs !== undefined
    ? bufferMs
    : (parseInt(process.env.AWS_CREDENTIAL_EXPIRY_BUFFER_MS, 10) || 300000);

  const expirationTime = credentials.expiration instanceof Date
    ? credentials.expiration.getTime()
    : new Date(credentials.expiration).getTime();

  return expirationTime <= Date.now() + buffer;
}

module.exports = {
  assumeRole,
  isExpired,
  AuthenticationError,
};
