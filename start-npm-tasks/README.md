# octopus-start-npm-tasks [![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/octopus-start-npm-tasks)

Task for executing npm commands for modules.

## install

```bash
npm install --save-dev octopus-start-npm-tasks
```

## Usage

```js
const Start = require('start').default,
{modules, iter} = require('octopus-start-modules-tasks'),
  npmTasks = require('octopus-start-npm-tasks');

const start = new Start();

module.exports.test = () => Start(
  modules.load(), 
  iter.forEach()(module => npmTasks.run(module)('test')));
```

## API

### run(module)(script)
Runs arbitrary npm script defined in `package.json`. If script is missing, it will not fail. Useful for project where some modules have defined script and some do not.

Parameters:
 - module - module as returned from `iter`, `async` tasks.
 - script - npm script name.