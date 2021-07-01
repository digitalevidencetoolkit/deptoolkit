import * as Record from '../types/Record';
import * as QLDB from '../qldb';

import { Result } from 'amazon-qldb-driver-nodejs';

export const insertDoc = (r: Record.Record): Promise<Result | void> =>
  Record.validate(r)
    .then(Record.toLedger)
    .then(dbItem => QLDB.insertDocuments(QLDB.Constants.doc_table_name, dbItem))
    .catch(err => console.log(`${err.name}: ${err.errors}`));

export const listDocs = async (): Promise<Record.FrontEndRecord[]> => {
  const list: Result = await QLDB.listDocuments(QLDB.Constants.doc_table_name);
  const result = list.getResultList();
  return result
    .map(e => Record.fromLedger(e))
    .map((e: Record.Record): Record.FrontEndRecord => Record.toFrontend(e));
};
