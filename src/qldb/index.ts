import {
  QldbDriver,
  Result,
  TransactionExecutor,
  RetryConfig,
} from 'amazon-qldb-driver-nodejs';
import { ClientConfiguration } from 'aws-sdk/clients/qldbsession';

export const Constants = {
  ledger_name: 'deptoolkit',
  doc_table_name: 'Document',
  doc_index_key: 'sku',
};

const qldbDriver: QldbDriver = createQldbDriver();

/**
 * Create a driver for creating sessions.
 * @param ledgerName The name of the ledger to create the driver on.
 * @param serviceConfigurationOptions The configurations for the AWS SDK client that the driver uses.
 * @returns The driver for creating sessions.
 */
function createQldbDriver(
  ledgerName: string = Constants.ledger_name,
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

function getQldbDriver(): QldbDriver {
  return qldbDriver;
}

/**
 * Connect to a session for a given ledger using default settings.
 * @returns Promise which fulfills with void.
 */
const ConnectToLedger = async function (): Promise<void> {
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

/**
 * List all documents in a given table.
 * @param tableName Name of the table to look up documents from.
 * @returns Promise which fulfills with a {@linkcode Result} object.
 */
export const listDocuments = async function (
  tableName: string
): Promise<Result> {
  try {
    const qldbDriver: QldbDriver = getQldbDriver();
    const statement: string = `SELECT * FROM ${tableName}`;
    let r = qldbDriver.executeLambda(async (txn: TransactionExecutor) => {
      let results = await txn.execute(statement);
      return results;
    });
    return r;
  } catch (e) {
    console.log(`Unable to list documents in ${tableName}: ${e}`);
  }
};

/**
 * Insert documents into a table in a QLDB ledger.
 * @param tableName Name of the table to insert documents into.
 * @param documents List of documents to insert.
 * @returns Promise which fulfills with with a {@linkcode Result} object.
 */
export const insertDocuments = async function (
  tableName: string,
  documents: object
): Promise<Result> {
  try {
    const qldbDriver: QldbDriver = getQldbDriver();
    const statement: string = `INSERT INTO ${tableName} ?`;
    let r = qldbDriver.executeLambda(async (txn: TransactionExecutor) => {
      let results = await txn.execute(statement, documents);
      return results;
    });
    return r;
  } catch (e) {
    console.log(`Unable to insert documents: ${e}`);
  }
};
