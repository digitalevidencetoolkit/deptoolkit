import express, { Application, Request, Response } from 'express';
import { config } from 'dotenv';
import sdk from 'aws-sdk';
import { uniqueID } from './src/helpers';
const { QLDB } = sdk;

import { DOC_TABLE_NAME } from './src/qldb-Constants.js';
import { listLedgers } from './src/qldb-ListLedgers';
import { insertDocuments } from './src/qldb-InsertDocument';

import { RecordSchema } from './src/schemas';

// set up .env variables as environment variables
config();

const port = 3000;
const app: Application = express();

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World!',
  });
});

app.get(
  '/list-ledgers',
  async (req: Request, res: Response): Promise<Response> => {
    const qldbClient = new QLDB();
    const result = await listLedgers(qldbClient);
    return res.status(200).send(result);
  }
);

app.post(
  '/insert-doc',
  async (req: Request, res: Response): Promise<Response> => {
    const payload: { title: string; url: string } = req.body;
    const document = { sku: uniqueID(), ...payload };
    return RecordSchema.validate(document, { strict: true, stripUnknown: true })
      .then(() => {
        const result = insertDocuments(DOC_TABLE_NAME, document);
        return res.status(200).send(result);
      })
      .catch(e =>
        res.status(422).send(`${e.name} (type ${e.type}): ${e.message}`)
      );
  }
);

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error.message}`);
}
