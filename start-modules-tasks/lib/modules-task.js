const {modules} = require('octopus-modules');

module.exports = () => {
  return function buildModules(log) {
    const loadedModules = modules();
    log(`Loaded ${loadedModules.length} modules`);
    return Promise.resolve(loadedModules);
  }
};