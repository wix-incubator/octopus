# octopus-start-modules-tasks

## install

```bash
npm install --save-dev octopus-start-modules-tasks
```

## Usage

```js
const {modules, iter} = require('octopus-start-modules-tasks'),
  Start = require('start');

const start = new Start();

//will list and print all tasks
module.exports.listAll = () => Start(modules.load(), iter.forEach()(() => {}));
```

## API

### modules.load()
Wraps `octopus-modules`(../modules#modules) as a `Start` task.  
 
### iter.forEach(opts)((module, input, reporter) => Promise)
`Start` tasks that allows to iterate over result of `modules.list`.

Supports options:
 - mapInput, defaults to input => input: function that, given input other than array of modules - ex. object that contains modules, actually maps it to array of modules;
 - silent, defaults to false: should task print iteration info.
