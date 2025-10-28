/**
 * ⚠️ WARNING: AWS QLDB DEPRECATION NOTICE
 *
 * AWS QLDB is being discontinued on July 31, 2025.
 * This entire module will need to be replaced with an alternative ledger solution.
 *
 * @deprecated AWS QLDB service will be discontinued on July 31, 2025
 */

import {
  QldbDriver,
  Result,
  TransactionExecutor,
  RetryConfig,
} from 'amazon-qldb-driver-nodejs';
import { config } from 'dotenv';
import { ClientConfiguration } from 'aws-sdk/clients/qldbsession';

config();
const qldbDriver: QldbDriver = createQldbDriver(
  process.env.LEDGER_NAME as string
);

/**
 * Create a driver for creating sessions.
 * @param ledgerName The name of the ledger to create the driver on.
 * @param serviceConfigurationOptions The configurations for the AWS SDK client that the driver uses.
 * @returns The driver for creating sessions.
 */
function createQldbDriver(
  ledgerName: string,
  serviceConfigurationOptions: ClientConfiguration = {
    region: process.env.AWS_REGION,
  }
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
): Promise<Result | undefined> {
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

export const getOneDocument = async function (
  id: string,
  column: string,
  tableName: string
): Promise<Result | undefined> {
  try {
    const qldbDriver: QldbDriver = getQldbDriver();
    const statement: string = `SELECT * FROM ${tableName} WHERE ${column}='${id}'`;
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
): Promise<Result | undefined> {
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

/**
 * Get the document IDs from the given table.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param tableName The table name to query.
 * @param field A field to query.
 * @param value The key of the given field.
 * @returns Promise which fulfills with the document ID as a string.
 */
async function getDocumentIdByField(
  txn: TransactionExecutor,
  tableName: string,
  field: string,
  value: string
): Promise<string | undefined> {
  const query: string = `SELECT id FROM ${tableName} AS t BY id WHERE t.${field} = ?`;
  let documentId: string | undefined;
  await txn
    .execute(query, value)
    .then((result: Result) => {
      const resultList = result.getResultList();
      if (resultList.length === 0) {
        throw new Error(
          `Unable to retrieve document ID using ${field}: ${value}.`
        );
      }
      documentId = resultList[0].get('id')?.stringValue() || undefined;
    })
    .catch((err: any) => {
      console.log(`Error getting documentId: ${err}`);
    });
  return documentId;
}

/**
 * List the history of a particular document.
 * @param sku Unique identifier of the document.
 * @returns Promise which fulfills with a list of results
 */
export const queryHistoryOfDocument = async function (
  sku: string
): Promise<Result | undefined> {
  const tableName = process.env.DOC_TABLE_NAME as string;
  try {
    const qldbDriver: QldbDriver = getQldbDriver();
    const statement: string = `SELECT * from history (${tableName}) AS h WHERE h.metadata.id = ?`;

    let r = qldbDriver.executeLambda(async (txn: TransactionExecutor) => {
      const documentId: string | undefined = await getDocumentIdByField(
        txn,
        tableName,
        'id',
        sku
      );

      // @TODO handle results = undefined because sku can't be found
      // current solution doesn't feel like the correct way to handle errors
      if (documentId) {
        let results = await txn.execute(statement, documentId);
        return results;
      }
    });
    return r;
  } catch (e) {
    console.log(`Unable to query history of document in ${tableName}`);
  }
};

/**
 * Update a particular document's description field
 * @param tableName Name of the table to insert documents into.
 * @param description String to add to the ledger
 * @param id Unique identifier of the document
 * @returns Promise which fulfills with a list of result(s)
 */
export const updateDocument = async function (
  tableName: string,
  description: string,
  id: string
): Promise<Result | undefined> {
  try {
    const qldbDriver: QldbDriver = getQldbDriver();
    const statement: string = `UPDATE ${tableName} AS r
    SET r.description = ?
    WHERE r.id = ?`;
    let r = qldbDriver.executeLambda(async (txn: TransactionExecutor) => {
      let results = await txn.execute(statement, description, id);
      return results;
    });
    return r;
  } catch (e) {
    console.log(`Unable to update document: ${e}`);
  }
};
