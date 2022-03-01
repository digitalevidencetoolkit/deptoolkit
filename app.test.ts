import supertest from 'supertest';
import { ImportMock } from 'ts-mock-imports';

import { pprint } from './src/helpers';
import * as Ledger from './src/ledger';

import app from './app';

// TODO
// - isolate test env (pass outDir as a param to app, create a specific outDir
//   for test)
// - test that an existing file is returned
// - test that an existing dotFile is not returned
describe('The file endpoint', () => {
  it('should 404 if the file doesnt exist.', () => {
    return supertest(app)
      .get('/file/foo?source=local')
      .then(response => {
        expect(response.status).toBe(404);
      });
  });

  it('should 200 with the file if it exists', () => {
    // create a file in the test dir
    // ask for it
    // file is returned
  });

  it('should not return an existing dot file', () => {
    // create a dot file in the test dir
    // ask for it
    // file is not returned
  });
});

describe('The history endpoint', () => {
  afterEach(() => {
    ImportMock.restore();
  });

  it("should use the ledger's history API", () => {
    const result = { foo: 'bar' };

    const getListHistoryMock = ImportMock.mockFunction(
      Ledger,
      'listDocHistory',
      Promise.resolve(result)
    );

    const name = 'foo';

    return supertest(app)
      .get(`/history/${name}`)
      .then(response => {
        expect(getListHistoryMock.calledOnce).toBe(true);
        expect(getListHistoryMock.calledWith(name)).toBe(true);

        expect(response.status).toBe(200);
        expect(response.text).toBe(pprint(result));
      });
  });
});

describe('The export-copy endpoint', () => {});
