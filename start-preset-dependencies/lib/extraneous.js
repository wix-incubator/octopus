const startModules = require('octopus-start-modules-tasks'),
  startTasks = require('octopus-start-tasks'),
  start = require('start').default,
  R = require('ramda');

const {iter, modules} = startModules;
const {readJson} = startModules.module;

function extraneousDependenciesTask() {
  return () => function extraneousDependencies(log, reporter) {
    const deps = {dependencies: {}, peerDependencies: {}};

    return start(reporter)(
      modules.load(),
      iter.async({silent: true})((module, input, asyncReporter) =>
        start(asyncReporter)(
          readJson(module)('package.json'),
          fillModulesAndDeps([], deps))
      ),
      startTasks.readJson('package.json'),
      executeExtraneous(deps)
    )
  }
}

function executeExtraneous(deps) {
  return ({managedDependencies = {}, managedPeerDependencies = {}}) => {
    return (log/*, reporter*/) => {
      cleanManagedDeps(deps, managedDependencies, managedPeerDependencies);
      logExtraneous({managedDependencies, managedPeerDependencies}, log, 'managedDependencies');
      logExtraneous({managedDependencies, managedPeerDependencies}, log, 'managedPeerDependencies');
      return rejectIfExtraneous(deps);
    };
  }
}

function logExtraneous(deps, log, key) {
  const managedDependencies = deps[key];
  const toSortedUniqKeys = R.compose(R.sort((a, b) => a.localeCompare(b)), R.uniq, R.keys);
  const modulesAndVersions = toSortedUniqKeys(managedDependencies);
  log(`Extraneous ${key}: ${modulesAndVersions.join(', ')}`);
}

function rejectIfExtraneous(deps) {
  if ((Object.keys(deps.dependencies).length + Object.keys(deps.peerDependencies).length) > 0) {
    return Promise.reject(new Error('Extraneous dependencies found, see output above'));
  } else {
    return Promise.resolve();
  }
}


function cleanManagedDeps(deps, managedDependencies, managedPeerDependencies) {
  Object.keys(deps.dependencies || {}).forEach(name => delete managedDependencies[name]);
  Object.keys(deps.devDependencies || {}).forEach(name => delete managedDependencies[name]);
  Object.keys(deps.peerDependencies || {}).forEach(name => delete managedPeerDependencies[name]);
}

function fillModulesAndDeps(innerModules, deps) {
  return packageJson => () => {
    return Promise.resolve().then(() => {
      innerModules.push(packageJson.name);
      fill(deps.dependencies)(packageJson, 'dependencies');
      fill(deps.dependencies)(packageJson, 'devDependencies');
      fill(deps.peerDependencies)(packageJson, 'peerDependencies');
    });
  };
}


function fill(deps) {
  return (packageJson, type) => {
    Object.keys(packageJson[type] || []).forEach(depKey => {
      deps[depKey] = deps[depKey] || {};
      deps[depKey][packageJson.name] = packageJson[type][depKey];
    });
  }
}


module.exports = extraneousDependenciesTask;