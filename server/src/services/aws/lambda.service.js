const { ListFunctionsCommand, GetFunctionConcurrencyCommand } = require('@aws-sdk/client-lambda');
const logger = require('../../utils/logger');

/**
 * Fetches all Lambda functions with their configuration details.
 * @param {import('@aws-sdk/client-lambda').LambdaClient} lambdaClient - The Lambda client to use for API calls
 */
const getLambdaFunctions = async (lambdaClient) => {
  try {
    const functions = [];
    let marker;

    // Handle pagination
    do {
      const command = new ListFunctionsCommand({ Marker: marker });
      const response = await lambdaClient.send(command);

      response.Functions.forEach((fn) => {
        functions.push({
          functionName: fn.FunctionName,
          functionArn: fn.FunctionArn,
          runtime: fn.Runtime,
          handler: fn.Handler,
          codeSize: fn.CodeSize,
          description: fn.Description || '',
          timeout: fn.Timeout,
          memorySize: fn.MemorySize,
          lastModified: fn.LastModified,
          state: fn.State || 'Active',
          environment: fn.Environment?.Variables
            ? Object.keys(fn.Environment.Variables) // Return only keys, not values (security)
            : [],
        });
      });

      marker = response.NextMarker;
    } while (marker);

    return {
      functionCount: functions.length,
      functions,
    };
  } catch (error) {
    logger.error(`[Lambda Service] getLambdaFunctions failed: ${error.message}`);
    throw error;
  }
};

module.exports = { getLambdaFunctions };
