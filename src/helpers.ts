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

/**
 * change the format of a base64 string to a type we can work with
 * @param s the string, as given by the formidable library, or something else
 * @returns a string, without the data:image things, and also without the + character
 */
export const cleanupBase64 = (s: string): string => {
  let base64Data: string;
  base64Data = s.replace(/^data:image\/png;base64,/, '');
  base64Data += base64Data.replace('+', ' ');
  return base64Data;
};
