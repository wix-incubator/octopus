const startModules = require('octopus-start-modules-tasks'),
  _ = require('lodash'),
  startTasks = require('octopus-start-tasks'),
  Start = require('start').default;

const {iter, modules} = startModules;

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
      startTasks.props({
        modules: modules => modules,
        modulesAndVersions: modules => modulesAndVersion(modules, mutateVersion)
      }),
      iter.forEach({mapInput: opts => opts.modules})((module, input) => {
          const {modulesAndVersions} = input;
          const readPackageJson = startModules.module.readJson(module)('package.json');
          const mergePackageJson = startModules.module.mergeJson({
            dependencies: modulesAndVersions,
            devDependencies: modulesAndVersions
          });
          const writePackageJson = startModules.module.writeJson(module)('package.json');

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