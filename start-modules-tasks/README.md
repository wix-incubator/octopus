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

### modules.removeUnchanged()
Removes modules from list returned ex. by `modules.load()` that were not changed after last `module.markBuilt`.  

### module.markBuilt(module)
Marks module as built.

### module.markUnbuilt(module)
Marks module as unbuilt.

### iter.forEach(opts)((module, input, reporter) => Promise)
`Start` tasks that allows to iterate over result of `modules.list`.

Supports options:
 - mapInput, defaults to input => input: function that, given input other than array of modules - ex. object that contains modules, actually maps it to array of modules;
 - silent, defaults to false: should task print iteration info.

### iter.async(opts)((module, input, reporter) => Promise)
`Start` tasks that allows to iterate over result of asynchronously `modules.load`.

Supports options:
 - mapInput, defaults to input => input: function that, given input other than array of modules - ex. object that contains modules, actually maps it to array of modules;
 - silent, defaults to false: should task print iteration info;
 - threads, defaults to 4: number of parallel threads.

### modules.module.readJson(module)(fileName)
`Start` tasks that reads json file in cwd of provided module. Returns json object;

### modules.module.mergeJson(cb)(overrides)
`Start` tasks that deep overrides properties of object in input with ones defined in overrides. Calls `cb` on override event with object:
  - key;
  - currentValue;
  - newValue.

Returns merged json;

### modules.module.writeJson(module)(fileName)
`Start` tasks that writes input json to cwd of provided module. Returns json object;