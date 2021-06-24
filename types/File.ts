type Hash = string;

export type Process = 'screenshot' | '1file' | 'screenshot_thumbnail';

export type File = { typ: Process; hash: Hash };

export type newFile = { typ: Process; data: Buffer };

/**
 * A File's ID is its hash
 * @param a a File
 * @returns string
 */
export const id = (a: File) => a.hash;
