import { exportNamedDeclaration } from '@babel/types';
import { Buffer } from 'buffer';
import { ImportMock } from 'ts-mock-imports';
import * as Ledger from '../ledger';
import * as Record from '../types/Record';

import * as Verify from './index';

describe('verify', () => {
  const buffer = Buffer.from('foo-bar');

  afterEach(() => {
    ImportMock.restore();
  });

  it('should return null when the file could not be found on the ledger', async () => {
    ImportMock.mockFunction(Ledger, 'getDoc', Promise.resolve(null));

    const result = await Verify.verifyFile(buffer);

    expect(result).toBeNull();
  });

  it('should return the corresponding record when the file is found', async () => {
    const foundRecord: Record.Record = {
      data: {
        title: 'Async/Await - The modern Javascript tutorial',
        url: 'https://javascript.info/async-await',
      },
      annotations: {
        description: 'Learn this one weird trick',
      },
      bundle: [],
    };

    ImportMock.mockFunction(Ledger, 'getDoc', Promise.resolve(foundRecord));

    const result = await Verify.verifyFile(buffer);

    expect(result).toEqual(Record.toFrontend(foundRecord));
  });
});
