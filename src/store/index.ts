import * as fs from 'fs';
import { join } from 'path';
import 'archiver';
import { mkdir } from 'fs/promises';
import { makeHash } from '../helpers';
import * as File from '../types/File';
import * as Bundle from '../types/Bundle';
import archiver from 'archiver';
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
  // create the directory if it does not yet exist
  await mkdir(dir, { recursive: true });
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
 * Builds a ZIP file from a bundle
 * @param b a Bundle, i.e. a list of Files
 * @returns  a promise
 */
export const makeZip = (b: Bundle.Bundle): Promise<void> => {
  const zip = archiver('zip', { zlib: { level: 0 } });
  const out = `out/${Bundle.id(b)}.zip`;
  const stream = fs.createWriteStream(out);
  const root = join(__dirname, '../../out');

  // presently the ZIP file only includes the full screenshot and one-file
  // HTML archive. isolating them like so isn't the most elegant.
  // maybe replace with a function from `Bundle`?
  const screenshot = b.find(e => e.kind === 'screenshot').hash + '.png';
  const one_file = b.find(e => e.kind === 'one_file').hash + '.html';

  return new Promise<void>((resolve, reject) => {
    zip
      .append(fs.createReadStream(`${root}/${screenshot}`), {
        name: screenshot,
      })
      .append(fs.createReadStream(`${root}/${one_file}`), { name: one_file })
      .on('error', err => reject(err))
      .pipe(stream);

    zip.finalize().then(() => {
      console.log(`${zip.pointer()} bytes written`);
      resolve();
    });
  });
};

/**
 *  if cfg.s3
 *    ...
 *  if cfg.local
 *    ...
 **/
