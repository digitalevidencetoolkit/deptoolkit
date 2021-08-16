import { makeHash } from '../helpers';
import * as Record from '../types/Record';
import * as Ledger from '../ledger';

/**
 * Verify whether a file is present in our archive/ledger
 * @param f a Buffer, e.g. a kind of stream of binary data
 * @return a promise of a Record type, or a falsey
 **/
export const verifyFile = (
  f: Buffer
): Promise<Record.FrontEndRecord[] | null> =>
  new Promise(async (resolve, reject) => {
    const hash = makeHash(f);
    await Ledger.getDoc(hash).then(match => {
      resolve(match ? match : null);
    });
  });
