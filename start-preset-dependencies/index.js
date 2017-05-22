const startModules = require('octopus-start-modules-tasks'),
  startTasks = require('octopus-start-tasks'),
  start = require('start').default,
  concurrent = require('start-concurrent').default;

const {iter, modules} = startModules;
const {readJson, writeJson, mergeJson} = startModules.module;

// module.exports.extraneous = () => {
// };
// module.exports.latest = () => {
// };
// module.exports.where = () => {
// };

function unmanagedDependenciesTask() {
  return () => function unmanagedDependencies(log, reporter) {
    const innerModules = [];
    const deps = {dependencies: {}, peerDependencies: {}};

    return start(reporter)(
      modules.load(),
      iter.async({silent: true})((module, input, asyncReporter) => {
        const readPackageJson = readJson(module)('package.json');
        const fillModulesAndDeps = packageJson => () => {
          return Promise.resolve().then(() => {
            innerModules.push(packageJson.name);
            Object.keys(packageJson.dependencies || []).forEach(depKey => {
              deps.dependencies[depKey] = deps.dependencies[depKey] || {};
              deps.dependencies[depKey][packageJson.name] = packageJson.dependencies[depKey];
            });
            Object.keys(packageJson.devDependencies || []).forEach(depKey => {
              deps.dependencies[depKey] = deps.dependencies[depKey] || {};
              deps.dependencies[depKey][packageJson.name] = packageJson.devDependencies[depKey];
            });
            Object.keys(packageJson.peerDependencies || []).forEach(depKey => {
              deps.peerDependencies[depKey] = deps.peerDependencies[depKey] || {};
              deps.peerDependencies[depKey][packageJson.name] = packageJson.peerDependencies[depKey];
            });
          });
        };
        return start(asyncReporter)(readPackageJson, fillModulesAndDeps);
      }),
      startTasks.readJson('package.json'),
      ({managedDependencies = {}, managedPeerDependencies = {}}) => (log/*, reporter*/) => {
        return Promise.resolve().then(() => {
          innerModules.forEach(name => delete deps.dependencies[name]);
          innerModules.forEach(name => delete deps.peerDependencies[name]);
          Object.keys(managedDependencies).forEach(name => delete deps.dependencies[name]);
          Object.keys(managedPeerDependencies).forEach(name => delete deps.peerDependencies[name]);

          console.log(deps);

          Object.keys(deps.dependencies).forEach(depKey => {
            const modulesAndVersions = Object.keys(deps.dependencies[depKey]).map(module => `${module} (${deps.dependencies[depKey][module]})`);
            log(`Unmanaged dependency ${depKey} in ${modulesAndVersions.join(', ')}`);
          });

          Object.keys(deps.peerDependencies).forEach(depKey => {
            const modulesAndVersions = Object.keys(deps.peerDependencies[depKey]).map(module => `${module} (${deps.peerDependencies[depKey][module]})`);
            log(`Unmanaged peerDependency ${depKey} in ${modulesAndVersions.join(', ')}`);
          });


          if ((Object.keys(deps.dependencies).length + Object.keys(deps.peerDependencies).length) > 0) {
            return Promise.reject(new Error('Unmanaged dependencies found, see output above'));
          } else {
            return Promise.resolve();
          }
        });
      }
    )
  }
}


function syncDependenciesTask() {
  return () => function syncDependencies(log, reporter) {
    return start(reporter)(
      concurrent(modules.load(), startTasks.readJson('package.json')),
      startTasks.props({
        modules: inputArray => inputArray[0],
        dependencies: inputArray => asDependencies(inputArray[1])
      }),
      iter.async({mapInput: opts => opts.modules, silent: true})((module, input, asyncReporter) => {
        const {dependencies} = input;
        const readPackageJson = readJson(module)('package.json');
        const writePackageJson = writeJson(module)('package.json');
        const logMerged = input => log(`${module.name}: ${input.key} (${input.currentValue} -> ${input.newValue})`);
        const mergePackageJson = mergeJson(logMerged)(dependencies);

        return start(asyncReporter)(readPackageJson, mergePackageJson, writePackageJson);
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
module.exports.unmanaged = unmanagedDependenciesTask;