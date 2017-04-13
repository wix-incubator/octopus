const modules = require('octopus-modules');

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