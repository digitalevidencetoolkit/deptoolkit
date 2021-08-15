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
