import { nanoid } from 'nanoid';

/**
 * Use Nano-ID unique string generator
 * https://github.com/ai/nanoid/
 * @returns A unique string
 */
export const uniqueID = (): string => nanoid();

/**
 * Pretty prints a JSON var
 * @returns A nicely-formatted string
 */
export const pprint = (json: {}): string => JSON.stringify(json, null, 4);
