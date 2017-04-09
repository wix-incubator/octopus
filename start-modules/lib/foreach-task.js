const Promise = require('bluebird');

module.exports = (mapInput = input => input) => fn => modulesOrOpts => {
  return function forEachModules(log) {
    return Promise.each(mapInput(modulesOrOpts), (item, index, length) => {
      log(`${item.name} (${item.relativePath}) (${index + 1}/${length})`);
      return fn(item, modulesOrOpts);
    });
  }
};