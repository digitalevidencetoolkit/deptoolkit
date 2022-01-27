/**
 * shorten a string to a desired length
 * @param str a string, ideally too long to your taste
 * @param desiredLength a number, the length to which to cut the string
 **/
export const shortenStringToLength = (
  str: string,
  desiredLength: number
): string => str.substring(0, desiredLength - 1);

/**
 * from https://stackoverflow.com/questions/34818020/javascript-regex-url-extract-domain-only/34818545
 * @param url a string representing a URL
 * @return the TLD
 **/
export const domainFromUrl = (url: string): string => {
  let result: string;
  let match: Array<string>;
  if (
    (match = url.match(
      /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im
    ))
  ) {
    result = match[1];
    if ((match = result.match(/^[^\.]+\.(.+\..+)$/))) {
      result = match[1];
    }
  }
  return result;
};

/**
 * shorten a sha256 string
 * @param h string, sha256
 **/
export const shortHash = (h: string): string => h.substr(0, 6);

export const putFileinFormData = (f: File): Promise<FormData> => {
  return new Promise(resolve => {
    const form = new FormData();
    form.append(f.name, f, f.name);
    resolve(form);
  });
};

export const wait = (n: number) =>
  new Promise(resolve => setTimeout(resolve, n));
