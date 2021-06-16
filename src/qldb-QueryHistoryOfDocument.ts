import {
  QldbDriver,
  Result,
  TransactionExecutor,
} from 'amazon-qldb-driver-nodejs';
import { dom } from 'ion-js';
import { getQldbDriver } from './qldb-ConnectToLedger';
/**
 * Get the document IDs from the given table.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param tableName The table name to query.
 * @param field A field to query.
 * @param value The key of the given field.
 * @returns Promise which fulfills with the document ID as a string.
 */
export async function getDocumentIdByField(
  txn: TransactionExecutor,
  tableName: string,
  field: string,
  value: string
): Promise<string> {
  const query: string = `SELECT id FROM ${tableName} AS t BY id WHERE t.${field} = ?`;
  let documentId: string = undefined;
  await txn
    .execute(query, value)
    .then((result: Result) => {
      const resultList: dom.Value[] = result.getResultList();
      if (resultList.length === 0) {
        throw new Error(
          `Unable to retrieve document ID using ${field}: ${value}.`
        );
      }
      documentId = resultList[0].get('id').stringValue();
    })
    .catch((err: any) => {
      console.log(`Error getting documentId: ${err}`);
    });
  return documentId;
}

/**
 * List the history of a particular document.
 * @param tableName Name of the table to look in.
 * @param sku Unique identifier of the document.
 * @returns Promise which fulfills with a list of results
 */
export const queryHistoryOfDocument = async function (
  tableName: string,
  sku: string
): Promise<dom.Value[]> {
  try {
    const qldbDriver: QldbDriver = getQldbDriver();
    const statement: string = `SELECT * from history (${tableName}) AS h WHERE h.metadata.id = ?`;

    let r = qldbDriver.executeLambda(async (txn: TransactionExecutor) => {
      const documentId: string = await getDocumentIdByField(
        txn,
        tableName,
        'sku',
        sku
      );

      // @TODO handle results = undefined because sku can't be found
      // current solution doesn't feel like the correct way to handle errors
      if (documentId) {
        let results = await txn.execute(statement, documentId);
        return results.getResultList();
      }
    });
    return r;
  } catch (e) {
    console.log(`Unable to query history of document in ${tableName}`);
  }
};
