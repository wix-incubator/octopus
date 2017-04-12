const startModules = require('octopus-start-modules-tasks'),
  startTasks = require('octopus-start-tasks'),
  start = require('start').default,
  concurrent = require('start-concurrent').default;

const {iter, modules} = startModules;
const {readJson, writeJson, mergeJson} = startModules.module;

// module.exports.extraneous = () => {
// };
// module.exports.unmanaged = () => {
// };
// module.exports.latest = () => {
// };
// module.exports.where = () => {
// };
// module.exports.sync = () => {
// };

function syncDependenciesTask() {
  return () => function syncDependencies(log, reporter) {
    return start(reporter)(
      concurrent(modules.load(), startTasks.readJson('package.json')),
      startTasks.props({
        modules: inputArray => inputArray[0],
        dependencies: inputArray => asDependencies(inputArray[1])
      }),
      iter.forEach({mapInput: opts => opts.modules, silent: true})((module, input) => {
        const {dependencies} = input;
        const readPackageJson = readJson(module)('package.json');
        const writePackageJson = writeJson(module)('package.json');
        const logMerged = input => log(`${module.name}: ${input.key} (${input.currentValue} -> ${input.newValue})`);
        const mergePackageJson = mergeJson(logMerged)(dependencies);

        return start(reporter)(readPackageJson, mergePackageJson, writePackageJson);
      })
    )
  }
}
//
function asDependencies({managedDependencies, managedPeerDependencies}) {
  return {
    dependencies: managedDependencies,
    devDependencies: managedDependencies,
    peerDependencies: managedPeerDependencies
  }
}

module.exports.sync = syncDependenciesTask;