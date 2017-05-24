# octopus [![Build Status](https://img.shields.io/travis/wix/octopus/master.svg?label=build%20status)](https://travis-ci.org/wix/octopus)

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC) -->
- [Core modules](#core-modules)
- [Presets](#presets)
- [Example usage](#example-usage)
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

Octopus is a set of modules for [start](https://github.com/start-runner/start) but to manage a multi-module npm project with traits:
 - tasks to recursively discover/load npm modules;
 - have means for incremental task running - run tests for all, change 1 module, run tests for just one changed module and its dependees;
 - presets for managing versions across multiple modules, sync module versions;
 - generic tasks that you compose and achieve basically anything.

## Core modules

 - [octopus-modules](modules) - exports functions for finding modules, filtering, etc.
 - [octopus-start-modules](start-modules) - npm module management: syncing versions, listing, showing where one of modules is used in repo;
 - [octopus-start-modules-tasks](start-modules-tasks) - `start` tasks around [modules](modules) and extras;
 - [octopus-start-reporter](start-reporter) - custom `start` reporter to be used within `octopus ecosystem`;
 - [octopus-start-tasks](start-tasks) - misc useful `start` tasks;
 - [octopus-test-utils](test-utils) - helpers for testing multi-module npm project scenarios. 
 - [octopus-start-git](startgit) - miscelneous tasks for git-based operations. 

## Presets

 - [octopus-start-preset-prepush](start-preset-prepush) - `start` task that allows to add git prepush hook with custom logic composable from `start` tasks.
 - [octopus-start-preset-dependencies](start-preset-dependencies) - manage dependencies across multiple modules;
 - [octopus-start-preset-modules](start-preset-modules) - manage module versions across monorepo;
 - [octopus-start-preset-idea](start-preset-idea) - generate multi-module IntelliJ Idea project with run-tasks for mocha, etc.; 
 - [octopus-start-preset-depcheck](start-preset-depcheck) - preset for running [depcheck](https://github.com/depcheck/depcheck) across multiple modules.

## Example usage

Octopus does literally eats it's own dogfood and [octopus](.) repo is managed with start task-runner and octopus tasks including:
 - using git [prepush](start-preset-prepush#usage) hook to:
   - unify versions of dependencies across all modules via [sync present](start-preset-dependencies#sync);
   - unify versions of modules across all modules via [sync present](start-preset-modules#sync);
   - check for extraneous managed dependencies via [extraneous preset](start-preset-dependencies#extraneous);
   - check for unmanaged dependencies via [unmanaged preset](start-preset-dependencies#unmanaged);
   - enrich readme via [markdown-magic](https://www.npmjs.com/package/markdown-magic);
 - [incrementally](start-modules-tasks#modulesremoveunchangedlabel--default) npm install and link modules in repo (see `module.exports.bootstrap` in `tasks.js` below);
 - [incrementally](start-modules-tasks#modulesremoveunchangedlabel--default) run tests for modules in repo (see `module.exports.test` in `tasks.js` below);
 - clean all modules in repo (see `module.exports.clean` in `tasks.js` below);
 - release/publish new versions of changed modules (see `module.exports.release` in `tasks.js` below);
 - add custom tasks for what you need (ee `module.exports.docs` in `tasks` below).
 
Sample `tasks.js` file as prescribed by [start](https://github.com/start-runner/start#tasks-file):
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=tasks.js) -->
<!-- The below code snippet is automatically added from tasks.js -->
```js
const Start = require('start').default,
  reporter = require('octopus-start-reporter'),
  modules = require('octopus-start-preset-modules'),
  dependencies = require('octopus-start-preset-dependencies'),
  startTasks = require('octopus-start-tasks'),
  startModulesTasks = require('octopus-start-modules-tasks'),
  prepush = require('octopus-start-preset-prepush'),
  idea = require('octopus-start-preset-idea'),
  depcheck = require('octopus-start-preset-depcheck'),
  markdownMagic = require('markdown-magic');

const start = Start(reporter());

module.exports['modules:list'] = () => start(modules.list());
module.exports['modules:where'] = moduleName => start(modules.where(moduleName));
module.exports['modules:sync'] = () => start(modules.sync());
module.exports['deps:sync'] = () => start(dependencies.sync());
module.exports['deps:unmanaged'] = () => start(dependencies.unmanaged());
module.exports['deps:extraneous'] = () => start(dependencies.extraneous());
module.exports['deps:latest'] = () => start(dependencies.latest());
module.exports['idea'] = () => start(idea());
module.exports['init'] = () => start(prepush());
module.exports['depcheck'] = () => start(depcheck({ignoreMatches: ['start-simple-cli']}));

module.exports.sync = () => start(
  modules.sync(),
  dependencies.sync(),
  dependencies.unmanaged(),
  dependencies.extraneous(),
  module.exports.docs
)

module.exports.bootstrap = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged('bootstrap'),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startTasks.ifTrue(module.dependencies.length > 0)(() =>
      Start(asyncReporter)(startModulesTasks.module.exec(module)(`npm link ${module.dependencies.map(item => item.name).join(' ')}`))
    ),
    startModulesTasks.module.exec(module)('npm install --cache-min 3600 && npm link'),
    startModulesTasks.module.markBuilt(module, 'bootstrap')
  ))
)

module.exports.test = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged('test'),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.exec(module)('npm run test'),
    startModulesTasks.module.markBuilt(module, 'test')
  ))
)

module.exports.clean = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.exec(module)('rm -rf node_modules && rm -rf target && rm -f npm-shrinkwarp.json && rm -f yarn.lock && npm-debug.log*')
    )
  )
)

module.exports.release = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.exec(module)('npm run release'),
    startModulesTasks.module.exec(module)('npm publish || true')
  ))
)

module.exports.docs = () => start(() => {
  return function generateDocs(log /*, reporter*/) {
    return Promise.resolve().then(() => {
      markdownMagic('./*.md');
    })
  }
});
```
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=tasks.js) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

And `package.json` that contains needed dependencies and npm scripts, of which:
 - postinstall - installs git [prepush](start-preset-prepush#usage) hook to execute `sync` export before pushing to remote;
 - start - to be able to execute any tasks defined in `tasks.js` like:
 
```bash
npm start bootstrap
```

That's it - for available tasks explore repo, see examples. Or open issues/pull requests. Enjoy!