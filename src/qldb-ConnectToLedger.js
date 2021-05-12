import { QldbDriver, RetryConfig } from 'amazon-qldb-driver-nodejs';
import qldbsession from 'aws-sdk/clients/qldbsession.js';
const { ClientConfiguration } = qldbsession;

import { LEDGER_NAME } from './qldb-Constants.js';

const qldbDriver = createQldbDriver();

/**
 * Create a driver for creating sessions.
 * @param ledgerName The name of the ledger to create the driver on.
 * @param serviceConfigurationOptions The configurations for the AWS SDK client that the driver uses.
 * @returns The driver for creating sessions.
 */
export function createQldbDriver(
  ledgerName = LEDGER_NAME,
  serviceConfigurationOptions = { region: 'eu-central-1' }
) {
  const retryLimit = 4;
  const maxConcurrentTransactions = 10;
  //Use driver's default backoff function (and hence, no second parameter provided to RetryConfig)
  const retryConfig = new RetryConfig(retryLimit);
  const qldbDriver = new QldbDriver(
    ledgerName,
    serviceConfigurationOptions,
    10,
    retryConfig
  );
  return qldbDriver;
}

export function getQldbDriver() {
  return qldbDriver;
}

/**
 * Connect to a session for a given ledger using default settings.
 * @returns Promise which fulfills with void.
 */
// var main = async function () {
//   try {
//     console.log('Listing table names...');
//     const tableNames = await qldbDriver.getTableNames();
//     tableNames.forEach((tableName) => {
//       console.log(tableName);
//     });
//   } catch (e) {
//     error(`Unable to create session: ${e}`);
//   }
// };
//
// main();
