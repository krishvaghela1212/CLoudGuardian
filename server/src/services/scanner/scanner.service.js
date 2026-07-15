const { assumeRole } = require('../aws/stsAuth.service');
const { createAwsClients } = require('../aws/clientFactory');
const { getEC2Instances } = require('../aws/ec2.service');
const { getS3Buckets } = require('../aws/s3.service');
const { getRDSInstances } = require('../aws/rds.service');
const { getLambdaFunctions } = require('../aws/lambda.service');
const RuleEngine = require('../../modules/finops/engine/RuleEngine');
const { normalize } = require('../../modules/finops/services/normalizer');
const Report = require('../../models/Report');
const logger = require('../../utils/logger');

// Helper to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Determines whether an error is a credential expiry error.
 * @param {Error} error
 * @returns {boolean}
 */
function isCredentialExpiredError(error) {
  return (
    error.name === 'ExpiredTokenException' ||
    error.name === 'ExpiredToken' ||
    error.Code === 'ExpiredToken' ||
    (error.message && error.message.toLowerCase().includes('expired'))
  );
}

class ScannerService {
  constructor(socket) {
    this.socket = socket;
    this.isScanning = false;
    this.clients = null;
  }

  emitProgress(step, status = 'in_progress', data = null) {
    this.socket.emit('scan_progress', { step, status, data });
  }

  /**
   * Obtains AWS clients by assuming a role or falling back to default credentials.
   * @param {string} [roleArn] - Optional Role ARN to assume
   * @returns {Promise<import('../aws/clientFactory').AwsClients>}
   */
  async getAwsClients(roleArn) {
    if (roleArn) {
      // Assume the specified role and create clients with temporary credentials
      const credentials = await assumeRole({ roleArn });
      return createAwsClients(credentials);
    }

    // No roleArn provided and no env var — use default credential chain
    // The SDK will use AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY or instance profile
    return createAwsClients(null);
  }

  /**
   * Wraps an AWS operation with credential expiry detection and single retry.
   * If the operation throws an ExpiredTokenException (or similar), re-assumes the role,
   * recreates clients, and retries the operation exactly once.
   *
   * @param {Function} operation - Async function that uses AWS clients (receives current clients)
   * @param {string} [roleArn] - Role ARN for re-assumption on expiry
   * @returns {Promise<any>} Result of the operation
   */
  async withCredentialRetry(operation, roleArn) {
    try {
      return await operation(this.clients);
    } catch (error) {
      if (isCredentialExpiredError(error) && roleArn) {
        logger.warn('Credentials expired, re-assuming role', {
          roleArn,
          attempt: 1,
        });

        // Re-acquire credentials and recreate clients
        const freshCreds = await assumeRole({ roleArn });
        this.clients = createAwsClients(freshCreds);

        // Retry the operation once with fresh clients
        return await operation(this.clients);
      }

      // Non-credential error or no roleArn to retry with — propagate immediately
      throw error;
    }
  }

  /**
   * Runs a full infrastructure scan.
   * @param {string} userId - The authenticated user ID
   * @param {string} [roleArn] - Optional Role ARN override (defaults to AWS_ROLE_ARN env var)
   */
  async runScan(userId, roleArn) {
    if (this.isScanning) return;
    this.isScanning = true;

    // Resolve the effective Role ARN: parameter > env var > undefined (fallback to default creds)
    const effectiveRoleArn = roleArn || process.env.AWS_ROLE_ARN || undefined;

    try {
      // 1. Connecting...
      this.emitProgress('Connecting...');
      await delay(500);

      // Acquire AWS clients (assumes role if roleArn is available, else uses default chain)
      this.clients = await this.getAwsClients(effectiveRoleArn);

      const rawAwsData = { ec2: [], s3: {}, rds: {}, lambda: {} };

      // 2. Scanning EC2...
      this.emitProgress('Scanning EC2...');
      try {
        rawAwsData.ec2 = await this.withCredentialRetry(
          (clients) => getEC2Instances(clients.ec2Client),
          effectiveRoleArn
        );
      } catch (err) {
        logger.error(`Scan EC2 failed: ${err.message}`);
        if (isCredentialExpiredError(err)) {
          this.socket.emit('scan_error', {
            message: 'AWS credentials expired during EC2 scan. Please verify your role configuration.',
          });
        }
      }

      // 3. Scanning S3...
      this.emitProgress('Scanning S3...');
      try {
        rawAwsData.s3 = await this.withCredentialRetry(
          (clients) => getS3Buckets(clients.s3Client),
          effectiveRoleArn
        );
      } catch (err) {
        logger.error(`Scan S3 failed: ${err.message}`);
        if (isCredentialExpiredError(err)) {
          this.socket.emit('scan_error', {
            message: 'AWS credentials expired during S3 scan. Please verify your role configuration.',
          });
        }
      }

      // 4. Scanning RDS...
      this.emitProgress('Scanning RDS...');
      try {
        rawAwsData.rds = await this.withCredentialRetry(
          (clients) => getRDSInstances(clients.rdsClient),
          effectiveRoleArn
        );
      } catch (err) {
        logger.error(`Scan RDS failed: ${err.message}`);
        if (isCredentialExpiredError(err)) {
          this.socket.emit('scan_error', {
            message: 'AWS credentials expired during RDS scan. Please verify your role configuration.',
          });
        }
      }

      // 5. Scanning Lambda...
      this.emitProgress('Scanning Lambda...');
      try {
        rawAwsData.lambda = await this.withCredentialRetry(
          (clients) => getLambdaFunctions(clients.lambdaClient),
          effectiveRoleArn
        );
      } catch (err) {
        logger.error(`Scan Lambda failed: ${err.message}`);
        if (isCredentialExpiredError(err)) {
          this.socket.emit('scan_error', {
            message: 'AWS credentials expired during Lambda scan. Please verify your role configuration.',
          });
        }
      }

      // 6. Analyzing Resources...
      this.emitProgress('Analyzing Resources...');
      let ruleEngineResult = null;
      try {
        const normalizedResources = normalize(rawAwsData, process.env.AWS_REGION || 'us-east-1');
        const engine = new RuleEngine();
        engine.loadRules();
        ruleEngineResult = engine.evaluate(normalizedResources);
      } catch (err) {
        logger.error(`Rule Engine analysis failed: ${err.message}`);
        throw new Error('Rule Engine analysis failed.');
      }

      // 7. Saving Report...
      this.emitProgress('Saving Report...');
      let savedReport = null;
      if (userId) {
        try {
          savedReport = await Report.create({
            user: userId,
            rawAwsData,
            aiAnalysis: ruleEngineResult,
          });
        } catch (err) {
          logger.error(`Failed to save report: ${err.message}`);
        }
      }

      // 8. Completed.
      this.emitProgress('Completed.', 'completed', {
        reportId: savedReport ? savedReport._id : null,
        ec2Count: rawAwsData.ec2?.length || 0,
        s3Count: rawAwsData.s3?.bucketCount || 0,
        rdsCount: rawAwsData.rds?.instanceCount || 0,
        lambdaCount: rawAwsData.lambda?.functionCount || 0,
        findings: ruleEngineResult.findings,
        summary: ruleEngineResult.summary,
      });
    } catch (error) {
      logger.error(`ScannerService error: ${error.message}`);
      this.socket.emit('scan_error', { message: 'An error occurred during the scan.' });
    } finally {
      this.isScanning = false;
      this.clients = null;
    }
  }
}

module.exports = ScannerService;
