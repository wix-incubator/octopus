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
      const afterRemoval = loadedModules.filter(module => {
        return changes.find(file => file.startsWith(module.relativePath))
      });
      log(`Filtered-out ${loadedModules.length - afterRemoval.length} unchanged modules`);
      return afterRemoval;
    });
  }
};