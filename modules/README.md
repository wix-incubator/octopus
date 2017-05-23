# octopus-modules [![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/octopus-modules)

Library that exports functions thar emit/operate on npm multi-module repos.

## Install

```bash
npm install --save octopus-modules
```

## API

### modules(): [module]
Resolves all modules in a multi-npm-module npm repo with rules:
 - modules are discovered recursively;
 - modules marked as private (private: true in package.json) are traversed into and treated as aggregate modules, but not added in list;

Returns a topologically sorted array of modules with where array item is an object with properties:
 - name: module name;
 - version: module version;
 - path: absolute module path;
 - relativePath: path relative to root of repo;
 - dependencies: array of modules that this module depends on in same repo. Obects with properties:
   - name: module name;
   - path: absolute module path;
   - relativePath: path relative to root of repo;

### removeNotInPatsh(modules, paths): modules
Removes modules who does not have matching entries in `paths` array. Example is if you have list of changed files and you pass it, only modules and dependees will be left in tree.

### removeUnchanged(modules, label = 'default'): modules
Removed modules form provided list that have no changes in fs for given label.

### markBuilt(label = 'default')(module)
Marks module as built with given label.

### markUnbuilt(label = 'default')(module)
Marks module as unbuilt for given label.
