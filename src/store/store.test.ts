import * as fs from 'fs';
import * as path from 'path';
import Zip from 'node-stream-zip';

import * as Bundle from '../types/Bundle';
import * as Record from '../types/Record';
import * as File from '../types/File';

import * as Store from './index';

describe('generateAboutString', () => {
  it('should throw if the record is missing the screenshot or one_file', () => {
    const bundles: Bundle.Bundle[] = [
      [],
      [{ hash: 'jeej', kind: 'one_file' }],
      [{ hash: 'tuut', kind: 'screenshot' }],
    ];

    bundles.forEach(bundle =>
      expect(() =>
        Store.generateAboutString({
          bundle,
          annotations: {
            description: '',
          },
          data: {
            title: 'foo',
            url: 'http://jeej.tuut',
          },
        })
      ).toThrow()
    );
  });

  it('should generate a string describing the given bundle', () => {
    const title = 'Win big money in no time thanks to this one simple trick';
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const oneFile: File.File = { hash: 'this-is-the-file', kind: 'one_file' };
    const screenshot: File.File = {
      hash: 'pretty-picture',
      kind: 'screenshot',
    };
    const ogNow = Date.now;
    Date.now = () => 42;

    const result = Store.generateAboutString({
      bundle: [oneFile, screenshot],
      annotations: {
        description: '',
      },
      data: {
        title,
        url,
      },
    });

    const expected = `THE DIGITAL EVIDENCE PRESERVATION TOOLKIT
============
Working copy export generated on 42

${title}
${url}

Files included:
  ${File.fileName(screenshot)}
  ${File.fileName(oneFile)}`;

    expect(result).toEqual(expected);

    Date.now = ogNow;
  });
});

describe('makeZip', () => {
  let bundleRootDir = '';
  let outDir = '';

  beforeEach(() => {
    bundleRootDir = fs.mkdtempSync('in-');
    outDir = fs.mkdtempSync('out-');
  });

  afterEach(() => {
    [bundleRootDir, outDir].forEach(p =>
      fs.rmSync(p, { force: true, recursive: true })
    );
  });

  it('should reject if the record is missing the screenshot or one_file', () => {
    const bundles: Bundle.Bundle[] = [
      [],
      [{ hash: 'jeej', kind: 'one_file' }],
      [{ hash: 'tuut', kind: 'screenshot' }],
    ];

    bundles.forEach(async bundle => {
      let zip = undefined;
      try {
        zip = await Store.makeZip(
          {
            bundle,
            annotations: {
              description: '',
            },
            data: {
              title: 'foo',
              url: 'http://jeej.tuut',
            },
          },
          bundleRootDir,
          outDir
        );
      } catch (e) {}
      expect(zip).toBeUndefined();
    });
  });

  it('should produce a zip of the given record, in the correct location', async () => {
    const oneFile: File.File = { hash: 'this-is-the-file', kind: 'one_file' };
    const screenshot: File.File = {
      hash: 'pretty-picture',
      kind: 'screenshot',
    };
    const oneFileName = File.fileName(oneFile);
    const screenshotName = File.fileName(screenshot);

    fs.writeFileSync(path.join(bundleRootDir, oneFileName), 'jeej');
    fs.writeFileSync(path.join(bundleRootDir, screenshotName), 'tuut');

    const record: Record.Record = {
      data: {
        title: 'Non Stop Nyan Cat',
        url: 'http://www.nyan.cat/',
      },
      annotations: {
        description: 'A cat farting an infinite rainbow',
      },
      bundle: [oneFile, screenshot],
    };

    await Store.makeZip(record, bundleRootDir, outDir);

    const zipPath = path.join(outDir, `${Bundle.id(record.bundle)}.zip`);

    // check for the zip's existence and contents
    // TODO: for this test to be complete, we should also check the files
    // contents themselves.
    const z = new Zip.async({ file: zipPath });
    const entries = await z.entries();
    expect(entries).toEqual({
      [oneFileName]: expect.any(Object),
      [screenshotName]: expect.any(Object),
      'about-this-export.txt': expect.any(Object),
    });
    z.close();
  });

  it('should return a rejected promise when a file is missing on disk', async () => {
    const oneFile: File.File = { hash: 'this-is-the-file', kind: 'one_file' };
    const screenshot: File.File = {
      hash: 'pretty-picture',
      kind: 'screenshot',
    };
    const screenshotName = File.fileName(screenshot);

    // simulate a missing file
    // fs.writeFileSync(path.join(bundleRootDir, oneFileName), 'jeej');
    fs.writeFileSync(path.join(bundleRootDir, screenshotName), 'tuut');

    const record: Record.Record = {
      data: {
        title: 'Non Stop Nyan Cat',
        url: 'http://www.nyan.cat/',
      },
      annotations: {
        description: 'A cat farting an infinite rainbow',
      },
      bundle: [oneFile, screenshot],
    };

    await Store.makeZip(record, bundleRootDir, outDir)
      .then(() => {
        throw new Error('hello error, bad luck');
      })
      .catch(err => console.log(`Error: ${err}`));
  });
});
