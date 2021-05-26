import {
  QldbDriver,
  Result,
  TransactionExecutor,
} from 'amazon-qldb-driver-nodejs';
import { getQldbDriver } from './qldb-ConnectToLedger';

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
