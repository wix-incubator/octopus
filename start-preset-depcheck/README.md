# octopus-start-preset-depcheck

Task for executing [depcheck](https://github.com/depcheck/depcheck) for all modules in project.

## install

```bash
npm install --save-dev octopus-start-preset-depcheck
```

## Usage

```js
const depcheck = require('octopus-start-preset-depcheck'),
  Start = require('start').default;

const start = new Start();

module.exports.depCheck = start(depcheck({ignoreMatches: ['mocha']}));
```

## API

### (opts)
Task for executing [depcheck](https://github.com/depcheck/depcheck) for all modules in project.

Parameters:
 - opts - pass-through to `depcheck`.