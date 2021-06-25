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
  thumb?: string;
  hash?: string;
};

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
  thumb: r.bundle.find(f => f.kind === 'screenshot_thumbnail')?.hash,
  hash: r.bundle.find(f => f.kind === 'screenshot')?.hash,
});
