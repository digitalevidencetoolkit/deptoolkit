import * as fs from 'fs';
import sharp, { Sharp } from 'sharp';
import { createHash } from 'crypto';

/**
 * Pretty prints a JSON var
 * @returns A nicely-formatted string
 */
export const pprint = (json: {}): string => JSON.stringify(json, null, 4);

/**
 * Returns the path an SKU would have in the screenshots directory
 * @param sku string
 * @returns a string denominating a path
 */
const makePathToScreenshotsDir = (path: string | string[]): string =>
  `out/${path}.png`;

/**
 * Promise to write a base64-encoded string to the `out/` directory.
 * @param sku string
 * @param base64Data string (base64-encoded)
 * @returns A resolved promise
 */
export const writeScreenshot = (
  sku: string | string[],
  base64Data: string
): Promise<void> =>
  new Promise((resolve, reject) =>
    fs.writeFile(makePathToScreenshotsDir(sku), base64Data, 'base64', err => {
      if (err) reject(err);
      else resolve();
    })
  );

/**
 * Promise to write a 320px-wide thumbnail to the `out/` directory
 * from the SKU of an asset
 * @param sku string
 * @returns a promised buffer
 */
export const makeThumbnail = (sku: string | string[]): Promise<Buffer> =>
  sharp(makePathToScreenshotsDir(sku))
    .resize(320, 240, { fit: 'inside' })
    .toBuffer();

export const makeHash = (str: string | Buffer): string => {
  let hash = createHash('sha256');
  hash.update(str);
  return hash.digest('hex');
};

/**
 * Promise to compute the SHA256 of a local file in the `out/` directory.
 * @param sku string
 * @returns A resolved promise
 */
export const hashFromFile = (sku: string | string[]): Promise<string> =>
  new Promise((resolve, reject) =>
    fs.readFile(makePathToScreenshotsDir(sku), (err, data) => {
      const hex = makeHash(data);
      if (err) reject(err);
      else resolve(hex);
    })
  );
