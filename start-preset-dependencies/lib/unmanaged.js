const startModules = require('octopus-start-modules-tasks'),
  startTasks = require('octopus-start-tasks'),
  start = require('start').default;

const {iter, modules} = startModules;
const {readJson} = startModules.module;

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
            fill(deps.dependencies)(packageJson, 'dependencies');
            fill(deps.dependencies)(packageJson, 'devDependencies');
            fill(deps.peerDependencies)(packageJson, 'peerDependencies');
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

function fill(deps) {
  return (packageJson, type) => {
    Object.keys(packageJson[type] || []).forEach(depKey => {
      deps[depKey] = deps[depKey] || {};
      deps[depKey][packageJson.name] = packageJson[type][depKey];
    });
  }
}


module.exports = unmanagedDependenciesTask;