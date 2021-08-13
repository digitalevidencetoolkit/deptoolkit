import { makeHash } from '../helpers';
import * as Record from '../types/Record';
import * as Ledger from '../ledger';

/**
 * Verify whether a file is present in our archive/ledger
 * @param f a Buffer, e.g. a kind of stream of binary data
 * @return a promise of a Record type, or a falsey
 **/
export const verifyFile = (f: Buffer): Promise<Record.Record | false> =>
    new Promise((resolve, reject) => {
	const hash = makeHash(f);
	const match = Ledger.getDoc(hash);
	if (match) resolve(match)
	else reject(false);
    });
