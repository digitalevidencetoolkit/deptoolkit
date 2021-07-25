import * as fs from 'fs';
import { makeHash } from '../helpers';
import * as File from '../types/File';
import * as Bundle from '../types/Bundle';
// import * as s3storage from s3storage

const config = {
  storage: {
    // s3: { ...s3 config}
    filesystem: {
      directory: './out',
    },
  },
};

/**
 * Promise to write a buffer to a path
 * @param b a buffer if file is an image ; a string of HTML code if file is a page
 * @param path string
 * @returns A resolved promise
 */
const writeToDisk = (b: Buffer | string, path: string): Promise<void> =>
  new Promise((resolve, reject) =>
    fs.writeFile(path, b, err => {
      if (err) reject(err);
      else resolve();
    })
  );

/**
 * Logic for saving a file to disk from a storage config object
 * @param a a newFile, made of a buffer or of a string of HTML code
 * @returns a promise of a File, having been written to disk
 **/
export const writeOne = async (a: File.newFile): Promise<File.File> => {
  const dir = config?.storage?.filesystem?.directory;
  if (!dir) {
    throw new Error(`No directory set in config`);
  }
  const name = makeHash(a.data);
  const format = a.kind === 'one_file' ? 'html' : 'png';
  const path = `${dir}/${name}.${format}`;
  await writeToDisk(a.data, path);
  return { kind: a.kind, hash: name };
};

/**
 * Writes base64 data to files
 * @param b a NewBundle, made of base64 string data
 * @returns a promise of a Bundle, made of files written to disk
 **/
export const newBundle = (b: Bundle.newBundle): Promise<Bundle.Bundle> => {
  return Promise.all(b.map(writeOne));
};

/**
 *  if cfg.s3
 *    ...
 *  if cfg.local
 *    ...
 **/
