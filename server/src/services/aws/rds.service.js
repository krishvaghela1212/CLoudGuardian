const { DescribeDBInstancesCommand } = require('@aws-sdk/client-rds');
const logger = require('../../utils/logger');

/**
 * Fetches all RDS database instances.
 * @param {import('@aws-sdk/client-rds').RDSClient} rdsClient - The RDS client instance to use
 */
const getRDSInstances = async (rdsClient) => {
  try {
    const command = new DescribeDBInstancesCommand({});
    const response = await rdsClient.send(command);

    const instances = response.DBInstances.map((db) => ({
      dbInstanceId: db.DBInstanceIdentifier,
      dbInstanceClass: db.DBInstanceClass,
      engine: db.Engine,
      engineVersion: db.EngineVersion,
      status: db.DBInstanceStatus,
      endpoint: db.Endpoint
        ? { address: db.Endpoint.Address, port: db.Endpoint.Port }
        : null,
      multiAZ: db.MultiAZ,
      storageType: db.StorageType,
      allocatedStorage: db.AllocatedStorage,
      dbName: db.DBName || null,
      availabilityZone: db.AvailabilityZone,
      instanceCreateTime: db.InstanceCreateTime,
      publiclyAccessible: db.PubliclyAccessible,
    }));

    return {
      instanceCount: instances.length,
      instances,
    };
  } catch (error) {
    logger.error(`[RDS Service] getRDSInstances failed: ${error.message}`);
    throw error;
  }
};

module.exports = { getRDSInstances };
