/**
 * Pretty prints a JSON var
 * @returns A nicely-formatted string
 */
export const pprint = (json: {}): string => JSON.stringify(json, null, 4);
