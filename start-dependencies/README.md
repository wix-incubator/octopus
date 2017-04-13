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

module.exports['deps:sync'] = start(sync());
```

## API

### sync()
`Start` task that syncs dependency versions (dependencies, devDependencies, peerDependencies) with those defined in root `package.json` as `managed*Dependencies`.

Say you have `package.json` in root of your project like:

```json
{
  "managedDependencies": {
    "lodash": "~1.0.0"
  }
}
```

upon invocation of this task for all submodules that have `lodash` defined in `dependencies` or `devDependencies` version of `lodash` will be updated to `~1.0.0`.