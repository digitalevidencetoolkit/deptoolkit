import * as File from './File';

describe('id', () => {
  it('should return the file hash', () => {
    const hash = 'I should have been a pair of ragged claws';
    expect(File.id({ kind: 'one_file', hash })).toBe(hash);
  });
});

describe('fileName', () => {
  it('should generate the file name by adding the correct extention to the hash', () => {
    const cases: Array<File.File & { expected: string }> = [
      { hash: 'The gate is straight', kind: 'one_file', expected: 'html' },
      { hash: 'Deep and wide', kind: 'screenshot', expected: 'png' },
      {
        hash: 'Break on through to the other side',
        kind: 'screenshot_thumbnail',
        expected: 'png',
      },
    ];

    cases.forEach(c => {
      expect(File.fileName(c)).toBe(`${c.hash}.${c.expected}`);
    });
  });
});
