# octopus-start-reporter [![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/octopus-start-reporter)

Reporter intended to be used withing `octopus` ecosystem. Differences from other `start` reporters:
  - supports debug output;
  - does not log `start`/`stop` and `done` actions to reduce verbosity. 

## install

```bash
npm install --save-dev octopus-start-reporter
```

## Usage

```js
const Start = require('start').default,
    reporter = require('octopus-start-reporter');

const start = Start(reporter());
```