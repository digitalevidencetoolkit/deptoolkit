# Digital Evidence Toolkit QLDB API

# Install and development

## Docker

```sh
$ docker-compose up
```

This will start a REST API on port 3000 which includes the logic for interacting with the ledger, as well as a single-page web app on port 5000 which consumes data from the API and represents it visually.

## Node 

To run everything without docker, you must install the necessary packages in `gui` and in this app.

To do this, run:

``` sh
npm i
cd gui
npm i
```

Then, the command `npm run all` should start all of the necessary modules.

## Usage

Deliver data to the ledger with the [Digital Evidence Toolkit Firefox extension](https://github.com/digitalevidencetoolkit/firefox-extension).

