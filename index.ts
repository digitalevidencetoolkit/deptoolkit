import express, { Application, Request, Response } from 'express';
import { config } from 'dotenv';
import { join } from 'path';
import cors from 'cors';
import sharp from 'sharp';
import formidable, { Fields } from 'formidable';

import * as Ledger from './src/ledger';
import * as Store from './src/store';

import { pprint } from './src/helpers';

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
  const form = new formidable.IncomingForm();

  form.parse(req, async (err: any, fields: Fields): Promise<void> => {
    let base64Data: string;
    let onefileData: string;
    //@ts-expect-error
    base64Data = fields.scr.replace(/^data:image\/png;base64,/, '');
    base64Data += base64Data.replace('+', ' ');
    const screenshotData = new Buffer(base64Data, 'base64');
    const thumbnailData = await sharp(screenshotData)
      .resize(320, 240, { fit: 'inside' })
      .toBuffer();
    onefileData = fields.onefile as string;

    const { url, title } = fields;
    const screenshot = { kind: 'screenshot' as const, data: screenshotData };
    const thumbnail = {
      kind: 'screenshot_thumbnail' as const,
      data: thumbnailData,
    };
    const onefile = { kind: 'one_file' as const, data: onefileData };
    Store.newBundle([screenshot, thumbnail, onefile]).then(b => {
      const document = {
        bundle: b,
        annotations: { description: '' },
        data: { url: url as string, title: title as string },
      };
      Ledger.insertDoc(document);
      //   .catch(e =>
      //     res.status(422).send(`${e.name} (type ${e.type}): ${e.message}`)
      //   );
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
