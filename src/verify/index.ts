import { makeHash } from '../helpers';
import * as Record from '../types/Record';
import * as Ledger from '../ledger';

/**
 * Verify whether or not the specified `file` is present in the Ledger,
 *
 * @return a Promise resolving to:
 * - `null` if the file isn't present, or
 * - the corresponding record, converted to Frontend format, otherwise.
 **/
export const verifyFile = async (
  file: Buffer
): Promise<Record.FrontEndRecord | null> => {
  const hash = makeHash(file);
  const record = await Ledger.getDoc(hash, 'screenshot');
  return record === null ? record : Record.toFrontend(record);
};
