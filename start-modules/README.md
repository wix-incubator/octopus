# octopus-start-modules

# install

```bash
npm install --save-dev octopus-start-modules
```

# Usage

```js
const {modules, forEach} = require('octopus-start-modules-tasks');
const {readPackageJson} = require('octopus-start-tasks');


module.exports['modules:list'] = () => start(
  modules(),
  forEach()(log => module => log(`${module.name} (${module.path})`))
);

module.exports['modules:sync'] = () => start(
  modules(),
  props({
    modules: modules => modules,    
    modulesAndVersion: modules => reduce((module, acc) => acc[module.name] = module.version)({})
  }),
  forEach(opts => opts.modules)((module, {modules, modulesAndVersions}) => start(
    readJson('package.json'),
    mergeJson({dependencies: modulesAndVersions, devDependencies: modulesAndVersions}),
    writeJson('package.json')
    )    
  )
)
```