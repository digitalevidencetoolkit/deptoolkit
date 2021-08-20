import * as fs from 'fs';
import 'archiver';
import { mkdir } from 'fs/promises';
import { makeHash } from '../helpers';
import * as File from '../types/File';
import * as Bundle from '../types/Bundle';
import * as Record from '../types/Record';
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
 * Generates a string describing the specified Record `r`.
 */
export const generateAboutString = (r: Record.Record): string => {
  const screenshot = r.bundle.find(e => e.kind === 'screenshot').hash + '.png';
  const one_file = r.bundle.find(e => e.kind === 'one_file').hash + '.html';
  return `THE DIGITAL EVIDENCE PRESERVATION TOOLKIT
============
Working copy export generated on ${Date.now()}

${r.data.title}
${r.data.url}

Files included:
  ${screenshot}
  ${one_file}`;
};

/**
 * Builds a ZIP file from the specified Record `r`, in the specified
 * `outDirectory`. The produced file will use the record's bundle id (as produced
 * by `Bundle.id`) as its name, and will be located in the specified
 * `outDirectory`. The function will use the specified `bundleRootDirectory` as the root
 * where to read the files listed in `r`.
 *
 * The behaviour is unspecified unless:
 * - `r` specifies one 'one_file' and one 'screenshot' files
 * - the screenshot and one_file files exist and can be read in `bundleRootDirectory`
 * - `outDirectory` exists and is writable
 *
 * @returns a promise resolving once the ZIP file has been created, or rejecting
 * if an error happened.
 */
export const makeZip = (
  r: Record.Record,
  bundleRootDirectory: string,
  outDirectory: string
): Promise<void> => {
  const b = r.bundle;
  const zip = archiver('zip', { zlib: { level: 0 } });
  const out = `${outDirectory}/${Bundle.id(b)}.zip`;

  return new Promise<void>((resolve, reject) => {
    // presently the ZIP file only includes the full screenshot and one-file
    // HTML archive. isolating them like so isn't the most elegant.
    // maybe replace with a function from `Bundle`?
    const screenshot = b.find(e => e.kind === 'screenshot').hash + '.png';
    const one_file = b.find(e => e.kind === 'one_file').hash + '.html';
    const sidecarTextFile = generateAboutString(r);

    const stream = fs.createWriteStream(out);
    stream.on('error', e => {
      console.error(e);
      reject();
    });
    stream.on('close', () => {
      console.log(`${zip.pointer()} bytes written`);
      resolve();
    });
    zip
      .append(
        fs
          .createReadStream(`${bundleRootDirectory}/${screenshot}`)
          .on('error', reject),
        {
          name: screenshot,
        }
      )
      .append(
        fs
          .createReadStream(`${bundleRootDirectory}/${one_file}`)
          .on('error', reject),
        {
          name: one_file,
        }
      )
      .append(sidecarTextFile, { name: `about-this-export.txt` })
      .on('error', reject)
      .pipe(stream);
    zip.finalize();
  });
};

/**
 *  if cfg.s3
 *    ...
 *  if cfg.local
 *    ...
 **/
