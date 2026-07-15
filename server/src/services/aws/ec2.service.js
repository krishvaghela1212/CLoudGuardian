const { DescribeRegionsCommand } = require('@aws-sdk/client-ec2');
const { DescribeInstancesCommand, DescribeInstanceStatusCommand } = require('@aws-sdk/client-ec2');
const logger = require('../../utils/logger');

/**
 * Fetches all available AWS regions.
 * @param {import('@aws-sdk/client-ec2').EC2Client} ec2Client - The EC2 client to use for API calls
 */
const getRegions = async (ec2Client) => {
  try {
    const command = new DescribeRegionsCommand({ AllRegions: false });
    const response = await ec2Client.send(command);

    return response.Regions.map((region) => ({
      regionName: region.RegionName,
      endpoint: region.Endpoint,
      optInStatus: region.OptInStatus,
    }));
  } catch (error) {
    logger.error(`[EC2 Service] getRegions failed: ${error.message}`);
    throw error;
  }
};

/**
 * Fetches all EC2 instances with their details.
 * @param {import('@aws-sdk/client-ec2').EC2Client} ec2Client - The EC2 client to use for API calls
 */
const getEC2Instances = async (ec2Client) => {
  try {
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);

    const instances = [];

    response.Reservations.forEach((reservation) => {
      reservation.Instances.forEach((instance) => {
        const nameTag = instance.Tags?.find((t) => t.Key === 'Name');
        instances.push({
          instanceId: instance.InstanceId,
          instanceType: instance.InstanceType,
          state: instance.State?.Name,
          publicIp: instance.PublicIpAddress || null,
          privateIp: instance.PrivateIpAddress || null,
          name: nameTag?.Value || 'N/A',
          launchTime: instance.LaunchTime,
          availabilityZone: instance.Placement?.AvailabilityZone,
          platform: instance.Platform || 'linux',
          amiId: instance.ImageId,
        });
      });
    });

    return instances;
  } catch (error) {
    logger.error(`[EC2 Service] getEC2Instances failed: ${error.message}`);
    throw error;
  }
};

module.exports = { getRegions, getEC2Instances };
