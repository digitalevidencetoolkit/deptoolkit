import archiver from 'archiver';
import { Response } from 'express';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import { makeHash, pprint } from '../helpers';
import * as File from '../types/File';
import * as Bundle from '../types/Bundle';
import * as Record from '../types/Record';
import * as S3 from '../s3';
// import * as s3storage from s3storage

// set up .env variables as environment variables
config();

type WriteConfiguration = {
  type: 'local' | 'S3' | undefined;
  directory: string;
  bucket?: string;
};

/**
 * Write the specified `data` in the specified `directory`, under the specified
 * `fileName`.
 *
 * If `directory` doesn't exist, it is created. If there is already a file
 * named `fileName` in that location, it is silently overwritten.
 *
 * @returns a Promise resolving once the write is done.
 */
const writeToDisk = async (
  data: Buffer | string,
  directory: string,
  fileName: string
): Promise<void> => {
  // create the directory if it does not yet exist
  await fsp.mkdir(directory, { recursive: true });
  await fsp.writeFile(path.join(directory, fileName), data);
};

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
  const { kind, data } = newFile;

  const hash = makeHash(data);
  const result: File.File = { kind, hash };

  await writeToDisk(data, directory, File.fileName(result));

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
  const screenshotFile = r.bundle.find(e => e.kind === 'screenshot');
  const oneFileFile = r.bundle.find(e => e.kind === 'one_file');
  if (screenshotFile === undefined || oneFileFile === undefined) {
    throw new Error(
      `This record's bundle is malformed (missing either screenshot or oneFile): ${pprint(
        r
      )}`
    );
  }

  const screenshot = File.fileName(screenshotFile);
  const one_file = File.fileName(oneFileFile);

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
    const screenshotFile = r.bundle.find(e => e.kind === 'screenshot');
    const oneFileFile = r.bundle.find(e => e.kind === 'one_file');
    if (screenshotFile === undefined || oneFileFile === undefined) {
      reject(
        new Error(
          `This record's bundle is malformed (missing either screenshot or oneFile): ${pprint(
            r
          )}`
        )
      );
      return;
    }
    // presently the ZIP file only includes the full screenshot and one-file
    // HTML archive. isolating them like so isn't the most elegant.
    // maybe replace with a function from `Bundle`?
    const screenshotName = File.fileName(screenshotFile);
    const one_fileName = File.fileName(oneFileFile);
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
 * Handles how to access a file depending on its source, i.e. dispatch between
 * the file system or an S3 bucket (and hopefully more to come)
 * @returns a Response containing the file
 */
export const getFile = (id: string, res: Response) => {
  const source = sourceToFavour();
  if (source === 'directory') {
    const outDir = path.join(
      __dirname,
      `./../../${process.env.SOURCE_FILES_DIRECTORY}`
    );
    const options = {
      root: outDir,
      dotfiles: 'deny',
    };
    res.sendFile(`${id}`, options);
  } else if (source === 'bucket') {
    const result = S3.getFileInBucket(
      id,
      process.env.SOURCE_FILES_BUCKET as string
    );
    result.on('error', err => {
      const { name } = err;
      res.status(500).send(`Error getting file: S3 ${name}`);
    });
    result.pipe(res);
  }
};

/**
 * Handles dispatch between local and cloud resources.
 * If a bucket name is present in the config, then this
 * data source will be preferred over local directory.
 * @returns a string: 'bucket' or 'directory'
 */
export const sourceToFavour = (): 'bucket' | 'directory' | null => {
  const hasBucket =
    process.env.SOURCE_FILES_BUCKET && process.env.SOURCE_FILES_BUCKET != '';
  const hasDirectory =
    process.env.SOURCE_FILES_DIRECTORY &&
    process.env.SOURCE_FILES_DIRECTORY != '';
  if (hasBucket === true) {
    return 'bucket';
  } else if (hasDirectory === true) {
    return 'directory';
  } else {
    return null;
  }
};

/**
 *  if cfg.s3
 *    ...
 *  if cfg.local
 *    ...
 **/
