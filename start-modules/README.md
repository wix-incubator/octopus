# octopus-start-modules

## install

```bash
npm install --save-dev octopus-start-modules
```

## Usage

```js
const {sync, where, list} = require('octopus-start-modules'),
  Start = require('start');

const start = new Start();

module.exports['modules:sync'] = sync(start);
module.exports['modules:where'] = where(start);
module.exports['modules:list'] = list(start);
```

## API

### sync(start): () => start(...)
Returns a function that you can bind to `exports` and that will sync modules across multi-module repo. Syncing modules means:
 - if you have module `a` with version `1.0.0` and another module `b` depends on it, but depends on different version (ex. `~1.0.1`), then modules `b` dependencies will be updated to match that of module `a` declared version.
 
### list(start): () => start(...)
Returns a function that you can bind to `exports` and that will simply print discovered modules.

### where(start): (moduleName) => start(...)
Returns a function that you can bind to `exports` and that will simply print discovered modules.
