/**
 * Create multiple indexes in a single transaction.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param indexName Name of the index to create.
 * @returns Promise which fulfills with the number of changes to the database.
 */
export async function createIndex(txn, indexName, indexKey) {
  const statement = `CREATE INDEX ON ${indexName} (${indexKey})`;
  try {
    return await txn.execute(statement).then((result) => {
      console.log(`✅ Successfully created index ${indexKey}.`);
    });
  } catch (e) {
    return `error ${e}`;
  }
}
