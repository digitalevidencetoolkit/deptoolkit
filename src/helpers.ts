import { nanoid } from 'nanoid';

/**
 * Use Nano-ID unique string generator
 * https://github.com/ai/nanoid/
 * @returns A unique string
 */
export const uniqueID = (): string => nanoid();
