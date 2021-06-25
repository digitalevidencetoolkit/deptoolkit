import * as fs from 'fs';
import sharp, { Sharp } from 'sharp';
import { createHash } from 'crypto';

/**
 * Pretty prints a JSON var
 * @returns A nicely-formatted string
 */
export const pprint = (json: {}): string => JSON.stringify(json, null, 4);

export const makeHash = (str: string | Buffer): string => {
  let hash = createHash('sha256');
  hash.update(str);
  return hash.digest('hex');
};
