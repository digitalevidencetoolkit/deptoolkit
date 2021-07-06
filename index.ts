import express, { Application, Request, Response } from 'express';
import { config } from 'dotenv';
import { join } from 'path';
import cors from 'cors';
import sharp from 'sharp';
import formidable, { Fields } from 'formidable';

import * as Ledger from './src/ledger';
import * as Store from './src/store';
import * as Bundle from './src/types/Bundle';
import * as Record from './src/types/Record';

import { pprint, cleanupBase64 } from './src/helpers';

// set up .env variables as environment variables
config();

const port = 3000;
const app: Application = express();

app.use(cors());

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
  '/history/:sku',
  async (req: Request, res: Response): Promise<Response> => {
    const { sku } = req.params;
    const result = await Ledger.listDocHistory(sku);
    return res.status(200).send(pprint(result));
  }
);

app.get(
  '/list-docs',
  async (req: Request, res: Response): Promise<Response> => {
    const result = await Ledger.listDocs();
    return res.status(200).send(pprint(result));
  }
);

app.post('/form', async (req: Request, res: Response): Promise<Response> => {
  // wrap callback based formidable code in modern promises
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err: Error, fields: Fields): Promise<void> => {
      if (err) {
        resolve(res.status(400).send(`${err.name}: ${err.message}`)); // FIXME: don't expose js errors to public
      }
      const { url, title, scr } = fields;
      const base64Data = cleanupBase64(scr as string); // FIXME: don't use 'as string', instead make sure we have string instead of string[]
      const screenshotData = new Buffer(base64Data, 'base64');
      const thumbnailData = await sharp(screenshotData)
        .resize(320, 240, { fit: 'inside' })
        .toBuffer();

      const screenshot = { kind: 'screenshot' as const, data: screenshotData };
      const thumbnail = {
        kind: 'screenshot_thumbnail' as const,
        data: thumbnailData,
      };

      await Store
        // create and store a bundle from the form data
        .newBundle([screenshot, thumbnail])
        // convert this Bundle into a Record, using the rest of the form data
        .then((bundle: Bundle.Bundle) => {
          const record = {
            bundle,
            annotations: { description: '' },
            data: { url: url as string, title: title as string },
          };
          return record;
        })
        // insert this document into the ledger
        .then((r: Record.Record) => {
          return Ledger.insertDoc(r);
        })
        // if everything worked well, resolve the promise
        .then(_ => {
          console.log(`ledger inserted correctly`);
          resolve(res.status(200).send('Received POST on /form'));
        })
        // if something failed, resolve the promise with a failure message
        .catch(e => {
          resolve(
            res.status(422).send(`${e.name} (type ${e.type}): ${e.message}`)
          );
        });
    });
  });
});

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error.message}`);
}
