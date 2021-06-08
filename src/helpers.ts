import * as fs from 'fs';
import { createHash } from 'crypto';

/**
 * Pretty prints a JSON var
 * @returns A nicely-formatted string
 */
export const pprint = (json: {}): string => JSON.stringify(json, null, 4);

/**
 *  Promise to write a base64-encoded string to the `out/` directory.
 * @param sku string
 * @param base64Data string (base64-encoded)
 * @returns A resolved promise
 */
export const writeScreenshot = (
  sku: string | string[],
  base64Data: string
): Promise<void> =>
  new Promise((resolve, reject) =>
    fs.writeFile(`out/${sku}.png`, base64Data, 'base64', err => {
      if (err) reject(err);
      else resolve();
    })
  );

/**
 * Promise to compute the SHA256 of a local file in the `out/` directory.
 * @param sku string
 * @returns A resolved promise
 */
export const hashFromFile = (sku: string | string[]): Promise<string> =>
  new Promise((resolve, reject) =>
    fs.readFile(`out/${sku}.png`, (err, data) => {
      let hash = createHash('sha256');
      hash.update(data);
      const hex = hash.digest('hex');
      if (err) reject(err);
      else resolve(hex);
    })
  );
