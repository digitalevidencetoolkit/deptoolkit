/**
 * Create multiple tables in a single transaction.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param tableName Name of the table to create.
 * @returns Promise which fulfills with the number of changes to the database.
 */
export async function createTable(txn, tableName) {
  const statement = `CREATE TABLE ${tableName}`;
  try {
    return await txn.execute(statement).then((result) => {
      console.log(`✅ Successfully created table ${tableName}.`);
    });
  } catch (e) {
    return `error ${e}`;
  }
}
