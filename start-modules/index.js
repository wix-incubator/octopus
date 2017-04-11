const {iter, modules} = require('octopus-start-modules-tasks'),
  {readJson, mergeJson, writeJson} = require('./lib/modules-each-tasks'),
  {props} = require('./lib/tasks'),
  _ = require('lodash'),
  Start = require('start').default;

function listModulesTask() {
  return () => function listModules(log, reporter) {
    return Start(reporter)(modules.load(), iter.forEach()(_.noop));
  }
}

function whereModuleTask(moduleName) {
  return () => function whereModule(log, reporter) {
    return Start(reporter)(
      modules.load(),
      modules => log => {
        return Promise.resolve().then(() => modules.forEach(module => {
          const dep = module.dependencies.find(dep => dep.name === moduleName);
          dep && log(`${module.name} (${module.relativePath}) (${module.version})`);
        }));
      }
    )
  }
}

function syncModulesTask(mutateVersion = version => `~${version}`) {
  return () => function syncModules(log, reporter) {
    return Start(reporter)(
      modules.load(),
      props({
        modules: modules => modules,
        modulesAndVersions: modules => modulesAndVersion(modules, mutateVersion)
      }),
      iter.forEach({mapInput: opts => opts.modules})((module, input) => {
          const {modulesAndVersions} = input;
          const readPackageJson = readJson(module)('package.json');
          const mergePackageJson = mergeJson({
            dependencies: modulesAndVersions,
            devDependencies: modulesAndVersions
          });
          const writePackageJson = writeJson(module)('package.json');

          return Start(reporter)(readPackageJson, mergePackageJson, writePackageJson);
        }
      )
    )
  }
}

function modulesAndVersion(modules, mutateVersion) {
  return modules.reduce((acc, val) => {
    acc[val.name] = mutateVersion(val.version);
    return acc;
  }, {})
}

module.exports = {
  list: listModulesTask,
  sync: syncModulesTask,
  where: whereModuleTask
};