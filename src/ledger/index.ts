import * as Record from '../types/Record';
import { DOC_TABLE_NAME } from '../qldb-Constants';
import { listDocuments } from '../qldb-ListDocuments';
import { insertDocuments } from '../qldb-InsertDocument';

import { Result } from 'amazon-qldb-driver-nodejs';

const validate = (r: Record.Record): Promise<Record.Record> =>
  Promise.resolve(r);

export const insertDoc = (r: Record.Record): Promise<Result> =>
  validate(r)
    .then(Record.toLedger)
    .then(dbItem => insertDocuments(DOC_TABLE_NAME, dbItem));

export const listDocs = async (): Promise<Record.FrontEndRecord[]> => {
  const list: Result = await listDocuments(DOC_TABLE_NAME);
  const result = list.getResultList();
  return result
    .map(e => Record.fromLedger(e))
    .map((e: Record.Record): Record.FrontEndRecord => Record.toFrontend(e));
};
