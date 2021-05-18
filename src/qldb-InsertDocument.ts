import {
  QldbDriver,
  Result,
  TransactionExecutor,
} from 'amazon-qldb-driver-nodejs';
import { getQldbDriver } from './qldb-ConnectToLedger';

/**
 * Insert the given list of documents into a table in a single transaction.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param tableName Name of the table to insert documents into.
 * @param documents List of documents to insert.
 * @returns Promise which fulfills with a {@linkcode Result} object.
 */
export async function insertDocument(
  txn: TransactionExecutor,
  tableName: string,
  documents: object
): Promise<Result> {
  const statement: string = `INSERT INTO ${tableName} ?`;
  let result: Result = await txn.execute(statement, documents);
  return result;
}

/**
 * Insert documents into a table in a QLDB ledger.
 * @returns Promise which fulfills with void.
 */
export const insertDocuments = async function (
  tableName: string,
  documents: object
): Promise<void> {
  try {
    const qldbDriver: QldbDriver = getQldbDriver();
    await qldbDriver.executeLambda(async (txn: TransactionExecutor) => {
      await insertDocument(txn, tableName, documents);
    });
  } catch (e) {
    console.log(`Unable to insert documents: ${e}`);
  }
};
