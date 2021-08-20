import 'buffer';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import Zip from 'node-stream-zip';

import type { Bundle, NewBundle } from '../types/Bundle';
import type { File } from '../types/File';
import type { Record } from '../types/Record';

import * as Store from './index';
import { id } from '../types/Bundle';

describe('writeOne', () => {
  let outDir = '';
  beforeEach(() => {
    outDir = fs.mkdtempSync('out-');
  });
  afterEach(() => {
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('should write to disk the specified new bundle', async () => {
    const newBundle: NewBundle = [
      { kind: 'one_file', data: 'jeejtuut' },
      { kind: 'screenshot', data: 'foobar' },
    ];

    const bundle = await Store.newBundle(newBundle, { directory: outDir });

    const validateFile = async (
      { kind, hash }: File,
      expectedData: string | Buffer
    ): Promise<void> => {
      const name = `${hash}.${kind === 'one_file' ? 'html' : 'png'}`;
      const actual = await fsp.readFile(path.join(outDir, name));
      const expected = Buffer.from(expectedData);
      expect(actual.compare(expected)).toBe(0);
    };

    expect(bundle.length).toBe(2);
    await Promise.all(
      bundle.map((file, index) => validateFile(file, newBundle[index].data))
    );
  });

  it('should be robust to writing the same file twice', async () => {
    const newBundle1: NewBundle = [
      { kind: 'one_file', data: 'jeejtuut' },
      { kind: 'screenshot', data: 'foobar' },
    ];
    const newBundle2: NewBundle = [
      { kind: 'one_file', data: 'jeejtuut' },
      { kind: 'screenshot', data: 'souce' },
    ];

    const bundle1 = await Store.newBundle(newBundle1, { directory: outDir });
    const bundle2 = await Store.newBundle(newBundle2, { directory: outDir });
    const bundle3 = await Store.newBundle(newBundle1, { directory: outDir });

    expect(bundle1[0]).toEqual(bundle2[0]);
    expect(bundle1).toEqual(bundle3);
  });
});

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
      .catch(() => {
        // this is the expected behavior
      });
  });
});
