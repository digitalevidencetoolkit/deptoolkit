type Hash = string;

export type Process = 'screenshot' | 'one_file' | 'screenshot_thumbnail';

export type File = { kind: Process; hash: Hash };

export type NewFile = { kind: Process; data: Buffer | string };

/**
 * A File's ID is its hash
 * @param a a File
 * @returns string
 */
export const id = (a: File) => a.hash;

/**
 * Generates a complete filename from a given file.
 * @returns A complete filename, with the correct extension according to the
 * file's kind.
 */
export const fileName: (f: File) => string = ({ kind, hash }) =>
  `${hash}.${kind === 'one_file' ? 'html' : 'png'}`;
