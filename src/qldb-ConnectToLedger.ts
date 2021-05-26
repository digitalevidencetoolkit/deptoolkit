/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { QldbDriver, RetryConfig } from 'amazon-qldb-driver-nodejs';
import { ClientConfiguration } from 'aws-sdk/clients/qldbsession';

import { LEDGER_NAME } from './qldb-Constants';

const qldbDriver: QldbDriver = createQldbDriver();

/**
 * Create a driver for creating sessions.
 * @param ledgerName The name of the ledger to create the driver on.
 * @param serviceConfigurationOptions The configurations for the AWS SDK client that the driver uses.
 * @returns The driver for creating sessions.
 */
export function createQldbDriver(
  ledgerName: string = LEDGER_NAME,
  serviceConfigurationOptions: ClientConfiguration = { region: 'eu-central-1' }
): QldbDriver {
  const retryLimit = 4;
  const maxConcurrentTransactions = 10;
  //Use driver's default backoff function (and hence, no second parameter provided to RetryConfig)
  const retryConfig: RetryConfig = new RetryConfig(retryLimit);
  const qldbDriver: QldbDriver = new QldbDriver(
    ledgerName,
    serviceConfigurationOptions,
    10,
    retryConfig
  );
  return qldbDriver;
}

export function getQldbDriver(): QldbDriver {
  return qldbDriver;
}

/**
 * Connect to a session for a given ledger using default settings.
 * @returns Promise which fulfills with void.
 */
var main = async function (): Promise<void> {
  try {
    console.log('Listing table names...');
    const tableNames: string[] = await qldbDriver.getTableNames();
    tableNames.forEach((tableName: string): void => {
      console.log(tableName);
    });
  } catch (e) {
    console.log(`Unable to create session: ${e}`);
  }
};

if (require.main === module) {
  main();
}
