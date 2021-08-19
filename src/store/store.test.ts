import { Bundle } from '../types/Bundle';
import * as Store from './index';

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
