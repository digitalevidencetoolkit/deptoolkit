import { makeHash } from '../helpers';
import * as File from './File';

/**
 * A bundle is a list of files, which belong to a discrete
 * number of "kinds": screenshots, thumbnails, one-file downloads...
 */
export type Bundle = File.File[];

/**
 * list of File-like things with base64-encoded strings,
 * that should be stored but haven't been yet
 */
export type newBundle = Array<File.newFile>;

/**
 * A bundle's ID is the sum of its composing parts' IDs (or hashes)
 * @param b a Bundle
 * @returns a string
 */
// @TODO: confirm this is accurate
export const id = (b: Bundle): string => makeHash(b.map(File.id).join(''));
