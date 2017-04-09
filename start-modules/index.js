const loadModules = require('./lib/modules-task'),
  {readJson, mergeJson, writeJson} = require('./lib/modules-each-tasks'),
  forEach = require('./lib/foreach-task'),
  {props} = require('./lib/tasks'),
  _ = require('lodash'),
  Start = require('start').default;

function listModulesTask() {
  return () => function listModules(log, reporter) {
    return Start(reporter)(loadModules, forEach()(_.noop));
  }
}

function whereModuleTask(moduleName) {
  return () => function whereModule(log, reporter) {
    return Start(reporter)(
      loadModules,
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
    const start = Start(reporter);
    return start(
      loadModules,
      props({
        modules: modules => modules,
        modulesAndVersions: modules => modulesAndVersion(modules, mutateVersion)
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