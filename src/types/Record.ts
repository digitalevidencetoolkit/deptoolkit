import * as yup from 'yup';
import * as Annotations from './Annotations';
import * as Data from './Data';
import * as Bundle from './Bundle';

export type Record = {
  bundle: Bundle.Bundle;
  annotations: Annotations.Annotation;
  data: Data.Data;
};

export type FrontEndRecord = {
  title: string;
  sku: string;
  url: string;
  thumb_hash?: string;
  screenshot_hash?: string;
  one_file_hash?: string;
  description?: string;
};

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

export const validate = (r: Record): Promise<any> => DocSchema.validate(r);

type ArbitraryObject = { [key: string]: any };

/**
 * A Record's ID is the same ID as its bundle
 * @param r a Record
 * @returns string
 */
export const id = (r: Record) => Bundle.id(r.bundle);

/**
 * Converts a Record data structure ahead of sending to the ledger
 * @param r a Record
 * @returns an un-nested Record structure
 */
export const toLedger = (r: Record) => ({
  id: id(r),
  ...r.data,
  ...r.annotations,
  /**
   *     [{kind: 'a', hash: 'aaa'}, {kind: 'b', hash: 'bbb'}]
   *     --> { a: 'aaa', b: 'bbb' }
   */
  ...r.bundle.reduce((a, { kind, hash }) => ({ ...a, [kind]: hash }), {}),
});

/**
 * Converts a ledger data structure to a Record one
 * @param o an object from the ledger
 * @returns a Record
 */
export const fromLedger = (o: ArbitraryObject): Record => {
  return {
    data: { url: o?.url, title: o?.title },
    annotations: { description: o?.description },
    bundle: [
      { kind: 'screenshot' as const, hash: o?.screenshot },
      {
        kind: 'screenshot_thumbnail' as const,
        hash: o?.screenshot_thumbnail,
      },
      { kind: 'one_file' as const, hash: o?.one_file },
    ],
  };
  console.warn(` got this junk from the ledger: ${o}`);
};

/**
 * Converts a Record data structure ahead of rendering by the frontend
 * @param r
 * @returns
 */
export const toFrontend = (r: Record): FrontEndRecord => ({
  title: r.data.title,
  sku: id(r),
  url: r.data.url,
  thumb_hash: r.bundle.find(f => f.kind === 'screenshot_thumbnail')?.hash,
  screenshot_hash: r.bundle.find(f => f.kind === 'screenshot')?.hash,
  one_file_hash: r.bundle.find(f => f.kind === 'one_file')?.hash,
  description: r.annotations?.description,
});
