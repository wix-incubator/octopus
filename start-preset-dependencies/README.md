# octopus-start-preset-dependencies [![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/octopus-start-preset-dependencies)

## install

```bash
npm install --save-dev octopus-start-preset-dependencies
```

## Usage

```js
const {sync} = require('octopus-start-preset-dependencies'),
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

### unmanaged()
List dependencies, that are present in modules `dependencies`, `devDependencies`, `peerDependencies`, but not defined in root `package.json` as `managed*Dependencies`.

### extraneous()
List dependencies, that are present in root `package.json` as `managed*Dependencies`, but not defined in modules `dependencies`, `devDependencies`, `peerDependencies`.

### latest()
List dependencies, that are present in root `package.json` as `managed*Dependencies` and needs updating based on latest version published in npmjs.org.
