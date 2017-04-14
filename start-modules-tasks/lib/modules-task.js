const modules = require('octopus-modules'),
  {execSync} = require('child_process'),
  _ = require('lodash');


module.exports.load = () => () => {
  return function loadModules(log/*, reporter*/) {
    return Promise.resolve().then(() => {
      const loadedModules = modules.modules();
      log(`Loaded ${loadedModules.length} modules`);
      return loadedModules;
    });
  }
};

module.exports.removeUnchanged = () => loadedModules => {
  return function removeUnchanged(log/*, reporter*/) {
    return Promise.resolve().then(() => {
      const afterRemoval = modules.removeUnchanged(loadedModules);
      log(`Filtered-out ${loadedModules.length - afterRemoval.length} unchanged modules`);
      return afterRemoval;
    });
  }
};

module.exports.removeGitUnchanged = branchName => loadedModules => {
  return function removeGitUnchanged(log/*, reporter*/) {
    return Promise.resolve().then(() => {
      const changes = _.compact(execSync(`git diff --name-only ${branchName}`).toString().split('\n'));
      const afterRemoval = modules.removeUnchanged(loadedModules, changes);
      log(`Filtered-out ${loadedModules.length - afterRemoval.length} unchanged modules`);
      return afterRemoval;
    });
  }
};

module.exports.removeExtraneousDependencies = () => loadedModules => {
  return function removeExtraneousDependencies(log/*, reporter*/) {
    return Promise.resolve().then(() => {
      const cloned = loadedModules.map(module => Object.assign({}, module));
      const moduleNames = new Set(cloned.map(module => module.name));

      cloned.forEach(module => {
        module.dependencies = module.dependencies.filter(dep => moduleNames.has(dep.name));
      });

      log('Cleaned extraneous dependencies');
      return cloned;
    });
  }
};