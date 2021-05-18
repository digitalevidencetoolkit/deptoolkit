import express, { Application, Request, Response } from 'express';
import { config } from 'dotenv';
import sdk from 'aws-sdk';
const { QLDB } = sdk;

import { listLedgers } from './src/qldb-ListLedgers';

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

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error.message}`);
}
