import express, { Application, Request, Response } from 'express';
import { config } from 'dotenv';
import { join } from 'path';
import cors from 'cors';
import sharp from 'sharp';
import formidable, { Fields, Files } from 'formidable';
import chalk from 'chalk';
import fs from 'fs/promises';
import { parse } from 'path';

import * as Ledger from './src/ledger';
import * as Store from './src/store';
import * as Bundle from './src/types/Bundle';
import * as Record from './src/types/Record';
import * as Verify from './src/verify';

import { pprint, cleanupBase64 } from './src/helpers';

// set up .env variables as environment variables
config();

const outDir = join(__dirname, './out');

const app: Application = express();

app.use(cors());

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/file/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  return Store.getFile(id, res);
});

app.get(
  '/history/:sku',
  async (req: Request, res: Response): Promise<Response> => {
    const { sku } = req.params;
    const result = await Ledger.listDocHistory(sku);
    console.log(chalk.bold(`GET /history/${sku}`));
    return res.status(200).send(pprint(result));
  }
);

app.get(
  '/export-copy/:sku',
  async (req: Request, res: Response): Promise<void> => {
    const { sku } = req.params;
    const rootDir = outDir;
    const options = {
      root: rootDir,
      dotfiles: 'deny',
    };
    // `sku` comes with .zip at the end, which we must remove
    const cleanSku = parse(sku).name;
    const result = await Ledger.getDoc(cleanSku, 'id');
    if (result === null) {
      res.status(404).send(`Could not find the resource you asked for: ${sku}`);
    } else {
      await Store.makeZip(result, rootDir, rootDir);
      res
        .set(`Content-Type`, `application/octet-stream`)
        .set(`Content-Disposition`, `attachment; filename=${sku}`)
        .sendFile(`${sku}`, options);
    }
  }
);

app.get(
  '/list-docs',
  async (req: Request, res: Response): Promise<Response> => {
    const result = await Ledger.listDocs();
    console.log(chalk.bold(`GET /list-docs`));
    return res.status(200).send(pprint(result));
  }
);

app.post('/form', async (req: Request, res: Response): Promise<Response> => {
  console.log(chalk.bold(`POST /form`));
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
      let onefileData: string;
      onefileData = fields.onefile as string;

      const screenshot = { kind: 'screenshot' as const, data: screenshotData };
      const thumbnail = {
        kind: 'screenshot_thumbnail' as const,
        data: thumbnailData,
      };
      const onefile = { kind: 'one_file' as const, data: onefileData };

      await Store.newBundle([screenshot, thumbnail, onefile], {
        type: 'local',
        directory: outDir,
      })
        .then((bundle: Bundle.Bundle) => {
          const record = {
            bundle,
            annotations: { description: '' },
            data: { url: url as string, title: title as string },
          };
          return record;
        })
        .then((r: Record.Record) => {
          return Ledger.insertDoc(r);
        })
        .then(_ => {
          console.log(`ledger inserted correctly`);
          resolve(res.status(200).send('Received POST on /form'));
        })
        .catch(e => {
          resolve(
            res.status(422).send(`${e.name} (type ${e.type}): ${e.message}`)
          );
        });
    });
  });
});

app.post(
  '/edit-description/:sku',
  async (req: Request, res: Response): Promise<Response> => {
    const { sku } = req.params;
    console.log(chalk.bold(`POST /edit-description/${sku}`));
    return new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err: Error, fields: Fields): Promise<void> => {
        if (err) {
          resolve(res.status(400).send(`${err.name}: ${err.message}`)); // FIXME: don't expose js errors to public
        }
        const { description } = fields;
        const update = { description: description as string };
        Ledger.updateDoc(sku, update);

        resolve(res.status(200).send(`Wrote description to ${sku}`));
      });
    });
  }
);

app.post('/verify', async (req: Request, res: Response): Promise<Response> => {
  console.log(chalk.bold(`POST /verify`));
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err: Error, fields: Fields, files: Files) => {
      // verify each file by opening it and sending it to check
      // (which involves hashing and comparing to QLDB), then building
      // the Response one file at a time and sending it once
      Promise.all(
        Object.keys(files).map(async i => {
          await fs
            // @ts-expect-error
            .readFile(files[i].path)
            .then(f => Verify.verifyFile(f))
            .then(result =>
              res.write(
                result
                  ? JSON.stringify(result)
                  : JSON.stringify({ not_found: 'item not found' })
              )
            );
        })
      ).then(() => resolve(res.send()));
    });
  });
});

export default app;
