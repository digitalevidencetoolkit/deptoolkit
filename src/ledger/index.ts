import * as Record from '../types/Record';
import * as QLDB from '../qldb';
import * as yup from 'yup';

import { Result } from 'amazon-qldb-driver-nodejs';

const DocSchema = yup
  .object()
  .shape({
    bundle: yup
      .array()
      .of(yup.object().shape({ kind: yup.string(), hash: yup.string() })),
    annotations: yup.object().shape({ description: yup.string() }),
    data: yup.object().shape({ title: yup.string(), url: yup.string() }),
  })
  .strict()
  .noUnknown();

const validate = (r: Record.Record): Promise<any> => DocSchema.validate(r);

export const insertDoc = (r: Record.Record): Promise<Result | void> =>
  validate(r)
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
