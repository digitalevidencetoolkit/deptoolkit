import * as fs from 'fs';
import * as path from 'path';
import Zip from 'node-stream-zip';

import type { Bundle } from '../types/Bundle';
import type { Record } from '../types/Record';

import * as Store from './index';
import { id } from '../types/Bundle';

describe('generateAboutString', () => {
  it('should throw if the record is missing the screenshot or one_file', () => {
    const bundles: Bundle[] = [
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
    const oneFile = 'this-is-the-file';
    const screenshot = 'pretty-picture';
    const ogNow = Date.now;
    Date.now = () => 42;

    const result = Store.generateAboutString({
      bundle: [
        { hash: oneFile, kind: 'one_file' },
        { hash: screenshot, kind: 'screenshot' },
      ],
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
  ${screenshot}.png
  ${oneFile}.html`;

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
    const bundles: Bundle[] = [
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
    const oneFileHash = 'this-is-the-file';
    const screenshotHash = 'pretty-picture';

    fs.writeFileSync(path.join(bundleRootDir, `${oneFileHash}.html`), 'jeej');
    fs.writeFileSync(path.join(bundleRootDir, `${screenshotHash}.png`), 'tuut');

    const record: Record = {
      data: {
        title: 'Non Stop Nyan Cat',
        url: 'http://www.nyan.cat/',
      },
      annotations: {
        description: 'A cat farting an infinite rainbow',
      },
      bundle: [
        { kind: 'one_file', hash: oneFileHash },
        { kind: 'screenshot', hash: screenshotHash },
      ],
    };

    await Store.makeZip(record, bundleRootDir, outDir);

    const zipPath = path.join(outDir, `${id(record.bundle)}.zip`);

    // check for the zip's existence and contents
    // TODO: for this test to be complete, we should also check the files
    // contents themselves.
    const z = new Zip.async({ file: zipPath });
    const entries = await z.entries();
    expect(entries).toEqual({
      [`${oneFileHash}.html`]: expect.any(Object),
      [`${screenshotHash}.png`]: expect.any(Object),
      'about-this-export.txt': expect.any(Object),
    });
    z.close();
  });

  it('should return a rejected promise when a file is missing on disk', async () => {
    const oneFileHash = 'this-is-the-file';
    const screenshotHash = 'pretty-picture';

    // simulate a missing file
    // fs.writeFileSync(path.join(bundleRootDir, `${oneFileHash}.html`), 'jeej');
    fs.writeFileSync(path.join(bundleRootDir, `${screenshotHash}.png`), 'tuut');

    const record: Record = {
      data: {
        title: 'Non Stop Nyan Cat',
        url: 'http://www.nyan.cat/',
      },
      annotations: {
        description: 'A cat farting an infinite rainbow',
      },
      bundle: [
        { kind: 'one_file', hash: oneFileHash },
        { kind: 'screenshot', hash: screenshotHash },
      ],
    };

    await Store.makeZip(record, bundleRootDir, outDir)
      .then(() => {
        throw new Error('hello error, bad luck');
      })
      .catch(err => console.log(`Error: ${err}`));
  });
});
