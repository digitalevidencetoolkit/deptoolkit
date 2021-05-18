import express, { Application, Request, Response } from 'express';
import {
  QldbDriver,
  Result,
  TransactionExecutor,
} from 'amazon-qldb-driver-nodejs';
import { config } from 'dotenv';
import sdk from 'aws-sdk';
const { QLDB } = sdk;

import { DOC_TABLE_NAME } from './src/qldb-Constants.js';
import { listLedgers } from './src/qldb-ListLedgers';
import { insertDocuments } from './src/qldb-InsertDocument';

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
    const payload = req.body;
    if (payload.sku && payload.url && payload.title) {
      const result = await insertDocuments(DOC_TABLE_NAME, payload);
      return res.status(200).send(result);
    } else {
      return res.status(400).send({ message: 'Forbidden operation' });
    }
  }
);

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error.message}`);
}
