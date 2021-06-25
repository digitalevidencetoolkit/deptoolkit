import express, { Application, Request, Response } from 'express';
import { config } from 'dotenv';
import { join } from 'path';
import * as Ledger from './ledger';
import sdk from 'aws-sdk';
import sharp, { Sharp } from 'sharp';
import {
  pprint,
  writeScreenshot,
  makeThumbnail,
  hashFromFile,
} from './src/helpers';
import formidable, { Fields } from 'formidable';
import * as Record from './types/Record';
import * as Store from './src/store';
const { QLDB } = sdk;

import { DOC_TABLE_NAME, LEDGER_NAME } from './src/qldb-Constants';
import { listLedgers } from './src/qldb-ListLedgers';
// import { insertDocuments } from './src/qldb-InsertDocument';
import { listDocuments } from './src/qldb-ListDocuments';

// import { RecordSchema } from './src/schemas';

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

app.get('/file/:sku', async (req: Request, res: Response): Promise<void> => {
  const { sku } = req.params;
  const options = {
    root: join(__dirname, './out'),
    dotfiles: 'deny',
  };
  res.sendFile(`${sku}`, options);
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
    return res.status(200).send(
      pprint(
        result
          .getResultList()
          .map(e => Record.fromLedger(e))
          .map(e => Record.toFrontend(e))
      )
    );
  }
);

app.post('/form', async (req: Request, res: Response): Promise<Response> => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err: any, fields: Fields): Promise<void> => {
    let base64Data: string;
    //@ts-expect-error
    base64Data = fields.scr.replace(/^data:image\/png;base64,/, '');
    base64Data += base64Data.replace('+', ' ');
    const screenshotData = new Buffer(base64Data, 'base64');
    const thumbnailData = await sharp(screenshotData)
      .resize(320, 240, { fit: 'inside' })
      .toBuffer();

    const { url, title } = fields;
    const file = { typ: 'screenshot' as const, data: screenshotData };
    const thumbnail = {
      typ: 'screenshot_thumbnail' as const,
      data: thumbnailData,
    };
    Store.newBundle([file, thumbnail]).then(b => {
      const document = {
        bundle: b,
        annotations: { description: '' },
        data: { url: url as string, title: title as string },
      };
      //   .catch(e =>
      //     res.status(422).send(`${e.name} (type ${e.type}): ${e.message}`)
      //   );
      Ledger.insert(document);
    });

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
