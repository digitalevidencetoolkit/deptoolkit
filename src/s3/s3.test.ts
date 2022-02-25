// good test suite from AWS:
// https://github.com/aws/aws-sdk-js-v3/blob/main/clients/client-s3/test/e2e/S3.ispec.ts

import * as S3 from './index';
import { PassThrough } from 'stream';

describe('S3 client', () => {
  it('should find a known object', async () => {
    const key =
      'a8eab0456eb979653a3c1ca77c37239100ef7300c9026db868ad9dc57f5aa580.png';
    expect(S3.getFileByKey(key)).toBeInstanceOf(PassThrough);
  });
  it('should error on an unknown object', async () => {
    const key = 'foo.png';
    const r = S3.getFileByKey(key);
    r.on('error', e => expect(e).toBeInstanceOf(Error));
  });
});
