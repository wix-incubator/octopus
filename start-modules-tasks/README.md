# octopus-start-modules-tasks [![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/octopus-start-modules-tasks)

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

### modules.removeUnchanged(label = 'default')
Removes modules from list returned ex. by `modules.load()` that were not changed after last `module.markBuilt`.

Parameters:
 - label - custom label where you can have several groups of built/unbuilt modules and have built/unbuilt for separate tasks/groups of tasks.

### modules.removeGitUnchanged(refspec)
Removes modules from list returned ex. by `modules.load()` that do not have changes when compared to `refspec` - branch or such.  

### modules.removeExtraneousDependencies()
Removes dependencies in modules that are left after `removeUnchanged` or `removeGitUnchanged`. In some cases you might want for dependencies to stay (npm links) and in others you want them to be removed.  

### module.markBuilt(module, label = 'default')
Marks module as built.

Parameters:
 - label - custom label where you can have several groups of built/unbuilt modules and have built/unbuilt for separate tasks/groups of tasks.

### module.markUnbuilt(module, label = 'default')
Marks module as unbuilt.

Parameters:
 - label - custom label where you can have several groups of built/unbuilt modules and have built/unbuilt for separate tasks/groups of tasks.

### iter.forEach(opts)((module, input, reporter) => Promise)
`Start` tasks that allows to iterate over result of `modules.list`.

Supports options:
 - mapInput, defaults to input => input: function that, given input other than array of modules - ex. object that contains modules, actually maps it to array of modules;
 - silent, defaults to false: should task print iteration info.

Tasks returns provided input.

### iter.async(opts)((module, input, reporter) => Promise)
`Start` tasks that allows to iterate over result of asynchronously `modules.load`.

Supports options:
 - mapInput, defaults to input => input: function that, given input other than array of modules - ex. object that contains modules, actually maps it to array of modules;
 - silent, defaults to false: should task print iteration info;
 - threads, defaults to 4: number of parallel threads.

Tasks returns provided input. 

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