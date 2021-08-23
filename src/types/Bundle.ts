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
export type NewBundle = Array<File.NewFile>;

/**
 * Ensure the bundle (a list of files) is _always_ sorted
 * the same way to preserve identity.
 * @param b a Bundle
 * @returns a Bundle, sorted alphabetically by its ID
 */
const sortedBundle = (b: Bundle): Bundle => {
  const sortedArray = [...b].sort((a, b) =>
    File.id(a).localeCompare(File.id(b))
  );
  return sortedArray;
};

/**
 * A bundle's ID is the sum of its composing parts' IDs (or hashes)
 * @param b a Bundle
 * @returns a string
 */
// @TODO: confirm this is accurate
export const id = (b: Bundle): string =>
  makeHash(sortedBundle(b).map(File.id).join(''));
