const loadModules = require('./lib/modules-task'),
  {readJson, mergeJson, writeJson} = require('./lib/modules-each-tasks'),
  forEach = require('./lib/foreach-task'),
  {props} = require('./lib/tasks'),
  _ = require('lodash');

function listModulesTask(start) {
  return () => start(loadModules, forEach()(_.noop))
}

function whereModuleTask(start) {
  return moduleName => start(
    loadModules,
    modules => log => {
      return Promise.resolve().then(() => modules.forEach(module => {
        const dep = module.dependencies.find(dep => dep.name === moduleName);
        dep && log(`${module.name}`);
      }));
    }
  )
}

function syncModulesTask(start) {
  function modulesAndVersion(modules) {
    return modules.reduce((acc, val) => {
      acc[val.name] = `~${val.version}`;
      return acc;
    }, {})
  }

  return () => start(
    loadModules,
    props({
      modules: modules => modules,
      modulesAndVersions: modules => modulesAndVersion(modules)
    }),
    forEach(opts => opts.modules)((module, input) => {
        const {modulesAndVersions} = input;
        const readPackageJson = readJson(module)('package.json');
        const mergePackageJson = mergeJson({
          dependencies: modulesAndVersions,
          devDependencies: modulesAndVersions
        });
        const writePackageJson = writeJson(module)('package.json');

        return start(readPackageJson, mergePackageJson, writePackageJson);
      }
    )
  )
}

module.exports = {
  list: listModulesTask,
  sync: syncModulesTask,
  where: whereModuleTask
};