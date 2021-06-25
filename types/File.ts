type Hash = string;

export type Process = 'screenshot' | '1file' | 'screenshot_thumbnail';

export type File = { kind: Process; hash: Hash };

export type newFile = { kind: Process; data: Buffer };

/**
 * A File's ID is its hash
 * @param a a File
 * @returns string
 */
export const id = (a: File) => a.hash;
