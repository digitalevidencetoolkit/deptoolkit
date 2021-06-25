import * as Record from '../types/Record';
import { DOC_TABLE_NAME } from '../src/qldb-Constants';
import { insertDocuments } from '../src/qldb-InsertDocument';

const validate = (r: Record.Record): Promise<Record.Record> =>
  Promise.resolve(r);

export const insert = (r: Record.Record) =>
  validate(r)
    .then(Record.toLedger)
    .then(dbItem => insertDocuments(DOC_TABLE_NAME, dbItem));
