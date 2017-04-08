const modulesTask = require('./lib/modules-task'),
  {readJson, mergeJson, writeJson} = require('./lib/modules-each-tasks'),
  forEachTask = require('./lib/foreach-task'),
  {props} = require('./lib/tasks'),
  inputConnector = require('start-input-connector').default,
  _ = require('lodash');

// function bootstrapTask() {
//   return () => start(
//     modulesTask(),
//     forEachTask(opts => opts.modules)((module, index, count, opts) => start(
//       inputConnector(module),
//       exec(module => `npm link ${module.dependencies.map(dep => path).join(' ')}`),
//       exec(module => 'npm install --cache-min=3600 && npm link')
//       )
//     )
//   )
// }
//
// function testTask() {
//   return () => start(
//     modulesTask(),
//     forEachTask(opts => opts.modules)((module, index, count, opts) => start(
//       inputConnector(module),
//       exec(module => `npm run test`)
//       )
//     )
//   )
// }
//

function syncModulesTask(start) {
  return () => start(
    modulesTask(),
    props({
      modules: modules => modules,
      modulesAndVersions: modules => modulesAndVersion(modules)
    }),
    forEachTask(opts => opts.modules)((module, index, count, opts) => start(
      readJson(module)('package.json'),
      mergeJson({
        dependencies: opts.modulesAndVersions,
        devDependencies: opts.modulesAndVersions
      }),
      writeJson(module)('package.json')
      )
    )
  )
}

function listModulesTask(start) {
  return () => start(
    modulesTask(),
    forEachTask()(_.noop)
  )
}

module.exports.tasks = {
  list: listModulesTask,
  sync: syncModulesTask
};

module.exports.inject = (start, targetModuleExports = module.exports) => {
  targetModuleExports['modules:list'] = () => listModulesTask(start);
  targetModuleExports['modules:sync'] = () => syncModulesTask(start);
};

function modulesAndVersion(modules) {
  return modules.reduce((acc, val) => {
    acc[val.name] = val.version;
    return acc;
  }, {})
}