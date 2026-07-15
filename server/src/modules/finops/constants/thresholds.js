'use strict';

const THRESHOLDS = {
  EC2_CPU_LOW: 10,                    // Percentage
  EC2_STOPPED_DAYS: 7,                // Days stopped before flagging
  EIP_UNATTACHED_HOURS: 1,            // Hours before flagging
  RDS_CPU_LOW: 15,                    // Percentage
  RDS_CONNECTIONS_LOW: 5,             // Average connections
  LAMBDA_UNUSED_DAYS: 30,             // Days since last invocation
  CLOUDWATCH_RETENTION_MAX: 90,       // Days - flag if above
  S3_NO_LIFECYCLE_MIN_OBJECTS: 1000,  // Min objects to flag
};

module.exports = { THRESHOLDS };
