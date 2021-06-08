import express, { Application, Request, Response } from 'express';
import * as fs from 'fs';
import { config } from 'dotenv';
import sdk from 'aws-sdk';
import { pprint } from './src/helpers';
import formidable, { Fields } from 'formidable';
const { QLDB } = sdk;

import { DOC_TABLE_NAME } from './src/qldb-Constants';
import { listLedgers } from './src/qldb-ListLedgers';
import { insertDocuments } from './src/qldb-InsertDocument';
import { listDocuments } from './src/qldb-ListDocuments';

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
    return res.status(200).send(pprint(result));
  }
);

app.get(
  '/list-docs',
  async (req: Request, res: Response): Promise<Response> => {
    const result = await listDocuments(DOC_TABLE_NAME);
    return res.status(200).send(pprint(result));
  }
);

app.post('/form', async (req: Request, res: Response): Promise<Response> => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err: any, fields: Fields): void => {
    // screenshot part
    let base64Data: string;
    //@ts-expect-error
    base64Data = fields.scr.replace(/^data:image\/png;base64,/, '');
    base64Data += base64Data.replace('+', ' ');
    fs.writeFile(`out/${fields.sku_id}.png`, base64Data, 'base64', err => {
      if (err) console.log(err);
    });

    // write-to-ledger part
    const document = {
      url: fields.url,
      title: fields.title,
      sku: fields.sku_id,
    };
    RecordSchema.validate(document, { strict: true, stripUnknown: true })
      .then(() => insertDocuments(DOC_TABLE_NAME, document))
      .catch(e =>
        res.status(422).send(`${e.name} (type ${e.type}): ${e.message}`)
      );

    if (err) {
      console.log(err);
    }
  });
  return res.status(200).send('Received POST on /form');
});

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error.message}`);
}
