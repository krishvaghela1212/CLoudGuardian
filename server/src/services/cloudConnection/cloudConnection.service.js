'use strict';

const CloudConnection = require('../../models/CloudConnection');
const { assumeRole } = require('../aws/stsAuth.service');
const { createClient } = require('../aws/clientFactory');
const { GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const logger = require('../../utils/logger');

/**
 * @typedef {Object} ConnectionPayload
 * @property {string} name
 * @property {string} accountId
 * @property {string} roleArn
 * @property {string} region
 * @property {string} [description]
 * @property {string} [provider]
 */

/**
 * Creates a new cloud connection for a user.
 * @param {string} userId
 * @param {ConnectionPayload} payload
 * @returns {Promise<CloudConnection>}
 */
async function createConnection(userId, payload) {
  const { name, accountId, roleArn, region, description, provider } = payload;

  // Check for duplicate name per user (belt-and-suspenders on top of DB index)
  const existing = await CloudConnection.findOne({ userId, name: name?.trim() });
  if (existing) {
    const err = new Error(`A connection named "${name}" already exists for this account.`);
    err.statusCode = 409;
    throw err;
  }

  const connection = await CloudConnection.create({
    userId,
    provider: provider || 'AWS',
    name: name?.trim(),
    accountId: accountId?.trim(),
    roleArn: roleArn?.trim(),
    region: region?.trim(),
    description: description?.trim() || '',
    status: 'PENDING',
  });

  logger.info(`[CloudConnection] Created connection "${connection.name}" for user ${userId}`);
  return connection;
}

/**
 * Returns all cloud connections belonging to a user (roleArn excluded by default).
 * @param {string} userId
 * @returns {Promise<CloudConnection[]>}
 */
async function listConnections(userId) {
  return CloudConnection.find({ userId }).select('-roleArn').sort({ createdAt: -1 });
}

/**
 * Returns a single connection by ID scoped to the user.
 * @param {string} userId
 * @param {string} connectionId
 * @param {boolean} [includeRoleArn=false]
 * @returns {Promise<CloudConnection>}
 */
async function getConnectionById(userId, connectionId, includeRoleArn = false) {
  const query = CloudConnection.findOne({ _id: connectionId, userId });
  if (!includeRoleArn) query.select('-roleArn');
  const connection = await query;
  if (!connection) {
    const err = new Error('Cloud connection not found.');
    err.statusCode = 404;
    throw err;
  }
  return connection;
}

/**
 * Updates a cloud connection. Prevents renaming to a name that already exists.
 * @param {string} userId
 * @param {string} connectionId
 * @param {Partial<ConnectionPayload>} updates
 * @returns {Promise<CloudConnection>}
 */
async function updateConnection(userId, connectionId, updates) {
  const connection = await CloudConnection.findOne({ _id: connectionId, userId });
  if (!connection) {
    const err = new Error('Cloud connection not found.');
    err.statusCode = 404;
    throw err;
  }

  // If renaming, check uniqueness
  if (updates.name && updates.name.trim() !== connection.name) {
    const duplicate = await CloudConnection.findOne({ userId, name: updates.name.trim() });
    if (duplicate) {
      const err = new Error(`A connection named "${updates.name}" already exists for this account.`);
      err.statusCode = 409;
      throw err;
    }
  }

  const allowedFields = ['name', 'accountId', 'roleArn', 'region', 'description'];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      connection[field] = typeof updates[field] === 'string'
        ? updates[field].trim()
        : updates[field];
    }
  });

  // Reset status to PENDING when credentials change
  if (updates.roleArn || updates.accountId) {
    connection.status = 'PENDING';
  }

  await connection.save();
  logger.info(`[CloudConnection] Updated connection "${connection.name}" for user ${userId}`);

  // Return without roleArn
  const result = connection.toObject();
  delete result.roleArn;
  return result;
}

/**
 * Deletes a cloud connection owned by the user.
 * @param {string} userId
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
async function deleteConnection(userId, connectionId) {
  const result = await CloudConnection.findOneAndDelete({ _id: connectionId, userId });
  if (!result) {
    const err = new Error('Cloud connection not found.');
    err.statusCode = 404;
    throw err;
  }
  logger.info(`[CloudConnection] Deleted connection "${result.name}" for user ${userId}`);
}

/**
 * Tests a cloud connection by assuming the IAM role and calling STS GetCallerIdentity.
 * Updates status to CONNECTED or FAILED in the database.
 *
 * @param {string} userId
 * @param {string} connectionId
 * @returns {Promise<{success: boolean, accountId?: string, arn?: string, userId?: string, error?: string}>}
 */
async function testConnection(userId, connectionId) {
  // Load connection including roleArn for this internal operation
  const connection = await CloudConnection.findOne({ _id: connectionId, userId });
  if (!connection) {
    const err = new Error('Cloud connection not found.');
    err.statusCode = 404;
    throw err;
  }

  logger.info(`[CloudConnection] Testing connection "${connection.name}" (${connection.roleArn})`);

  try {
    // Step 1: Assume the IAM Role
    const credentials = await assumeRole({
      roleArn: connection.roleArn,
      sessionName: `CloudGuardianTest-${Date.now()}`,
      durationSeconds: 900, // 15 minutes is enough for a test
    });

    // Step 2: Create an STS client with the temporary credentials
    const stsClient = createClient('sts', credentials, connection.region);

    // Step 3: Call GetCallerIdentity to verify the assumed role
    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);

    // Step 4: Update status to CONNECTED
    connection.status = 'CONNECTED';
    await connection.save();

    logger.info(`[CloudConnection] Test PASSED for "${connection.name}": AccountId=${response.Account}`);

    return {
      success: true,
      accountId: response.Account,
      arn: response.Arn,
      userId: response.UserId,
    };
  } catch (error) {
    // Update status to FAILED
    connection.status = 'FAILED';
    await connection.save();

    logger.error(`[CloudConnection] Test FAILED for "${connection.name}": ${error.message}`);

    return {
      success: false,
      error: error.message || 'Failed to assume IAM role. Verify trust policy and ARN.',
    };
  }
}

/**
 * Loads a connection with its roleArn for use by the scanner.
 * Validates ownership before returning.
 * @param {string} userId
 * @param {string} connectionId
 * @returns {Promise<{roleArn: string, region: string, name: string, _id: ObjectId}>}
 */
async function getConnectionForScan(userId, connectionId) {
  const connection = await CloudConnection.findOne({ _id: connectionId, userId }).select(
    '+roleArn name region status accountId'
  );
  if (!connection) {
    const err = new Error(`Cloud connection not found or access denied.`);
    err.statusCode = 404;
    throw err;
  }
  return connection;
}

/**
 * Updates the lastScanAt timestamp for a connection after a successful scan.
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
async function markScanned(connectionId) {
  await CloudConnection.findByIdAndUpdate(connectionId, { lastScanAt: new Date() });
}

module.exports = {
  createConnection,
  listConnections,
  getConnectionById,
  updateConnection,
  deleteConnection,
  testConnection,
  getConnectionForScan,
  markScanned,
};
