/**
 * Insert the given list of documents into a table in a single transaction.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param tableName Name of the table to insert documents into.
 * @param documents List of documents to insert.
 * @returns Promise which fulfills with a {@linkcode Result} object.
 */
export async function insertDocuments(txn, tableName, documents) {
  const statement = `INSERT INTO ${tableName} ?`;
  try {
    return await txn
      .execute(statement, documents)
      .then((result) =>
        console.log(`✅ Successfully added ${documents.length} records.`)
      );
  } catch (e) {
    return `error ${e}`;
  }
}
