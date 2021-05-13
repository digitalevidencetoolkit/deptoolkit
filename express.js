import { config } from 'dotenv';
// import fetch from 'node-fetch';
import express, { json } from 'express';
import cors from 'cors';
import sdk from 'aws-sdk';
const { QLDB } = sdk;

import { listLedgers } from './src/qldb-ListLedgers.js';

// set up .env variables as environment variables
config();

const port = 3000;
const app = express();
app.use(cors());
app.use(json());
app.listen(port, () => console.log(`Listening on port ${port}`));

app.post('/', async function (req, res) {
  const body = JSON.stringify(req.body);
  body
    ? res.send(body)
    : res.status(400).send({ error: `Failure – http code ${res.status}` });
});

app.get('/list-ledgers', async function (req, res) {
  const qldbClient = new QLDB();
  const result = await listLedgers(qldbClient);
  res.send(result);
});
