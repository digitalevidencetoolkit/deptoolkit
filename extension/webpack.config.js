const path = require('path');
const WebpackWebExt = require('webpack-webext-plugin');

module.exports = {
  entry: {
    content_scripts: './content_scripts/archive.js',
    popup: './popup/popup.js',
  },
  output: {
    path: path.resolve(__dirname, 'addon'),
    filename: '[name]/index.js',
  },
  plugins: [
    new WebpackWebExt({
      runOnce: false,
      argv: ['lint', '-s', 'addon/'],
    }),
  ],
};
