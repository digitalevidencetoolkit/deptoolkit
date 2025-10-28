### Getting started

If the instructions in this guide feel a bit much, it's likely because the Toolkit is still an alpha-version software which assumes a certain technical knowledge. There are technical solutions to simplifying this setup, but these were not prioritised.

<aside>
🙏 If this is something you have expertise with and are happy to help, do reach out at **basile@digitalevidencetoolkit.org**

</aside>

---

#### Setting up the ledger

> **⚠️ AWS QLDB DEPRECATION WARNING**: AWS QLDB is being discontinued on **July 31, 2025**. While you can still create QLDB ledgers for testing/development purposes, this toolkit will require migration to an alternative solution before that date. **Production use is not recommended.**

The Toolkit requires a working connection with Amazon Web Services, and thus that you have some kind of well-permissioned account or IAM role.

In short, you will need:

1. the AWS CLI and an authorised profile in `~/.aws/credentials` (see [“Installing the AWS CLI v2”](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) - _docs.aws.amazon.com)_
2. an existing QLDB ledger, with a blank table in it (see [“Creating a QLDB ledger from the AWS Console”](https://qldbguide.com/docs/guide/getting-started/#using-aws-console) - _qldbguide.com_)

Not required but recommended is an S3 bucket in which to store Toolkit data.

**Remember the names** of the ledger and of its table. You'll need them shortly (see "Environment" below).

---

#### Environment

After cloning the repository, create an `.env` file at the root or copy `.env.example`. The job of this file is to contain variables you really don't want to share publicly, so keep this out of version control software.

This file **must contain:**

- AWS access credentials and preferred region
- Details about the ledger and S3 bucket

```bash
AWS_ACCESS_KEY_ID="your aws access key"
AWS_SECRET_ACCESS_KEY="your aws secret key"
AWS_REGION="eu-central-1 (or another region)"
BUCKET_NAME="anS3BucketName"
LEDGER_NAME="yourLedgerName"
DOC_TABLE_NAME="yourTableName"
```

---

#### Recommended way of running the Toolkit

<aside>
💡 At the very least, **you will need Docker installed on your system.** 
</aside>

The Docker Compose orchestration is composed of several services:

1. An Express/TypeScript API
2. A plain JS browser extension
3. And a frontend

To start the whole app:

```bash
$ docker-compose up
```

---

#### Running without Docker

Ensure you're running `node > 10.0` — the recommended version is the LTS, i.e. `node v16`. If you are using `nvm`:

```bash
$ nvm use --lts
> Now using node v16.13.0
```

Manually install dependencies for each service:

```bash
$ cd ui/ & npm install
$ cd extension/ & npm install
$ npm install
```

Then use the npm script including all services:

```bash
$ npm run all
```

---

#### Storage options

By including a bucket in the `.env` config, you’re choosing to replicate your archival on S3.

Namely, the Store (`src/store/index.ts`) will:

- upon receiving an archive request, store the Bundle files both locally and on S3,
- and upon receiving a file request (e.g. the UI fetching thumbnails), serve it from S3.

---

#### Is there anybody out there?

##### API and frontend

The API should be available at `http://localhost:3000` — assert this by running:

```bash
$ curl http://localhost:3000/list-docs
> [ {...}, {...} ]
```

The UI should be available at `http://localhost:8000` in your web browser of choice. API requests are proxied through the UI. Thus, the following queries are equivalent:

```bash
$ curl http://localhost:3000/list-docs        // as before
$ curl http://localhost:8000/api/list-docs
```

##### Browser extension

The extension should be being bundled on your filesystem. Pop open your browser's extension runtime by pasting this in the URL bar:

`about:debugging#/runtime/this-firefox`

Click _“Load temporary Add-on...”_ and navigate to `extension/addon` to select `manifest.json`.

The extension should have been loaded in your extension bar, as shown below:

![Untitled](/images/dept-untitled.png)
