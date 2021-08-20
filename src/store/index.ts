import * as fs from 'fs';
import 'archiver';
import { mkdir } from 'fs/promises';
import { makeHash } from '../helpers';
import * as File from '../types/File';
import * as Bundle from '../types/Bundle';
import * as Record from '../types/Record';
import archiver from 'archiver';
// import * as s3storage from s3storage

type WriteConfiguration = {
  directory: string;
  // s3: ...
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
 * Write the specified `newFile` to disk, according to the specified
 * `configuration`.
 *
 * If the same file is written twice, the old version is replaced silently.
 *
 * @param newFile object holding and describing the data to be written
 * @param configuration object describing how the new file should be written
 * @returns a promise for the resulting file, resolving once the write is
 * complete.
 **/
const writeOne = async (
  newFile: File.NewFile,
  configuration: WriteConfiguration
): Promise<File.File> => {
  const { directory } = configuration;
  // create the directory if it does not yet exist
  await mkdir(directory, { recursive: true });

  const { kind, data } = newFile;

  const hash = makeHash(data);
  const result: File.File = { kind, hash };

  const path = `${directory}/${File.fileName(result)}`;
  await writeToDisk(data, path);

  return result;
};

/**
 * Writes to disk the data contained in the specified `newBundle`, following the
 * specified `configuration`.
 *
 * If the same new bundle is written twice (or part of a new bundle is
 * re-written as part of another new bundle), the relevant files are replaced
 * silently.
 *
 * @param newBundle a NewBundle, made of base64 string data
 * @param configuration object describing how to write the new bundle
 * @returns a promise for the resulting bundle, resolving once the write is
 * complete.
 **/
export const newBundle = (
  newBundle: Bundle.NewBundle,
  configuration: WriteConfiguration
): Promise<Bundle.Bundle> => {
  return Promise.all(
    newBundle.map(newFile => writeOne(newFile, configuration))
  );
};

/**
 * Generates a string describing the specified Record `r`.
 */
export const generateAboutString = (r: Record.Record): string => {
  const screenshot = File.fileName(r.bundle.find(e => e.kind === 'screenshot'));
  const one_file = File.fileName(r.bundle.find(e => e.kind === 'one_file'));

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
    const screenshotName = File.fileName(b.find(e => e.kind === 'screenshot'));
    const one_fileName = File.fileName(b.find(e => e.kind === 'one_file'));
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
          .createReadStream(`${bundleRootDirectory}/${screenshotName}`)
          .on('error', reject),
        {
          name: screenshotName,
        }
      )
      .append(
        fs
          .createReadStream(`${bundleRootDirectory}/${one_fileName}`)
          .on('error', reject),
        {
          name: one_fileName,
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
