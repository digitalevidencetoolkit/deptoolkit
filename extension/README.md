# Digital Evidence Toolkit Firefox extension

Browser extension used to trigger the archiving of a webpage, according to the (coming) Digital Evidence Toolkit's standard.

## Install
```sh
$ npm install 
$ npm run watch
```

Then open `http://about:debugging` in Firefox and pick `manifest.json`.

The Webpack task bundles dependencies and moves `popup/popup.js` and `content_scripts/archive.js` into their proper place in `addon/`.

Your changes will automatically reload.

## Usage
Use while the [Digital Evidence Toolkit API](https://github.com/digitalevidencetoolkit/deptoolkit-node-api) is running in parallel.
