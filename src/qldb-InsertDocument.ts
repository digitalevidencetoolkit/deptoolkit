import {
  QldbDriver,
  Result,
  TransactionExecutor,
} from 'amazon-qldb-driver-nodejs';
import { getQldbDriver } from './qldb-ConnectToLedger';

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
