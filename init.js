import { config } from 'dotenv';
import {
  QldbDriver,
  Result,
  TransactionExecutor,
} from 'amazon-qldb-driver-nodejs';
import { getQldbDriver } from './src/qldb-ConnectToLedger.js';
import { createTable } from './src/qldb-CreateTable.js';
import { createIndex } from './src/qldb-CreateIndex.js';
import { insertDocuments } from './src/qldb-InsertDocument.js';

import {
  LEDGER_NAME,
  DOC_TABLE_NAME,
  DOC_INDEX_KEY,
} from './src/qldb-Constants.js';
import { Documents } from './sample-data/SampleData.js';

config();

const main = async function () {
  try {
    const qldbDriver = getQldbDriver();
    await qldbDriver.executeLambda(async txn => {
      Promise.all([
        createTable(txn, DOC_TABLE_NAME),
        createIndex(txn, DOC_TABLE_NAME, DOC_INDEX_KEY),
        insertDocuments(txn, DOC_TABLE_NAME, Documents),
        // await qldbDriver.executeLambda(async (txn) => {
        //   const results = (
        //     await txn.execute('SELECT * FROM Document')
        //   ).getResultList();
        //   for (let result of results) {
        //     console.log(result); // prints [String: 'TOYENC486FH']
        //   }
        // }),
      ]);
    });
  } catch (e) {
    return e;
  }
};

main();
