import * as Record from '../types/Record';
import * as Annotations from '../types/Annotations';
import type { Annotation } from '../types/Annotations';
import * as QLDB from '../qldb';
import { dom } from 'ion-js';

import { Result } from 'amazon-qldb-driver-nodejs';

export const insertDoc = (r: Record.Record): Promise<Result | void> =>
  Record.validate(r)
    .then(Record.toLedger)
    .then(dbItem =>
      QLDB.insertDocuments(process.env.DOC_TABLE_NAME as string, dbItem)
    )
    .catch(err => console.log(`${err.name}: ${err.errors}`));

export const listDocs = async (): Promise<Record.FrontEndRecord[]> => {
  const list: Result | undefined = await QLDB.listDocuments(
    process.env.DOC_TABLE_NAME as string
  );
  const result = list?.getResultList() || [];
  return result
    .map(e => Record.fromLedger(e))
    .map((e: Record.Record): Record.FrontEndRecord => Record.toFrontend(e));
};

export const getDoc = async (
  id: string,
  col: string
): Promise<Record.Record | null> => {
  const list: Result | undefined = await QLDB.getOneDocument(
    id,
    col,
    process.env.DOC_TABLE_NAME as string
  );
  const result = list?.getResultList() || [];
  if (result.length > 0) {
    return Record.fromLedger(result[0]);
  } else {
    return null;
  }
};

export const listDocHistory = async (sku: string): Promise<dom.Value[]> => {
  const list = await QLDB.queryHistoryOfDocument(sku);
  const result = list?.getResultList() || [];
  return result;
};

export const updateDoc = async (sku: string, data: Annotation) => {
  Annotations.validate(data)
    .then(annotation => annotation.description)
    .then(description =>
      QLDB.updateDocument(
        process.env.DOC_TABLE_NAME as string,
        description,
        sku
      )
    )
    .catch(err => console.log(`${err.name}: ${err.errors}`));
};
