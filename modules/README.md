# octopus-modules

Library that exports functions thar emit/operate on npm multi-module repos.

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
   - version: module version;
   - path: absolute module path;
   - relativePath: path relative to root of repo;

### removeUnchanged(modules): modules
Removed modules form provided list that have no changes in fs.

### markBuilt(module)
Marks module as built.

### markUnbuilt(module)
Marks module as built.