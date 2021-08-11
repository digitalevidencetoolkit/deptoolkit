import * as Record from '../types/Record';
import * as Annotations from '../types/Annotations';
import type { Annotation } from '../types/Annotations';
import * as QLDB from '../qldb';
import { dom } from 'ion-js';

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

export const getDoc = async (id: string): Promise<Record.Record> => {
  const list: Result = await QLDB.getOneDocument(
    id,
    QLDB.Constants.doc_table_name
  );
  const result = list.getResultList();
  // return result.map(e => Record.fromLedger(e));
  return Record.fromLedger(result[0]);
};

export const listDocHistory = async (sku: string): Promise<dom.Value[]> => {
  const list = await QLDB.queryHistoryOfDocument(sku);
  const result = list.getResultList();
  return result;
};

export const updateDoc = async (sku: string, data: Annotation) => {
  Annotations.validate(data)
    .then(annotation => annotation.description)
    .then(description =>
      QLDB.updateDocument(QLDB.Constants.doc_table_name, description, sku)
    )
    .catch(err => console.log(`${err.name}: ${err.errors}`));
};
